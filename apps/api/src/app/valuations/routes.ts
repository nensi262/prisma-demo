import Router from "@koa/router";
import {
  fineTuneValuation,
  generateValuation,
  getValueAdders,
  inPostcode,
  retrieveValuation,
} from "./handlers";

const router = new Router();

router.post("/", generateValuation);
router.get("/value-adders", getValueAdders);
router.get("/postcode/:postcode", inPostcode);
router.get("/:id", retrieveValuation);
router.patch("/:id", fineTuneValuation);

export default router;
