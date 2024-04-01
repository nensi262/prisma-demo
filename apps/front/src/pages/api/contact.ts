import { SES } from "@aws-sdk/client-ses";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
const ses = new SES({ region: "eu-west-2" });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const body = await z
    .object({
      name: z.string(),
      email: z.string().email(),
      phone: z.string().optional(),
      message: z.string(),
    })
    .parseAsync(req.body)
    .catch((e) => {
      res.status(400).json({ error: e.message });
    });

  if (!body) return;

  const mail = await ses
    .sendEmail({
      Source: "notifications@e.moove.house",
      Destination: {
        ToAddresses: ["hello@moove.house"],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `
              <p><strong>Name:</strong> ${body.name}</p>
              <p><strong>Email:</strong> ${body.email}</p>
              <p><strong>Phone:</strong> ${body.phone}</p>
              <p><strong>Message:</strong> ${body.message}</p>
              `,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: "New contact form submission",
        },
      },
    })
    .catch((e) => {
      console.log(e);
    });

  res.status(200).json(mail);
}
