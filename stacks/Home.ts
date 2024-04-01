import { SecurityGroup, Vpc } from "aws-cdk-lib/aws-ec2";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { config } from "dotenv";
import fs from "fs";
import path from "path";
import { Api, Bucket, Queue, StackContext } from "sst/constructs";

const { parsed } = config({
  path: "./apps/api/.env",
});

const prismaDatabaseLayerPath = "./.sst/layers/prisma";

function preparePrismaLayerFiles() {
  // Remove any existing layer path data
  fs.rmSync(prismaDatabaseLayerPath, { force: true, recursive: true });

  // Create a fresh new layer path
  fs.mkdirSync(prismaDatabaseLayerPath, { recursive: true });

  // Prisma folders to retrieve the client and the binaries from
  const prismaFiles = [
    "./apps/api/node_modules/@prisma/client",
    "./apps/api/node_modules/prisma/build",
  ];

  for (const file of prismaFiles) {
    fs.cpSync(
      file,
      path.join(
        prismaDatabaseLayerPath,
        "nodejs",
        file.replace("./apps/api/", ""),
      ),
      {
        // Do not include binary files that aren't for AWS to save space
        filter: (src) => !src.endsWith("so.node") || src.includes("rhel"),
        // src.includes("linux-arm64"),
        recursive: true,
      },
    );
  }
}

export function Home({ stack }: StackContext) {
  preparePrismaLayerFiles();
  const local = stack.stage !== "staging" && stack.stage !== "production";

  const vpc = !local
    ? Vpc.fromLookup(stack, "staging-vpc", {
        vpcName: "staging-vpc",
      })
    : undefined;

  const sg = vpc
    ? SecurityGroup.fromLookupByName(stack, "staging", "staging", vpc)
    : undefined;

  const images = new Bucket(stack, "property-images", {
    cdk: {
      bucket: {
        publicReadAccess: true,
      },
    },
  });

  const eventsQueue = new Queue(stack, "events-queue", {
    consumer: {
      function: {
        memorySize: "256 MB",
        timeout: "30 seconds",
        architecture: "arm_64",
        permissions: ["ses"],
        handler: "apps/api/src/utils/event-emitter.handler",
        bind: [images],
        environment: {
          ...parsed,
          PROPERTY_IMAGES_BUCKET: images.bucketName,
          PROPERTY_IMAGES_CDN: `https://${images.bucketName}.s3.eu-west-2.amazonaws.com`,
          NODE_ENV: local ? "development" : stack.stage,
        },
        deadLetterQueueEnabled: true,
        // @ts-expect-error fuckign aws
        vpc,
        // @ts-ignore
        securityGroups: vpc ? [sg] : undefined,
      },
    },
  });

  const prismaLayer = new lambda.LayerVersion(stack, "PrismaLayer", {
    code: lambda.Code.fromAsset(path.resolve(prismaDatabaseLayerPath)),
  });

  // Add the Prisma layer to all functions in this stack
  //@ts-expect-error aws is complete dogshit
  stack.addDefaultFunctionLayers([prismaLayer]);

  const api = new Api(stack, "home", {
    defaults: {
      function: {
        runtime: "nodejs20.x",
        memorySize: "256 MB",
        architecture: "arm_64",
        permissions: ["ses"],
        nodejs: {
          esbuild: {
            platform: "node",
            external: ["@prisma/client", ".prisma"],
            loader: {
              ".node": "copy",
            },
          },
        },
        environment: {
          ...parsed,
          PROPERTY_IMAGES_BUCKET: images.bucketName,
          PROPERTY_IMAGES_CDN: `https://${images.bucketName}.s3.eu-west-2.amazonaws.com`,
          EVENTS_QUEUE_URL: eventsQueue.queueUrl,
          NODE_ENV: local ? "development" : stack.stage,
        },
        bind: [images, eventsQueue],
        // @ts-expect-error fuckign aws
        vpc,
        // @ts-ignore
        securityGroups: vpc ? [sg] : undefined,
      },
    },

    routes: {
      "ANY /{proxy+}": "apps/api/src/server.handler",
    },
  });

  // if (!local) {
  //   const migrateScript = new Script(stack, "migration-handler", {
  //     defaults: {
  //       function: {
  //         runtime: "nodejs20.x",
  //         memorySize: "128 MB",
  //         environment: {
  //           DATABASE_URL: parsed?.["DATABASE_URL"] || "",
  //         },
  //         // @ts-expect-error fuckign aws
  //         vpc,
  //         securityGroups: [
  //           // @ts-expect-error fuckign aws
  //           sg,
  //         ],
  //         copyFiles: [
  //           {
  //             from: "apps/api/src/database",
  //           },
  //         ],
  //       },
  //     },

  //     onUpdate: "apps/api/src/database/migrate.handler",
  //     onCreate: "apps/api/src/database/migrate.handler",
  //   });

  //   migrateScript.node.addDependency(api);
  // }

  stack.addOutputs({
    ApiEndpoint: api.url,
    PropertyImagesBucket: images.bucketName,
    EventsQueueUrl: eventsQueue.queueUrl,
    EventsLambda: eventsQueue.consumerFunction?.functionArn,
  });
}
