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
  propertyEpcs,
  propertyTransactionHistory,
} from "home/src/database/schema";
import { z } from "zod";
import { findEPC } from "./epc";

const entrySchema = z.object({
  transactionUniqueIdentifier: z.string(),
  price: z.coerce.number(),
  dateOfTransfer: z.coerce.date(),
  postcode: z.string(),
  propertyType: z.enum(["D", "S", "T", "F", "O"]),
  newBuild: z.enum(["Y", "N"]),
  duration: z.string(),
  paon: z.string(),
  saon: z.string(),
  street: z.string(),
  locality: z.string(),
  townCity: z.string(),
  district: z.string(),
  county: z.string(),
  ppdCategoryType: z.enum(["A", "B"]).optional(),
  recordStatus: z.enum(["A", "C", "D"]).optional(),
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
  const body = await z
    .array(entrySchema)
    .parseAsync(event.Records.map((record) => JSON.parse(record.body)))
    .catch(() => null);

  if (!body) {
    return {
      statusCode: 400,
      body: "Invalid request body",
    };
  }

  for await (const entry of body) {
    if (entry.recordStatus === "D") {
      await db
        .delete(propertyTransactionHistory)
        .where(
          eq(
            propertyTransactionHistory.tuid,
            entry.transactionUniqueIdentifier,
          ),
        );
      continue;
    }

    if (entry.recordStatus === "C") {
      await db
        .update(propertyTransactionHistory)
        .set({
          price: entry.price,
          date: entry.dateOfTransfer,
          postcode: entry.postcode,
          paon: entry.paon,
          saon: entry.saon,
          street: entry.street,
        })
        .where(
          eq(
            propertyTransactionHistory.tuid,
            entry.transactionUniqueIdentifier,
          ),
        );

      continue;
    }

    let propertyId = "";

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
        tuid: entry.transactionUniqueIdentifier,
        propertyId,
        price: entry.price,
        date: entry.dateOfTransfer,
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
  const epc = await findEPC({
    address: `${entry.saon ? `${entry.saon} ` : ""}${entry.paon} ${
      entry.street
    }`,
    postcode: entry.postcode,
  });

  if (epc) {
    await db
      .insert(propertyEpcs)
      .values({ ...epc, propertyId: id })
      .onDuplicateKeyUpdate({ set: epc });
  }

  const mapPropertyType: PropertyType = {
    D: "HOUSE",
    S: "HOUSE",
    T: "HOUSE",
    F: "FLAT",
    O: null,
  }[entry.propertyType];

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
      city: entry.townCity,
      saon: entry.saon,
    }),

    latitude: postcode?.[0]?.latitude ?? null,
    longitude: postcode?.[0]?.longitude ?? null,
    street: normaliseCapitalisation(entry.street),
    city: normaliseCapitalisation(entry.townCity),
    habitableRooms: epc?.habitableRooms ?? null,
    paon: entry.paon,
    saon: entry.saon,
    type: epc ? epc.propertyType : mapPropertyType || null,
    detachment: epc
      ? epc.builtForm
      : entry.propertyType == "D"
      ? "DETACHED"
      : entry.propertyType == "S"
      ? "SEMI_DETACHED"
      : null,
    epcLmk: epc?.lmk,
    tenure:
      entry.duration == "F"
        ? "FREEHOLD"
        : entry.duration == "L"
        ? "LEASEHOLD"
        : null,
  });

  return id;
};
