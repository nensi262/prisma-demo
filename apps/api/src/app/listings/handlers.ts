import db from "@api/database/client";
import { PropertyFloorType } from "@prisma/client";
// import env from "@api/env";
import { HTTPException } from "@api/utils/HTTPException";
import { createId } from "@paralleldrive/cuid2";
import { Context } from "koa";
// import OpenAI from "openai";
import { z } from "zod";
import { addressById } from "../addresses/helpers";
import { findEPC } from "./epc";
import { propertyFingerprint } from "./fingerprint";
import {
  addPropertyDetailsSchema,
  createFloorSchema,
  createListingSchema,
  // gptDescriptionSchema,
  updateListingSchema,
  upsertRoomSchema,
} from "./schemas";

export const createListing = async (ctx: Context) => {
  const body = await createListingSchema.parseAsync(ctx.request.body);

  let address = {
    paon: "",
    saon: "",
    street: "",
    postcode: "",
    city: "",
  };

  let coords = {
    lat: 0,
    lng: 0,
  };

  if ("addressId" in body) {
    const a = await addressById(body.addressId);
    if (!a) throw new HTTPException(500);

    address = {
      paon: a.building_number,
      saon: a.sub_building_name,
      street: a.street,
      postcode: a.postcode,
      city: a.town_or_city,
    };

    coords = {
      lat: parseFloat(a.latitude),
      lng: parseFloat(a.longitude),
    };
  } else {
    // todo validate address
    address = {
      ...address,
      ...body,
    };
  }

  const fingerprint = propertyFingerprint(address);

  const property = await db.property.findFirst({
    where: {
      fingerprint,
    },
    include: {
      listings: {
        include: { user: true },
      },
    },
  });

  if (property) {
    const hasActiveListing = property.listings.find(
      (l) => !["COMPLETED", "EXPIRED"].includes(l.status),
    );

    if (hasActiveListing && hasActiveListing.user.id !== ctx.user.id) {
      throw new HTTPException(
        403,
        "This property is already listed by another user",
      );
    }

    if (hasActiveListing) {
      return ctx.json({
        listingId: hasActiveListing.id,
      });
    }

    const listing = await db.listing.create({
      data: {
        id: `list_${createId()}`,
        property: {
          connect: {
            id: property.id,
          },
        },
        user: {
          connect: {
            id: ctx.user.id,
          },
        },
      },
    });

    return ctx.json({
      listingId: listing.id,
    });
  }

  const epc = await findEPC({
    address: `${address.saon} ${address.paon} ${address.street}`,
    postcode: address.postcode,
  });

  const txn = await db.$transaction(async (tx) => {
    const property = await tx.property.create({
      data: {
        id: `prop_${createId()}`,
        fingerprint,
        habitableRooms: epc?.habitableRooms ?? null,
        postcode: address.postcode,
        city: address.city,
        street: address.street,
        latitude: coords.lat,
        longitude: coords.lng,
        paon: address.paon,
        saon: address.saon,
        type: epc?.propertyType,
        detachment: epc?.builtForm,
        floors: {
          create: {
            id: `pf_${createId()}`,
            type: "GROUND",
          },
        },
      },
    });

    const listing = await tx.listing.create({
      data: {
        id: `l_${createId()}`,
        property: {
          connect: {
            id: property.id,
          },
        },
        user: {
          connect: {
            id: ctx.user.id,
          },
        },
      },
    });

    if (epc) {
      await tx.propertyEpc.create({
        data: {
          ...epc,
          property: {
            connect: {
              id: property.id,
            },
          },
        },
      });
    }

    return { propertyId: property.id, listingId: listing.id };
  });

  return ctx.json(txn);
};

