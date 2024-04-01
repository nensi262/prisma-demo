import db from "@api/database/client";

import env from "@api/env";
import { HTTPException } from "@api/utils/HTTPException";
import s3Client from "@api/utils/s3";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { createId } from "@paralleldrive/cuid2";
import Jimp from "jimp";
import { Context } from "koa";
import { uploadSchema } from "./schemas";

export const uploadBase64 = async (ctx: Context) => {
  const body = await uploadSchema.parseAsync(ctx.request.body);

  const buffer = Buffer.from(body.base64.split(",")[1], "base64");

  if (!body.base64.startsWith("data:image/")) {
    throw new HTTPException(400, "Not a valid image");
  }

  const image = await Jimp.read(buffer);

  const width = image.getWidth();
  const height = image.getHeight();

  const optimised = await image
    .resize(
      width > height ? 1280 : Jimp.AUTO,
      height > width ? 1280 : Jimp.AUTO,
    )
    .quality(80)
    .getBufferAsync(image.getMIME());

  const filename = `${createId()}.jpg`;
  const key = `properties/${ctx.params.id}/images/${filename}`;

  const result = await s3Client.send(
    new PutObjectCommand({
      Bucket: env.PROPERTY_IMAGES_BUCKET,
      Key: key,
      Body: optimised,
    }),
  );

  if (result.$metadata.httpStatusCode !== 200) {
    throw new HTTPException(400, "Failed to upload image");
  }

  const id = `pimg_${createId()}` as `pimg_${string}`;

  await db.propertyImage.create({
    data: {
      id,
      path: key,
      filename,
      property: {
        connect: {
          id: ctx.params.id,
        },
      },
      room: body.roomId
        ? {
            connect: {
              id: body.roomId,
            },
          }
        : undefined,
    },
  });

  if (body.listingIdForFeatured) {
    await db.listing.update({
      where: {
        id: body.listingIdForFeatured,
      },
      data: {
        featuredImageId: id,
      },
    });
  }

  return ctx.json({
    url: `${env.PROPERTY_IMAGES_CDN}${key}`,
    path: key,
    id: id,
    localId: body.localId,
  });
};

export const deleteImage = async (ctx: Context) => {
  const { id, imageId } = ctx.params;

  // todo: ensure user owns the image
  const image = await db.propertyImage.findFirst({
    where: {
      id: imageId,
      propertyId: id,
    },
  });

  if (!image) {
    throw new HTTPException(404, "Image not found");
  }

  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: env.PROPERTY_IMAGES_BUCKET as string,
      Key: image.path,
    }),
  );

  await db.propertyImage.delete({
    where: {
      id: image.id,
    },
  });

  return ctx.json({ success: true });
};
