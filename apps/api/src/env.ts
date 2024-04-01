import "dotenv/config";
import { z } from "zod";

const envVariables = z.object({
  DATABASE_URL: z.string(),
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
  EPC_USERNAME: z.string(),
  EPC_SECRET: z.string(),
  JWT_SECRET: z.string(),
  PORTAL_DOMAIN: z.string(),
  GETADDRESS_API_KEY: z.string(),
  OPENAI_API_KEY: z.string(),
  PROPERTY_IMAGES_BUCKET: z.string(),
  PROPERTY_IMAGES_CDN: z.string(),
});

export type EnvVariables = z.infer<typeof envVariables>;

const env = envVariables.parse(process.env);

export default env;
