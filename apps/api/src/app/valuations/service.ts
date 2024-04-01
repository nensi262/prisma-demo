import db from "@api/database/client";
import { HTTPException } from "@api/utils/HTTPException";
import { z } from "zod";
import { generateValuationSchema } from "./schemas";
import { valueAdders } from "./value-adders";

export const generate = async (
  body: z.infer<typeof generateValuationSchema>,
) => {
  let lastSalePrice = 0;
  let lastSaleDate = new Date();
  let valuationType: "AREA" | "INDIVIDUAL" = "AREA";
  let tuidsUsed: string[] = [];

  const property = body.propertyId
    ? await db.property.findFirst({
        where: {
          id: body.propertyId,
        },
        include: {
          transactionHistory: {
            orderBy: {
              date: "desc",
            },
          },
        },
      })
    : null;

  const recentTransactions = await db.propertyTransactionHistory.findMany({
    where: {
      postcode: body.postcode,
      propertyId: {
        not: property?.id,
      },
    },
    orderBy: {
      date: "desc",
    },
    take: 6,
  });

  if (!property || property.transactionHistory.length === 0) {
    // fallback area average

    if (recentTransactions.length == 0) {
      throw new HTTPException(404, "Could not complete valuation");
    }

    const sum = recentTransactions.reduce((acc, curr) => acc + curr.price, 0);
    const avg = sum / recentTransactions.length;
    lastSalePrice = avg;

    if (recentTransactions.length == 0) {
      throw new HTTPException(400, "Could not complete valuation");
    }

    // minus 1 year from last sale date
    lastSaleDate = new Date();
    lastSaleDate.setFullYear(recentTransactions[0].date.getFullYear() - 1);
    lastSaleDate.setMonth(recentTransactions[0].date.getMonth());
    valuationType = "AREA";
    tuidsUsed = recentTransactions.map((t) => t.tuid);
  } else {
    const { date, price, tuid } = property.transactionHistory[0];
    lastSalePrice = price;
    lastSaleDate = date;
    tuidsUsed = [tuid];
    valuationType = "INDIVIDUAL";
  }

  const formattedDate =
    new Date(lastSaleDate.getFullYear(), lastSaleDate.getMonth(), 1, 1, 0, 0, 0)
      .toISOString()
      .split("T")[0] + "T00:00:00.000Z";

  const postcode = await db.postcode.findFirst({
    where: {
      postcode: body.postcode,
    },
  });

  if (!postcode) throw new HTTPException(400, "Could not complete valuation");

  const gbHpiInitial = await db.housePriceIndex.findFirst({
    where: {
      date: formattedDate,
      region:
        lastSaleDate < new Date("2004-01-01")
          ? "United Kingdom"
          : "Great Britain",
    },
    orderBy: {
      date: "asc",
    },
  });

  console.log(formattedDate);

  if (!gbHpiInitial)
    throw new HTTPException(500, "Could not complete valuation");

  let hpiInitial = await db.housePriceIndex.findFirst({
    where: {
      date: formattedDate,
      region: postcode.regionName,
    },
    orderBy: {
      date: "asc",
    },
  });

  if (!hpiInitial) hpiInitial = gbHpiInitial;

  const [hpiLatest, hpiLast] = await db.housePriceIndex.findMany({
    where: {
      region: hpiInitial.region,
    },
    orderBy: {
      date: "desc",
    },
    take: 2,
  });

  const gbHpiLatest = await db.housePriceIndex.findFirst({
    where: {
      region: gbHpiInitial.region,
    },
    orderBy: {
      date: "desc",
    },
  });

  if (!hpiLast || !hpiLatest || !gbHpiLatest)
    throw new HTTPException(500, "Could not complete valuation");

  const typeMap = (
    {
      SEMI_DETACHED: "semiDetachedIndex",
      END_TERRACE: "terracedIndex",
      MID_TERRACE: "terracedIndex",
      FLAT: "flatIndex",
      DETACHED: "detachedIndex",
      OTHER: "index",
    } as const
  )[property?.detachment || "OTHER"];

  const type = hpiLatest[typeMap] ? typeMap : "index";

  let valuation = lastSalePrice;
  let valuationLastMonth = lastSalePrice;

  const hpiChange = hpiLatest[type]! / hpiInitial[type]!;
  const hpiLastMonthChange = hpiLast[type]! / hpiInitial[type]!;

  if (body.fineTune) {
    // adjust set percentage increases for local region
    const adjustment =
      hpiInitial.region == "Great Britain"
        ? 1
        : hpiLatest.index / gbHpiLatest.index;

    body.fineTune.forEach((t) => {
      const adder = valueAdders.find((v) => v.type === t.type);
      if (adder) {
        valuation += (valuation / 100) * adder.increase * adjustment;
        valuationLastMonth +=
          (valuationLastMonth / 100) * adder.increase * adjustment;
      }
    });
  }

  valuation = valuation * hpiChange;
  valuationLastMonth = valuationLastMonth * hpiLastMonthChange;

  return {
    type: valuationType,
    tuidsUsed,
    value: Math.round(valuation / 1000) * 1000,
    prevMonthValue: Math.round(valuationLastMonth / 1000) * 1000,
    region: postcode.regionName,
    // valuation: {
    // type: valuationType,
    // lower: Math.round(valuation * 0.9),
    // upper: Math.round(valuation * 1.1),
    // monthChange: {
    //   direction: valuationLastMonth > valuation ? "down" : "up",
    //   value:
    //     valuationLastMonth > valuation
    //       ? Math.round(valuationLastMonth - valuation)
    //       : Math.round(valuation - valuationLastMonth),
    // },
    // },
    // propertyTransactions: property?.transactionHistory.map((t) => ({
    //   price: t.price,
    //   date: t.date,
    // })),
    // recentTransactions: recentTransactions.map((t) => ({
    //   date: t.date,
    //   price: t.price,
    //   line1: normaliseCapitalisation(`${t.paon} ${t.street}`),
    //   line2: normaliseCapitalisation(t.saon),
    // })),
    // coords: {
    //   lat: property?.latitude ?? postcode.latitude,
    //   lon: property?.longitude ?? postcode.longitude,
    // },
  };
};
