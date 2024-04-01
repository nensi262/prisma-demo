import { SES } from "@aws-sdk/client-ses";
import { HTTPException } from "./HTTPException";

const ses = new SES({
  region: "eu-west-2",
});

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  text?: string;
  html: string;
}) => {
  const start = Date.now();
  const mail = await ses.sendEmail({
    Source: "Moove <hello@e.moove.house>",
    ReplyToAddresses: ["support@moove.house"],
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: html,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
  });

  const end = Date.now();

  if (mail.$metadata.httpStatusCode !== 200)
    throw new HTTPException(500, "Email failed to send");
  console.log(`Email sent in ${end - start}ms`);

  return mail;
};
