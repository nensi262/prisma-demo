import { NextApiRequest, NextApiResponse } from "next";
import nookies from "nookies";
import { z } from "zod";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  const body = await z
    .object({
      bearer: z.string(),
      expiry: z.coerce.date(),
    })
    .parseAsync(req.body);

  nookies.set(
    {
      res,
    },
    "token",
    body.bearer,
    {
      maxAge: Math.floor((body.expiry.getTime() - Date.now()) / 1000),
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    },
  );

  return res.status(200).json({ success: true });
}
