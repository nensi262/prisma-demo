import db from "@api/database/client";
import env from "@api/env";
import { HTTPException } from "@api/utils/HTTPException";
import { createId } from "@paralleldrive/cuid2";
import { Context } from "koa";
import Stripe from "stripe";
import { createListingPaymentSchema } from "./schemas";

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export const create = async (ctx: Context) => {
  const amount = 25000;

  const { listingId } = await createListingPaymentSchema.parseAsync(
    ctx.request.body,
  );

  const listing = await db.listing.findFirst({
    where: {
      id: listingId,
    },
  });

  if (!listing) throw new HTTPException(404);

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "gbp",
    metadata: {
      listing_id: listingId,
      user_id: listing.userId,
    },
  });

  const payment = await db.payment.create({
    data: {
      id: `pay_${createId()}`,
      amount,
      paymentIntentId: paymentIntent.id,
      listing: {
        connect: {
          id: listingId,
        },
      },
    },
  });

  return ctx.json({
    id: payment.id,
    amount,
    secret: paymentIntent.client_secret,
  });
};
