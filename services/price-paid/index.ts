import { SQS } from "@aws-sdk/client-sqs";
import type {
  LambdaFunctionURLEvent,
  LambdaFunctionURLResult,
} from "aws-lambda";
import { drizzle } from "drizzle-orm/mysql2";
import { chunk } from "./chunker";

import { sql } from "drizzle-orm";
import { createPool } from "mysql2";

const sqs = new SQS({
  region: "eu-west-2",
});
const connection = createPool(process.env.DATA_DATABASE_URL as string);
const db = drizzle(connection);

export const handler = async (
  event: LambdaFunctionURLEvent,
): Promise<LambdaFunctionURLResult> => {
  console.log("lambda on");
  let body = event.body ? JSON.parse(event.body) : {} || {};
  let messagesDispatched = 0;
  let eventsDispatched = 0;

  console.log("database url", process.env.DATA_DATABASE_URL);
  console.log("queue url", process.env.QUEUE_URL);
  console.log("body", body);

  await chunk(1000, async ({ cursor, setActive, setCursor, limit }) => {
    console.log("starting", eventsDispatched);
    if ("cursor" in body && messagesDispatched === 0) {
      setCursor(body.cursor);
    }

    console.log("about to query", cursor, limit);
    console.log("table", sql`ppd`);
    const data = await db
      .select({
        tuid: sql`tuid`,
        price: sql`price`,
        date: sql`date`,
        postcode: sql`postcode`,
        type: sql`type`,
        newBuild: sql`newbuild`,
        tenure: sql`tenure`,
        paon: sql`paon`,
        saon: sql`saon`,
        street: sql`street`,
        city: sql`a`,
      })
      .from(sql`ppd`)
      .orderBy(sql`tuid`)
      .where(sql`tuid > ${cursor}`)
      .limit(limit);

    if (data.length === 0) {
      setActive(false);
      return;
    }

    console.log("last cursor", data[data.length - 1]?.tuid as string);
    setCursor(data[data.length - 1]?.tuid as string);

    const response = await sqs.sendMessage({
      QueueUrl: process.env.QUEUE_URL,
      MessageBody: JSON.stringify(data),
    });

    if (response.$metadata.httpStatusCode === 200) {
      messagesDispatched++;
      eventsDispatched += data.length;
    } else {
      console.log("Error sending message to queue", {
        cursor: data?.[0]?.tuid,
      });
    }
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      messagesDispatched,
      eventsDispatched,
    }),
  };
};
