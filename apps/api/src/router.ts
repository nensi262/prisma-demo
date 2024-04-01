import Router from "@koa/router";
import { default as AddressRouter } from "./app/addresses/routes";
import { default as AuthRouter } from "./app/auth/routes";
import { default as HookRouter } from "./app/hooks/routes";
import { default as ListingRouter } from "./app/listings/routes";
import { default as PaymentRouter } from "./app/payments/routes";
import { default as PropertyImageRouter } from "./app/property-images/routes";
import { default as ValuationRouter } from "./app/valuations/routes";

const router = new Router();

router.use("/auth", AuthRouter.routes(), AuthRouter.allowedMethods());
router.use("/listings", ListingRouter.routes(), ListingRouter.allowedMethods());
router.use(
  "/addresses",
  AddressRouter.routes(),
  AddressRouter.allowedMethods(),
);
router.use("/hooks", HookRouter.routes(), HookRouter.allowedMethods());
router.use("/payments", PaymentRouter.routes(), PaymentRouter.allowedMethods());

router.use(
  "/properties/:id/images",
  PropertyImageRouter.routes(),
  PropertyImageRouter.allowedMethods(),
);

router.use(
  "/valuations",
  ValuationRouter.routes(),
  ValuationRouter.allowedMethods(),
);

export default router;
