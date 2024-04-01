import fs from "fs";
import { resolve } from "path";
import db from "../client";

type JSON = {
  date: string;
  region: string;
  index: number;
  detached_index: number;
  semi_detached_index: number;
  terraced_index: number;
  flat_index: number;
};

export const hpiSeeder = async () => {
  const data: JSON[] = JSON.parse(
    fs.readFileSync(
      resolve("src/database/seeds/house-price-index-dec23.json"),
      "utf-8",
    ),
  );

  const trimmed = data.map((d) => ({
    ...d,
    flatIndex: d.flat_index,
    semiDetachedIndex: d.semi_detached_index,
    detachedIndex: d.detached_index,
    terracedIndex: d.terraced_index,
    date: new Date(d.date),
  }));

  await db.housePriceIndex.createMany({
    data: trimmed,
  });
};

hpiSeeder();
