import { SecurityGroup, Vpc } from "aws-cdk-lib/aws-ec2";
import { config } from "dotenv";
import { Function, Queue, StackContext } from "sst/constructs";

export function PricePaid({ stack }: StackContext) {
  const local = stack.stage !== "staging" && stack.stage !== "production";

  const { parsed } = config({
    path: "./services/price-paid/.env",
  });

  const vpc = !local
    ? Vpc.fromLookup(stack, "staging-vpc", {
        vpcName: "staging-vpc",
      })
    : undefined;

  const sg = vpc
    ? SecurityGroup.fromLookupByName(stack, "staging", "staging", vpc)
    : undefined;

  const queue = new Queue(stack, "price-paid-queue", {
    consumer: {
      function: {
        memorySize: "512 MB",
        timeout: "15 minutes",
        architecture: "arm_64",
        handler: "services/price-paid/worker.handler",
        environment: {
          ...parsed,
        },
        deadLetterQueueEnabled: true,
        // @ts-expect-error fuckign aws
        vpc,
        // @ts-ignore
        securityGroups: vpc ? [sg] : undefined,
      },
    },
  });

  const fn = new Function(stack, "price-paid", {
    timeout: "15 minutes",
    memorySize: "512 MB",
    bind: [queue],
    environment: {
      ...parsed,
      QUEUE_URL: queue.queueUrl,
    },
    // @ts-expect-error fuckign aws
    vpc,
    // @ts-ignore
    securityGroups: vpc ? [sg] : undefined,
    handler: "services/price-paid/index.handler",
    url: true,
  });

  stack.addOutputs({
    PricePaidEndpoint: fn.url,
    QueueUrl: queue.queueUrl,
  });
}
