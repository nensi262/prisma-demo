import Router from "@koa/router";
import { enforceAuth } from "../auth/middleware";
import {
  acceptTerms,
  addPropertyDetails,
  createFloor,
  createListing,
  deleteFloor,
  deleteRoom,
  getById,
  getRoom,
  // gptDescription,
  myListings,
  updateListing,
  upsertRoom,
} from "./handlers";
import { enforceListingOwner } from "./middleware";

const router = new Router();

const sellerFlow = new Router();
sellerFlow.use(enforceAuth);
sellerFlow.use(enforceListingOwner);

sellerFlow.get("/my", myListings);

sellerFlow.post("/", createListing);
sellerFlow.get("/:id", getById);
sellerFlow.post("/:id/details", addPropertyDetails);
sellerFlow.post("/:id/floors", createFloor);
sellerFlow.delete("/:id/floors/:floorId", deleteFloor);

// roomId can be null if the room is new
sellerFlow.put("/:id/floors/:type/rooms/:roomId", upsertRoom);
sellerFlow.delete("/:id/rooms/:roomId", deleteRoom);
sellerFlow.get("/:id/rooms/:roomId", getRoom);

// sellerFlow.post("/:id/gpt/description", gptDescription);

sellerFlow.patch("/:id", updateListing);

sellerFlow.post("/:id/terms", acceptTerms);

router.use("/seller", sellerFlow.routes(), sellerFlow.allowedMethods());

export default router;
