import { createId } from "@paralleldrive/cuid2";
import type { APIGatewayProxyResultV2, SQSEvent } from "aws-lambda";
import "dotenv/config";
import { eq, sql } from "drizzle-orm";
import { propertyFingerprint } from "home/src/app/listings/fingerprint";
import { db } from "home/src/database/client";
import {
  PropertyType,
  postcodes,
  properties,
  propertyTransactionHistory,
} from "home/src/database/schema";
import { z } from "zod";

const entrySchema = z.object({
  tuid: z.string(),
  price: z.coerce.number(),
  date: z.coerce.date(),
  postcode: z.string(),
  type: z.enum(["D", "S", "T", "F", "O"]),
  newBuild: z.enum(["Y", "N"]),
  tenure: z.string(),
  paon: z.string(),
  saon: z.string(),
  street: z.string(),
  city: z.string(),
});

export const normaliseCapitalisation = (str: string) => {
  const lower = str.toLowerCase();
  const words = lower.split(" ");
  const capitalized = words.map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1),
  );
  return capitalized.join(" ");
};

export const handler = async (
  event: SQSEvent,
): Promise<APIGatewayProxyResultV2> => {
  console.log("hit handler");
  const entries = JSON.parse(event.Records[0].body);
  const body = await z
    .array(entrySchema)
    .parseAsync(entries)
    .catch(() => null);

  if (!body) {
    return {
      statusCode: 400,
      body: "Invalid request body",
    };
  }

  let propertyId = "";

  for await (const entry of body) {
    const existing = await db.query.properties.findFirst({
      where: (properties, { and, eq, or }) =>
        and(
          eq(properties.postcode, entry.postcode),
          eq(properties.paon, entry.paon),
          entry.saon ? eq(properties.saon, entry.saon) : undefined,
          eq(properties.street, entry.street),
        ),
    });

    if (existing) {
      propertyId = existing.id;
    } else {
      propertyId = await createProperty(entry);
    }

    await db
      .insert(propertyTransactionHistory)
      .values({
        tuid: entry.tuid,
        propertyId,
        price: entry.price,
        date: entry.date,
        postcode: entry.postcode,
        paon: entry.paon,
        saon: entry.saon,
        street: entry.street,
      })
      // there should be no conflicts, but just in case this will ignore the insert
      .onDuplicateKeyUpdate({
        set: {
          tuid: sql`tuid`,
        },
      });
  }

  return {
    statusCode: 200,
  };
};

const createProperty = async (entry: z.infer<typeof entrySchema>) => {
  const id = `p_${createId()}`;
  // check for epc for property
  // const epc = await findEPC({
  //   address: `${entry.saon ? `${entry.saon} ` : ""}${entry.paon} ${
  //     entry.street
  //   }`,
  //   postcode: entry.postcode,
  // });

  // if (epc) {
  //   await db
  //     .insert(propertyEpcs)
  //     .values({ ...epc, propertyId: id })
  //     .onDuplicateKeyUpdate({ set: epc });
  // }

  const mapPropertyType: PropertyType = {
    D: "HOUSE",
    S: "HOUSE",
    T: "HOUSE",
    F: "FLAT",
    O: null,
  }[entry.type];

  const postcode = await db
    .select({ latitude: postcodes.latitude, longitude: postcodes.longitude })
    .from(postcodes)
    .where(eq(postcodes.postcode, entry.postcode))
    .limit(1)
    .execute();

  await db.insert(properties).values({
    id,
    postcode: entry.postcode,
    fingerprint: propertyFingerprint({
      postcode: entry.postcode,
      paon: entry.paon,
      street: entry.street,
      city: entry.city,
      saon: entry.saon,
    }),

    latitude: postcode?.[0]?.latitude ?? null,
    longitude: postcode?.[0]?.longitude ?? null,
    street: normaliseCapitalisation(entry.street),
    city: normaliseCapitalisation(entry.city),
    // habitableRooms: epc?.habitableRooms ?? null,
    paon: entry.paon,
    saon: entry.saon,
    type: mapPropertyType || null,
    detachment:
      entry.type == "D"
        ? "DETACHED"
        : entry.type == "S"
        ? "SEMI_DETACHED"
        : null,

    // epcLmk: epc?.lmk,
    tenure:
      entry.tenure == "F"
        ? "FREEHOLD"
        : entry.tenure == "L"
        ? "LEASEHOLD"
        : null,
  });

  return id;
};
