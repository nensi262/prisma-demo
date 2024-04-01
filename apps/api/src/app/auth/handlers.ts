import db from "@api/database/client";
import { HTTPException } from "@api/utils/HTTPException";
import { createId } from "@paralleldrive/cuid2";
import crypto from "crypto";
import { Context } from "koa";
import { LoginRequestCode } from "./events";
import { loginSchema, registerSchema, verifySchema } from "./schemas";
import { issueAccessToken } from "./tokens";

export const login = async (ctx: Context) => {
  const body = await loginSchema.parseAsync(ctx.request.body);

  const user = await db.user.findFirst({
    where: {
      email: body.email.toLowerCase(),
    },
  });

  if (!user) return ctx.json({ next: "signup" });

  ctx.events.dispatch(new LoginRequestCode(body));

  return ctx.json({ next: "code" });
};

export const verify = async (ctx: Context) => {
  const body = await verifySchema.parseAsync(ctx.request.body);

  const user = await db.user.findFirst({
    where: {
      email: body.email.toLowerCase(),
    },
  });

  if (!user) throw new HTTPException(500);

  const magic = await db.userMagicLink.findFirst({
    where: {
      token: "token" in body ? body.token : undefined,
      code:
        "code" in body
          ? crypto
              .createHash("sha256")
              .update(body.code.toString())
              .digest("hex")
          : undefined,
      clientCode: body.clientCode,
      userId: user.id,
      expiresAt: { gt: new Date() },
      redeemedAt: null,
    },
  });

  if (!magic) {
    throw new HTTPException(401);
  }

  // todo: tidy ips
  await db.user.update({
    where: {
      id: user.id,
    },
    data: {
      magicLinks: {
        update: {
          data: {
            redeemedAt: new Date(),
            redeemedIp:
              (ctx.request.headers["x-real-ip"] as string) || "unknown",
          },
          where: {
            id: magic.id,
          },
        },
      },
      loginHistory: {
        create: {
          id: createId(),
          ip: (ctx.request.headers["x-real-ip"] as string) || "unknown",
          userAgent: ctx.request.headers["user-agent"] || "unknown",
        },
      },
    },
  });

  const token = await issueAccessToken({
    id: user.id,
    email: user.email,
  });

  return ctx.json({ ...token, expiresAt: token.expiresAt, next: magic.next });
};

export const register = async (ctx: Context) => {
  const body = await registerSchema.parseAsync(ctx.request.body);

  const user = await db.user.findFirst({
    where: {
      email: body.email.toLowerCase(),
    },
  });

  if (user) throw new HTTPException(409);

  await db.user.create({
    data: {
      id: `usr_${createId()}`,
      name: body.name,
      acceptsMarketing: body.acceptsMarketing,
      phone: body.phone,
      email: body.email.toLowerCase(),
    },
  });

  ctx.events.dispatch(
    new LoginRequestCode({
      clientCode: body.clientCode,
      email: body.email,
    }),
  );

  return ctx.json({ success: true });
};

export const me = async (ctx: Context) => {
  return ctx.json(ctx.user);
};
