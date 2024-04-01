import db from "@api/database/client";
import { HTTPException } from "@api/utils/HTTPException";
import { setUser } from "@sentry/node";
import { Context, Next } from "koa";
import { verifyAccessToken } from "./tokens";

export const userAuth = async (ctx: Context, next: Next) => {
  const bearer = ctx.request.header["authorization"];
  if (!bearer) return await next();

  const jwt = bearer.split(" ")[1];
  if (!jwt) return await next();

  const payload = await verifyAccessToken(jwt);

  if (!payload) return await next();

  const token = await db.userAccessToken.findFirst({
    where: {
      token: payload.jti,
      userId: payload.id,
    },
  });

  if (!token) return await next();

  const user = await db.user.findFirst({
    where: {
      id: token.userId,
    },
  });

  if (!user) return await next();

  ctx.user = user;
  setUser({
    id: user.id,
  });

  await next();
};

export const enforceAuth = async (ctx: Context, next: Next) => {
  const { user } = ctx;

  if (!user) throw new HTTPException(401);

  await next();
};
