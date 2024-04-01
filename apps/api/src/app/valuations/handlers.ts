import db from "@api/database/client";
import { HTTPException } from "@api/utils/HTTPException";
import { normaliseCapitalisation } from "@api/utils/strings";
import { createId } from "@paralleldrive/cuid2";
import { Context } from "koa";
import { z } from "zod";
import {
  fineTuneValuationSchema,
  generatePublicValuationSchema,
  postcodeSchema,
} from "./schemas";
import { generate } from "./service";
import { valueAdders } from "./value-adders";

export const generateValuation = async (ctx: Context) => {
  const body = await generatePublicValuationSchema.parseAsync(ctx.request.body);

  const result = await generate(body);

  if (!result) throw new HTTPException(500, "Couldn't generate valuation");

  const valuation = await db.propertyValuation.create({
    data: {
      id: `pval_${createId()}`,
      type: result.type,
      user: ctx.user
        ? {
            connect: {
              id: ctx.user?.id,
            },
          }
        : undefined,
      property: body.propertyId
        ? {
            connect: {
              id: body.propertyId,
            },
          }
        : undefined,
      date: new Date(),
      valuation: result.value,
      valuationLastMonth: result.prevMonthValue,
      tuidsUsed: result.tuidsUsed,
      postcode: body.postcode,
      region: result.region,
    },
  });

  return ctx.json({
    id: valuation.id,
  });
};

export const fineTuneValuation = async (ctx: Context) => {
  const { id } = await z
    .object({
      id: z.string(),
    })
    .parseAsync(ctx.params);

  const valuation = await db.propertyValuation.findFirst({
    where: {
      id,
    },
  });

  if (!valuation) throw new HTTPException(404, "Valuation not found");

  const fineTune = await fineTuneValuationSchema.parseAsync(ctx.request.body);

  const result = await generate({
    postcode: valuation.postcode,
    fineTune,
    propertyId: valuation.propertyId || undefined,
  });

  const updated = await db.propertyValuation.update({
    where: {
      id,
    },
    data: {
      valuation: result.value,
      tuidsUsed: result.tuidsUsed,
    },
  });

  return ctx.json({
    value: {
      actual: updated.valuation,
      min: updated.valuation * 0.9,
      max: updated.valuation * 1.1,
    },
    fineTunes: [],
  });
};

export const retrieveValuation = async (ctx: Context) => {
  const valuation = await db.propertyValuation.findFirst({
    where: {
      id: ctx.params.id,
    },
    include: {
      property: {
        include: {
          transactionHistory: {
            orderBy: {
              date: "desc",
            },
          },
        },
      },
    },
  });

  if (!valuation) throw new HTTPException(404, "Valuation not found");

  const recentTransactions = await db.propertyTransactionHistory.findMany({
    where: {
      postcode: valuation.postcode,
      propertyId: {
        not: valuation.property?.id,
      },
      date: {
        lte: valuation.date,
      },
    },
    orderBy: {
      date: "desc",
    },
    take: 6,
    select: {
      paon: true,
      street: true,
      date: true,
      price: true,
    },
  });

  return ctx.json({
    id: valuation.id,
    type: valuation.type,
    value: {
      actual: valuation.valuation,
      min: valuation.valuation * 0.9,
      max: valuation.valuation * 1.1,
    },

    prevMonthValue: valuation.valuationLastMonth,
    property: valuation.property
      ? {
          id: valuation.property.id,
          line1: `${valuation.property.paon} ${valuation.property.street}`,
          line2: valuation.property.saon,
          type: valuation.property.type,
          tenure: valuation.property.tenure,
          detachment: valuation.property.detachment,
          transactionHistory: valuation.property.transactionHistory.map(
            (t) => ({
              date: t.date,
              price: t.price,
            }),
          ),
        }
      : null,

    // recent transactions up to valuation date
    transactionsInPostcode: recentTransactions.map((t) => ({
      line1: normaliseCapitalisation(`${t.paon} ${t.street}`),
      date: t.date,
      price: t.price,
    })),

    fineTunes: [],

    postcode: valuation.postcode,
    region: valuation.region,
    lastSalePrice: valuation.property?.transactionHistory[0]?.price,
    lastSaleDate: valuation.property?.transactionHistory[0]?.date,
  });
};

export const inPostcode = async (ctx: Context) => {
  const { postcode } = await postcodeSchema.parseAsync(ctx.params);

  const properties = await db.property.findMany({
    where: {
      postcode,
    },
  });

  return ctx.json(
    properties
      .map((p) => ({
        id: p.id,
        line1: `${p.paon} ${p.street}`,
        line2: p.saon,
      }))
      .sort((a, b) =>
        a.line1.localeCompare(b.line1, undefined, { numeric: true }),
      ),
  );
};

export const getValueAdders = async (ctx: Context) => {
  return ctx.json(valueAdders.map((v) => ({ type: v.type, name: v.name })));
};
