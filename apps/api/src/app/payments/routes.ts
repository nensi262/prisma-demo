import Router from "@koa/router";
import { enforceAuth } from "../auth/middleware";
import * as Payments from "./handlers";

const router = new Router();
router.use(enforceAuth);

router.post("/create", Payments.create);

export default router;
