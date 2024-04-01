import { User } from "@prisma/client";
import { Context } from "koa";
import { ZodType, z } from "zod";

import * as addresses from "./src/app/addresses/handlers";
import * as auth from "./src/app/auth/handlers";
import * as authSchema from "./src/app/auth/schemas";
import * as listings from "./src/app/listings/handlers";
import * as listingsSchema from "./src/app/listings/schemas";
import * as payments from "./src/app/payments/handlers";
import * as paymentsSchema from "./src/app/payments/schemas";
import * as propertyImages from "./src/app/property-images/handlers";
import * as propertyImagesSchema from "./src/app/property-images/schemas";
import * as valuations from "./src/app/valuations/handlers";
import * as valuationsSchema from "./src/app/valuations/schemas";

type Custom = {
  user: User;
  params: Record<string, string>;
  json: <T>(json: T) => T;
};

declare module "koa" {
  interface Context extends Custom {}
  interface DefaultContext extends Custom {}
  interface Request {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body?: any;
  }
}
const handlers = {
  auth,
  addresses,
  listings,
  payments,
  propertyImages,
  valuations,
};

const schemas = {
  auth: authSchema,
  listings: listingsSchema,
  payments: paymentsSchema,
  propertyImages: propertyImagesSchema,
  valuations: valuationsSchema,
};

type InferHandlerReturnType<H> = H extends (ctx: Context) => Promise<infer R>
  ? R
  : never;

type InferHandlers<Handlers> = {
  [Key in keyof Handlers]: Handlers[Key] extends object
    ? {
        [SubKey in keyof Handlers[Key]]: InferHandlerReturnType<
          Handlers[Key][SubKey]
        >;
      }
    : boolean;
};

type InferSchemas<Schemas> = {
  [Key in keyof Schemas]: Schemas[Key] extends object
    ? {
        [SubKey in keyof Schemas[Key]]: Schemas[Key][SubKey] extends ZodType
          ? z.infer<Schemas[Key][SubKey]>
          : never;
      }
    : boolean;
};

export type Schemas = InferSchemas<typeof schemas>;
export type Handlers = InferHandlers<typeof handlers>;

export type L = Handlers["listings"]["getById"];

export type {
  PropertyDetachment,
  PropertyFloorType,
  PropertyRoomType,
  PropertyTenure,
  PropertyType,
} from "@prisma/client";
