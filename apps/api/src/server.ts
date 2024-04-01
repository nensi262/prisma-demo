import router from "@api/router";
import { errorHandler } from "@api/utils/error-handler";
import { bodyParser } from "@koa/bodyparser";
import { User } from "@prisma/client";
import * as Sentry from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";
import "dotenv/config";
import Koa, { Context } from "koa";
import ServerlessHttp from "serverless-http";
import SuperJSON from "superjson";
import { userAuth } from "./app/auth/middleware";
import EventEmitter from "./utils/event-emitter";

// Context types and overwriting
type Custom = {
  user: User;
  params: Record<string, string>;
  events: EventEmitter;
  json: <T>(json: T) => T;
};

declare module "koa" {
  interface Context extends Custom {}
  interface DefaultContext extends Custom {}
}

const app = new Koa();

Sentry.init({
  dsn: "https://6027c6f3e6e8462858a700d4ae21fbbe@o4506765185712128.ingest.sentry.io/4506768884563968",
  integrations: [
    ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
    new ProfilingIntegration(),
  ],
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV !== "development",
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

app.on("error", (err, ctx: Context) => {
  console.log("app error", err);
  Sentry.withScope((scope) => {
    scope.addEventProcessor((event) => {
      return Sentry.addRequestDataToEvent(event, ctx.request);
    });
    Sentry.captureException(err);
  });
});

app.use(async (ctx, next) => {
  console.log("running");
  ctx.res.setHeader("Access-Control-Allow-Origin", "*");
  ctx.res.setHeader("Access-Control-Allow-Headers", "*");
  ctx.res.setHeader("Access-Control-Allow-Methods", "*");

  ctx.json = <T>(json: T) => {
    ctx.res.setHeader("Content-Type", "application/json");
    ctx.body = SuperJSON.serialize(json);
    return json;
  };

  ctx.events = new EventEmitter();

  await next();
});

app.use(userAuth);

app.use(bodyParser());

app.use(errorHandler);

app.use(router.routes()).use(router.allowedMethods());

if (process.env.NODE_ENV === "development") {
  app.listen(4000, () => console.log("🚀 [API] Listening on port 4000"));
}
export const handler = ServerlessHttp(app);
