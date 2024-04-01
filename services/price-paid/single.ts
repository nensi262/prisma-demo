import { createId } from "@paralleldrive/cuid2";
import csv from "csv-parser";
import { propertyFingerprint } from "home/src/app/listings/fingerprint";
import { db } from "home/src/database/client";
import { properties } from "home/src/database/schema";
import fetch from "node-fetch";
import { EventEmitter } from "node:events";
import { z } from "zod";
import { normaliseCapitalisation } from "./worker";

import fs from "fs";

let iterations = 0;
let progress = 0;
const FETCH_URL =
  "http://prod.publicdata.landregistry.gov.uk.s3-website-eu-west-1.amazonaws.com/pp-monthly-update-new-version.csv";
const OVERRIDE = null;

const events = new EventEmitter();

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

const writer = fs.createWriteStream("output.sql");

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

events.on("entry", async (data) => await handleEntry(data));

const handleEntry = async (body: object) => {
  const entry = await entrySchema.parseAsync(body);
  if (!entry) return;

  // if (entry.recordStatus === "D") {
  //   await db
  //     .delete(propertyTransactionHistory)
  //     .where(
  //       eq(propertyTransactionHistory.tuid, entry.transactionUniqueIdentifier),
  //     );
  //   return;
  // }

  // if (entry.recordStatus === "C") {
  //   await db
  //     .update(propertyTransactionHistory)
  //     .set({
  //       price: entry.price,
  //       date: entry.dateOfTransfer,
  //       postcode: entry.postcode,
  //       paon: entry.paon,
  //       saon: entry.saon,
  //       street: entry.street,
  //     })
  //     .where(
  //       eq(propertyTransactionHistory.tuid, entry.transactionUniqueIdentifier),
  //     );

  //   return;
  // }

  // let propertyId = "";

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
  } else {
    createProperty(entry);
  }

  // await db
  //   .insert(propertyTransactionHistory)
  //   .values({
  //     tuid: entry.transactionUniqueIdentifier,
  //     propertyId,
  //     price: entry.price,
  //     date: entry.dateOfTransfer,
  //     postcode: entry.postcode,
  //     paon: entry.paon,
  //     saon: entry.saon,
  //     street: entry.street,
  //   })
  //   // there should be no conflicts, but just in case this will ignore the insert
  //   .onDuplicateKeyUpdate({
  //     set: {
  //       tuid: sql`tuid`,
  //     },
  //   });

  // writer.write(insert + ";\n");

  progress++;
};

const createProperty = async (entry: z.infer<typeof entrySchema>) => {
  const id = `p_${createId()}`;

  console.log("before");
  const response = await db.insert(properties).values({
    id,
    postcode: entry.postcode,
    fingerprint: propertyFingerprint({
      postcode: entry.postcode,
      paon: entry.paon,
      street: entry.street,
      city: entry.townCity,
      saon: entry.saon,
    }),

    // latitude: postcode?.[0]?.latitude ?? null,
    // longitude: postcode?.[0]?.longitude ?? null,
    street: normaliseCapitalisation(entry.street),
    city: normaliseCapitalisation(entry.townCity),
    // habitableRooms: epc?.habitableRooms ?? null,
    paon: entry.paon,
    saon: entry.saon,
    // type: epc ? epc.propertyType : mapPropertyType || null,
    // detachment: epc
    //   ? epc.builtForm
    //   : entry.propertyType == "D"
    //   ? "DETACHED"
    //   : entry.propertyType == "S"
    //   ? "SEMI_DETACHED"
    //   : null,
    // epcLmk: epc?.lmk,
    tenure:
      entry.duration == "F"
        ? "FREEHOLD"
        : entry.duration == "L"
        ? "LEASEHOLD"
        : null,
  });
  console.log("response", response);

  return id;
};

(async () => {
  if (OVERRIDE) {
    events.emit("entry", OVERRIDE);
    return;
  }

  const response = await fetch(FETCH_URL);

  await new Promise((resolve) => {
    response.body
      ?.pipe(
        csv({
          headers: [
            "transactionUniqueIdentifier",
            "price",
            "dateOfTransfer",
            "postcode",
            "propertyType",
            "newBuild",
            "duration",
            "paon",
            "saon",
            "street",
            "locality",
            "townCity",
            "district",
            "county",
            "ppdCategoryType",
            "recordStatus",
          ],
        }),
      )
      .on("data", async (data) => {
        console.log("top", iterations);
        iterations++;
        await delay(100 * iterations);
        events.emit("entry", data);
        console.log("bottom", iterations);
      })
      .on("end", () => resolve(true));
  });
})();
