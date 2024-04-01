import { z } from "zod";

export const createListingPaymentSchema = z.object({
  listingId: z.string(),
});