export const getById = async (ctx: Context) => {
  const listing = await db.listing.findFirst({
    where: {
      id: ctx.params.id,
    },
    include: {
      property: {
        include: {
          epcs: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
          rooms: {
            include: {
              images: {
                orderBy: {
                  createdAt: "desc",
                },
              },
            },
          },
          images: {
            orderBy: {
              createdAt: "desc",
            },
          },
          floors: {
            include: {
              rooms: {
                include: {
                  images: {
                    orderBy: {
                      createdAt: "desc",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!listing) throw new HTTPException(404);

  return ctx.json(listing);
};

export const addPropertyDetails = async (ctx: Context) => {
  const body = await addPropertyDetailsSchema.parseAsync(ctx.request.body);

  await db.listing.update({
    where: {
      id: ctx.params.id,
    },
    data: {
      property: {
        update: {
          type: body.type,
          detachment: body.detachment,
          tenure: body.tenure,
        },
      },
    },
  });

  return ctx.json({ success: true });
};

export const createFloor = async (ctx: Context) => {
  const { type } = await createFloorSchema.parseAsync(ctx.request.body);

  const listing = await db.listing.findFirst({
    where: {
      id: ctx.params.id,
    },
    include: {
      property: {
        include: {
          floors: true,
        },
      },
    },
  });

  if (listing?.property.floors.find((floor) => floor.type == type) || !listing)
    throw new HTTPException(400);

  await db.propertyFloor.create({
    data: {
      id: `pf_${createId()}`,
      type,
      property: {
        connect: {
          id: listing.propertyId,
        },
      },
    },
  });

  return ctx.json({ success: true });
};

export const deleteFloor = async (ctx: Context) => {
  await db.propertyFloor.delete({
    where: {
      id: ctx.params.floorId,
    },
  });

  return ctx.json({ success: true });
};

export const upsertRoom = async (ctx: Context) => {
  const body = await upsertRoomSchema.parseAsync(ctx.request.body);

  const { type, id, roomId } = await z
    .object({
      type: z.nativeEnum(PropertyFloorType),
      id: z.string(),
      roomId: z.string(),
    })
    .parseAsync(ctx.params);

  const listing = await db.listing.findFirst({
    where: {
      id: ctx.params.id,
    },
    include: {
      property: {
        include: {
          floors: true,
        },
      },
    },
  });

  if (!listing) throw new HTTPException(404);

  const floor = listing?.property.floors.find(
    (floor) => floor.type == ctx.params.type,
  );

  const updated = await db.listing.update({
    where: {
      id,
    },
    data: {
      property: {
        update: {
          floors: {
            upsert: {
              create: {
                id: `pf_${createId()}`,
                type,
              },
              update: {
                rooms: {
                  upsert: {
                    create: {
                      id: `pr_${createId()}`,
                      name: body.name,
                      type: body.type,
                      ensuite: body.ensuite,
                      property: {
                        connect: {
                          id: listing.propertyId,
                        },
                      },
                    },
                    update: {
                      name: body.name,
                      type: body.type,
                      ensuite: body.ensuite,
                    },
                    where: {
                      id: roomId,
                    },
                  },
                },
              },
              where: {
                id: floor?.id,
              },
            },
          },
        },
      },
    },
    include: {
      property: {
        include: {
          rooms: {
            include: {
              images: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      },
    },
  });

  return ctx.json(updated.property.rooms[0]);
};

export const deleteRoom = async (ctx: Context) => {
  await db.propertyRoom.delete({
    where: {
      id: ctx.params.roomId,
    },
  });

  return ctx.json({ success: true });
};

export const getRoom = async (ctx: Context) => {
  const room = await db.propertyRoom.findFirst({
    where: {
      id: ctx.params.roomId,
    },
    include: {
      images: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  return ctx.json(room);
};

export const myListings = async (ctx: Context) => {
  const listings = await db.listing.findMany({
    where: {
      userId: ctx.user.id,
    },
    include: {
      property: {
        include: {
          rooms: true,
        },
      },
    },
  });

  return ctx.json(listings);
};

// export const gptDescription = async (ctx: Context) => {
//   const body = await gptDescriptionSchema.parseAsync(ctx.request.body);

//   const property = await db.query.properties.findFirst({
//     where: sql`id in (select property_id from ${listings} where id = ${ctx.params.id})`,
//     with: {
//       floors: {
//         with: {
//           rooms: true,
//         },
//       },
//       rooms: true,
//     },
//   });

//   if (!property) throw new HTTPException(404);

//   const bedsCount = property.rooms.filter(
//     (room) => room.type == "BEDROOM",
//   ).length;
//   const bathsCount = property.rooms.filter(
//     (room) => room.type == "BATHROOM",
//   ).length;

//   const floorDescriptors = property.floors.map((floor, i) => {
//     let string = `Floor ${i}\n`;
//     const rooms = floor.rooms.map(
//       (room) =>
//         `${room.type} - ${room.width}x${room.length} ${
//           room.ensuite ? "(ensuite)" : ""
//         }`,
//     );
//     string = string + rooms.join("\n");

//     return string;
//   });

//   const openai = new OpenAI({
//     apiKey: env.OPENAI_API_KEY,
//     timeout: 20 * 1000,
//   });

//   const completion = await openai.chat.completions.create({
//     messages: [
//       {
//         role: "assistant",
//         content: `Help my customer generate a ${
//           body.type
//         } for selling their property on our real estate agency website, but don't mention the real estate agency - everything is self-service. Omit the country from anything you create, we are only based in the UK. Add in line-breaks where necessary/possible to break up big chunks. If you are provided with content the customer has already provided about their property, either leave it as it is if it's suitable or incorporate it into your answer. ### ${
//           body.customerProvided
//             ? `The customer provided the following description: ${body.customerProvided}`
//             : ""
//         } Their property is a ${bedsCount} bed, ${bathsCount} baths, ${
//           property.detachment
//         } ${property.type}. Situated in ${property.city}, UK on ${
//           property.street
//         }. The property has ${property.floors.length} floors.
//             ${floorDescriptors.join("\n\n")}`,
//       },
//     ],
//     model: "gpt-3.5-turbo",
//     n: body.type == "description" ? 2 : 1,
//     user: ctx.user.id,
//   });

//   return ctx.json(completion.choices);
// };

export const updateListing = async (ctx: Context) => {
  const body = await updateListingSchema.parseAsync(ctx.request.body);

  await db.listing.update({
    where: {
      id: ctx.params.id,
    },
    data: {
      title: body.title,
      description: body.description,
    },
  });

  return ctx.json({ success: true });
};

export const acceptTerms = async (ctx: Context) => {
  await db.listing.update({
    where: {
      id: ctx.params.id,
    },
    data: {
      termsAcceptedAt: new Date(),
    },
  });

  return ctx.json({ success: true });
};
