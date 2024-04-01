import { drizzle } from "drizzle-orm/mysql2";
import { chunk, simpleChunk } from "./chunker";

import { createId } from "@paralleldrive/cuid2";
import { and, eq, sql } from "drizzle-orm";
import { propertyFingerprint } from "home/src/app/listings/fingerprint";
import { db } from "home/src/database/client";
import {
  PropertyType,
  postcodes,
  properties,
  propertyTransactionHistory,
} from "home/src/database/schema";
import { createPool } from "mysql2";
import { z } from "zod";
import { normaliseCapitalisation } from "./worker";

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

const ppdConnection = createPool(process.env.DATA_DATABASE_URL as string);
const ppdDb = drizzle(ppdConnection);
const EST_TOTAL_RECORDS = 28835503;
let processed = 0;

export const handler = async () => {
  await chunk(500, async ({ cursor, setActive, setCursor, limit }) => {
    const data = await ppdDb
      .select({
        tuid: sql`tuid`,
        price: sql`price`,
        date: sql`date`,
        postcode: sql`postcode`,
        type: sql`type`,
        newBuild: sql`newbuild`,
        tenure: sql`tenure`,
        paon: sql`paon`,
        saon: sql`saon`,
        street: sql`street`,
        city: sql`a`,
      })
      .from(sql`ppd`)
      .orderBy(sql`tuid`)
      .where(sql`tuid > ${cursor}`)
      .limit(limit);

    if (data.length === 0) {
      setActive(false);
      return;
    }

    setCursor(data[data.length - 1]?.tuid as string);

    const body = await z.array(entrySchema).parseAsync(data);

    await simpleChunk(body, 5, async (chunk) => {
      await Promise.all(
        chunk.map(async (entry) => {
          console.log(
            "processed",
            processed++,
            "of",
            EST_TOTAL_RECORDS,
            entry.tuid,
          );

          let propertyId = "";
          const existing = await db
            .select({
              id: properties.id,
            })
            .from(properties)
            .where(
              and(
                eq(properties.postcode, entry.postcode),
                eq(properties.paon, entry.paon),
                entry.saon ? eq(properties.saon, entry.saon) : undefined,
                eq(properties.street, entry.street),
              ),
            )
            .limit(1)
            .execute();

          if (existing.length === 1) {
            propertyId = existing[0].id;
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
        }),
      );
    });
  });
};

export const createProperty = async (entry: z.infer<typeof entrySchema>) => {
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

handler();
