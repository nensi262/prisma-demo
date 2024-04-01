import {
  PropertyDetachment,
  PropertyFloorType,
  PropertyRoomType,
  PropertyTenure,
  PropertyType,
} from "@prisma/client";
import { z } from "zod";

export const createListingSchema = z.union([
  z.object({
    addressId: z.string(),
  }),
  z.object({
    paon: z.string(),
    saon: z.string().optional(),
    street: z.string(),
    city: z.string(),
    postcode: z
      .string()
      .refine(
        (val) => {
          const parts = val.match(
            /^([A-Z]{1,2}\d{1,2}[A-Z]?)\s*(\d[A-Z]{2})$/i,
          );

          return parts ? true : false;
        },
        { message: "Postcode must be standard UK format" },
      )
      .transform((val) => {
        const parts = val.match(/^([A-Z]{1,2}\d{1,2}[A-Z]?)\s*(\d[A-Z]{2})$/i);
        if (!parts) return val;

        parts.shift();
        return parts.join(" ").toUpperCase();
      }),
  }),
]);

export const addPropertyDetailsSchema = z.object({
  type: z.nativeEnum(PropertyType),
  detachment: z.nativeEnum(PropertyDetachment),
  tenure: z.nativeEnum(PropertyTenure),
});

export const createFloorSchema = z.object({
  type: z.nativeEnum(PropertyFloorType),
});

export const upsertRoomSchema = z.object({
  type: z.nativeEnum(PropertyRoomType),
  name: z.string(),
  ensuite: z.boolean().optional(),
});

export const upsertRoomParamsSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(PropertyFloorType),
});

export const gptDescriptionSchema = z.object({
  type: z.enum(["description", "title"]),
  customerProvided: z.string().optional(),
});

export const updateListingSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(10),
});
