import { Context, Next } from "koa";

export const asyncReturn = async (ctx: Context, next: Next) => {
  const result = await next();
  if (result) {
    ctx.body = result;
  }
};
