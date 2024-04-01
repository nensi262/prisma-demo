import Router from "@koa/router";
import * as Auth from "./handlers";
import { enforceAuth } from "./middleware";

const router = new Router();

router.post("/login", Auth.login);

router.post("/verify", Auth.verify);

router.post("/register", Auth.register);

router.get("/me", enforceAuth, Auth.me);

export default router;
