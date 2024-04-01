import { z } from "zod";

export const loginSchema = z.object({
  next: z.string().optional(),
  email: z.string().email(),
  clientCode: z.string(),
});

export const verifySchema = z
  .object({
    email: z.string().email(),
    clientCode: z.string().optional(),
  })
  .and(
    z.union([
      z.object({ code: z.number().int() }),
      z.object({ token: z.string() }),
    ]),
  );

export const registerSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "womp",
    })
    .email(),
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name is required"),
  phone: z
    .string()
    .regex(
      /^(?:\+44\s?|0)7(?:\d\s?){8}\d$/,
      "Phone number should be a valid UK number",
    )
    .optional(),
  acceptsMarketing: z.boolean().optional().default(false),
  clientCode: z.string(),
});
