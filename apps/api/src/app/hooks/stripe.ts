import db from "@api/database/client";
import env from "@api/env";
import { HTTPException } from "@api/utils/HTTPException";
import { Context } from "koa";
import Stripe from "stripe";

export const handleStripeWebhook = async (ctx: Context) => {
  const { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } = env;

  const stripe = new Stripe(STRIPE_SECRET_KEY as string, {
    apiVersion: "2023-10-16",
  });

  const data = ctx.request.rawBody;

  const signature = ctx.request.header["stripe-signature"];

  if (!signature) {
    throw new HTTPException(401);
  }

  const event = await stripe.webhooks.constructEventAsync(
    data,
    signature,
    STRIPE_WEBHOOK_SECRET,
  );

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      await db.payment.update({
        where: {
          paymentIntentId: paymentIntent.id,
        },
        data: {
          status: "SUCCEEDED",
          paidAt: new Date(paymentIntent.created * 1000),
        },
      });

      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      await db.payment.update({
        where: {
          paymentIntentId: paymentIntent.id,
        },
        data: {
          status: "DECLINED",
          paidAt: new Date(paymentIntent.created * 1000),
        },
      });

      break;
    }
  }

  return { status: "OK" };
};
