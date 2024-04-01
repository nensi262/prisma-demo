import db from "@api/database/client";
import env from "@api/env";
import { sendEmail } from "@api/utils/emails";
import { createId } from "@paralleldrive/cuid2";
import { render } from "@react-email/render";
import crypto from "crypto";
import LoginMagicLink from "emails/templates/LoginMagicLink";

export async function generateMagicLink({
  next,
  email,
  clientCode,
}: {
  next?: string;
  email: string;
  clientCode: string;
}) {
  const int = crypto.randomInt(100000, 999999);
  const code = crypto.createHash("sha256").update(int.toString()).digest("hex");
  const token = crypto.randomBytes(32).toString("hex");

  const user = await db.user.findFirst({
    where: {
      email,
    },
  });

  if (!user) throw new Error("no user?????");

  await db.userMagicLink.create({
    data: {
      id: `ml_${createId()}`,
      user: {
        connect: {
          id: user.id,
        },
      },
      token,
      code,
      next,
      clientCode,
      expiresAt: new Date(Date.now() + 300000),
    },
  });

  const domain = env.PORTAL_DOMAIN || "http://localhost:3000";

  const link = `${domain}/auth/${token}/${clientCode}?email=${email}`;

  await sendEmail({
    to: email,
    subject: "Login to Moove",
    html: render(LoginMagicLink({ magicLink: link, code: int })),
  });

  return token;
}
