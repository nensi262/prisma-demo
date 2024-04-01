import { SQS } from "@aws-sdk/client-sqs";
import type {
  LambdaFunctionURLEvent,
  LambdaFunctionURLResult,
} from "aws-lambda";
import csv from "csv-parser";
import fetch from "node-fetch";

const sqs = new SQS({
  region: "eu-west-2",
});

export const handler = async (
  event: LambdaFunctionURLEvent,
): Promise<LambdaFunctionURLResult> => {
  console.log("lambda on");
  const { url, override } = JSON.parse(event.body || "{}");

  if (override) {
    const response = await sqs.sendMessage({
      QueueUrl: process.env.QUEUE_URL,
      MessageBody: JSON.stringify(override),
    });
    console.log(response);

    return {
      statusCode: 200,
      body: JSON.stringify({
        transactionCount: 1,
        eventsSent: 1,
      }),
    };
  }

  console.log("url", url);
  if (!url) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing url" }),
    };
  }

  const response = await fetch(url);
  console.log("response status", response.status);

  let transactionCount = 0;
  let eventsSent = 0;
  let failed: string[] = [];

  console.log("starting pipe");
  await new Promise((resolve) => {
    response.body
      ?.pipe(
        csv({
          headers: [
            "transactionUniqueIdentifier",
            "price",
            "dateOfTransfer",
            "postcode",
            "propertyType",
            "newBuild",
            "duration",
            "paon",
            "saon",
            "street",
            "locality",
            "townCity",
            "district",
            "county",
            "ppdCategoryType",
            "recordStatus",
          ],
        }),
      )
      .on("data", async (data) => {
        if (transactionCount >= 201) return;

        console.log("currently processing", transactionCount);

        const response = await sqs
          .sendMessage({
            DelaySeconds: 5,
            QueueUrl: process.env.QUEUE_URL,
            MessageBody: JSON.stringify(data),
          })
          .catch((e) => {
            console.error(e);
            return null;
          });

        transactionCount++;

        if (!response) {
          console.log("failed to send message");
          return;
        }

        console.log(response);

        if (response.$metadata.httpStatusCode === 200) {
          eventsSent++;
        } else {
          failed.push(data.transactionUniqueIdentifier);
        }
      })
      .on("end", () => resolve(true));
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      transactionCount,
      eventsSent,
      failed,
    }),
  };
};
