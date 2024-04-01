import { z } from "zod";

export const uploadSchema = z.object({
  localId: z.string(),
  base64: z.string(),
  roomId: z.string().optional(),
  listingIdForFeatured: z.string().optional(),
});
