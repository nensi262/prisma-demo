import { events } from "@api/events";
import { SQS } from "@aws-sdk/client-sqs";
import * as Sentry from "@sentry/node";
import { APIGatewayProxyResultV2, SQSEvent } from "aws-lambda";
import { EventEmitter as PrimitiveEventEmitter } from "events";
const sqs = new SQS({
  region: "eu-west-2",
});

export default class EventEmitter extends PrimitiveEventEmitter {
  constructor() {
    super();
    this.on("event", async (payload) => {
      await sqs.sendMessage({
        QueueUrl: process.env.EVENTS_QUEUE_URL,
        MessageBody: JSON.stringify(payload),
      });
    });
  }

  dispatch(event: Event) {
    // for future - , {priority: true}  ==>  return super.emit("priority-event", JSON.stringify({ ...event, type: event.type }));
    return super.emit("event", JSON.stringify({ ...event, type: event.type }));
  }
}

export const handler = async (
  event: SQSEvent,
): Promise<APIGatewayProxyResultV2> => {
  Sentry.init({
    dsn: "https://6027c6f3e6e8462858a700d4ae21fbbe@o4506765185712128.ingest.sentry.io/4506768884563968",
    integrations: [
      ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
    ],
    // environment: process.env.NODE_ENV,
    // enabled: process.env.NODE_ENV !== "development",
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
  });

  try {
    const body = JSON.parse(JSON.parse(event.Records[0].body));
    console.log(body, "body");

    const ev = events[body.type as keyof typeof events];

    await ev.handler(body.data);

    return {
      statusCode: 200,
      body: "ok",
    };
  } catch (error) {
    console.log("error", error);
    Sentry.captureException(error);
    return {
      statusCode: 500,
      body: "error",
    };
  }
};
