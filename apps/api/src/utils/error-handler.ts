import * as Sentry from "@sentry/node";
import { Context, Next } from "koa";
import { ZodError } from "zod";
import { HTTPException } from "./HTTPException";

export const errorHandler = async (ctx: Context, next: Next) => {
  await next().catch((e) => {
    console.error(e);

    if (e instanceof ZodError) {
      const issues: Record<string, string> = {};
      // todo fix union errors

      e.errors.forEach((error) => {
        const field = error.path.join(".");
        issues[field] = error.message;
      });

      ctx.status = 400;
      ctx.body = {
        success: false,
        status: 400,
        issues,
        message: e.message,
        type: e.name,
      };
      return;
    }

    let sendToSentry = true;

    if (e instanceof HTTPException) {
      ctx.status = e.status;
      ctx.body = {
        success: false,
        status: e.status,
        message: e.message,
      };

      sendToSentry = e.isServer;
    }

    if (!sendToSentry) return;

    let id = "";

    Sentry.withScope((scope) => {
      scope.addEventProcessor((event) => {
        return Sentry.addRequestDataToEvent(event, ctx.request);
      });
      id = Sentry.captureException(e);
    });

    //todo sentry
    ctx.status = 500;
    ctx.body = {
      success: false,
      status: 500,
      message: "Internal server error",
      id,
    };
  });

  // todo: handle status codes that are errors caused by Koa actions - e.g. not found

  // if (ctx.status === 400) {
  //   ctx.body = {
  //     success: false,
  //     status: 400,
  //     message: "Bad request",
  //   };
  // }

  // if (ctx.status === 404) {
  //   ctx.body = {
  //     success: false,
  //     status: 404,
  //     message: "Not found",
  //   };
  // }

  // if (ctx.status === 405) {
  //   ctx.body = {
  //     success: false,
  //     status: 405,
  //     message: "Method not allowed",
  //   };
  // }
};
