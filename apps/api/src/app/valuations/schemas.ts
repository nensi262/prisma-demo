import { z } from "zod";
import { valueAdders } from "./value-adders";

const postcodeRefine = (val: string) => {
  const parts = val.match(/^([A-Z]{1,2}\d{1,2}[A-Z]?)\s*(\d[A-Z]{2})$/i);

  return parts ? true : false;
};

const postcodeTransform = (val: string) => {
  const parts = val.match(/^([A-Z]{1,2}\d{1,2}[A-Z]?)\s*(\d[A-Z]{2})$/i);
  if (!parts) return val;

  parts.shift();
  return parts.join(" ").toUpperCase();
};

export const fineTuneValuationSchema = z
  .array(
    z.object({
      type: z
        .string()
        .refine((type) => valueAdders.map((v) => v.type).includes(type), {
          message: "Invalid type",
        }),
    }),
  )
  .transform((value, ctx) => {
    // limit type: x to one of each occurrence
    const seen = new Set();
    const result = value.filter((item) => {
      if (seen.has(item.type)) {
        ctx.addIssue({
          code: "custom",
          message: "Duplicate type",
          path: [],
        });
        return false;
      }
      seen.add(item.type);
      return true;
    });
    return result;
  });

export const generateValuationSchema = z.object({
  propertyId: z.string().optional(),
  postcode: z
    .string()
    .refine(postcodeRefine, { message: "Postcode must be standard UK format" })
    .transform(postcodeTransform),
  bedrooms: z.number().optional(),
  fineTune: fineTuneValuationSchema.optional(),
});

export const generatePublicValuationSchema = generateValuationSchema.merge(
  z.object({
    email: z.string(),
    name: z.string(),
    marketing: z.boolean().default(false),
  }),
);

export const postcodeSchema = z.object({
  postcode: z
    .string()
    .refine(postcodeRefine, { message: "Postcode must be standard UK format" })
    .transform(postcodeTransform),
});
