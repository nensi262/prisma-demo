import db from "@api/database/client";
import env from "@api/env";

import crypto from "crypto";
import { JWTPayload, SignJWT, jwtVerify } from "jose";

const ISSUER = `moove-${process.env.NODE_ENV}`;

export const issueAccessToken = async ({
  id,
  email,
}: {
  id: string;
  email: string;
}) => {
  const token = crypto.randomBytes(28).toString("hex");
  const expiresAt = Date.now() + 172800000;

  const jwt = await new SignJWT({ id, email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setJti(token)
    .setIssuedAt(Math.floor(Date.now() / 1000))
    .setExpirationTime(Math.floor(expiresAt / 1000))
    .sign(new TextEncoder().encode(env.JWT_SECRET));

  await db.userAccessToken.create({
    data: {
      id: `uat_${token}`,
      user: {
        connect: {
          id,
        },
      },
      token,
      expiresAt: new Date(expiresAt),
    },
  });

  return { token: jwt, expiresAt: new Date(expiresAt) };
};

interface AccessToken {
  id: string;
  email: string;
  jti: string;
  iat: number;
  exp: number;
  iss: string;
}

export const verifyAccessToken = async (token: string) => {
  const { payload } = await jwtVerify(
    token,
    new TextEncoder().encode(env.JWT_SECRET),
    {
      issuer: ISSUER,
      requiredClaims: ["exp", "jti", "iat", "iss"],
    },
  ).catch(() => ({
    payload: null,
  }));
  return payload as (JWTPayload & AccessToken) | null;
};
