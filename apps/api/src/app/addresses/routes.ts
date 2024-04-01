import Router from "@koa/router";
import { enforceAuth } from "../auth/middleware";
import { search } from "./handlers";

const router = new Router();
router.use(enforceAuth);

router.post("/search", search);

export default router;
