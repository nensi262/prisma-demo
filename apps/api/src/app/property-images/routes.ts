import Router from "@koa/router";
import { deleteImage, uploadBase64 } from "./handlers";

const router = new Router();

router.post("/", uploadBase64);
router.delete("/:imageId", deleteImage);

export default router;
