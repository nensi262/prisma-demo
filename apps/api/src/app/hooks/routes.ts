import Router from "@koa/router";
import { handleStripeWebhook } from "./stripe";

const router = new Router();

router.post("/stripe", handleStripeWebhook);

export default router;
