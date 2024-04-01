// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });
  if (!req.body.email)
    return res.status(400).json({ error: "Email is required" });
  if (req.body.email.indexOf("@") === -1)
    return res.status(400).json({ error: "Email is invalid" });

  const post = await fetch(
    `https://api.airtable.com/v0/appXjCjfCVpcV0Kxb/tblUdRz8FZRHUNDas`,
    {
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        "content-type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        fields: {
          Email: req.body.email,
          Date: new Date(),
          City: req.headers["x-vercel-ip-city"],
        },
      }),
    },
  ).catch((e) => {
    console.log("error with airtable", e);
    return null;
  });

  if (!post?.ok) {
    const json = await post?.json();
    console.log("error with airtable http", json);
    return res.status(500).json({ error: "Something went wrong" });
  }

  return res.status(200).json({ success: true });
}
