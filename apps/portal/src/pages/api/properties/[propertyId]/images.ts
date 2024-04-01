// import { PutObjectCommand } from "@aws-sdk/client-s3";
// import formidable from "formidable";
// import { createReadStream } from "fs";
// import { nanoid } from "nanoid";
// import { NextApiRequest, NextApiResponse } from "next";
// import prisma from "../../../../prisma/client";
// import { getUserFromServerToken } from "../../../../server/lib/auth";
// import s3Client from "../../../../server/lib/s3";

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse,
// ) {
//   const user = await getUserFromServerToken(req);
//   if (!user) return res.status(401).json({ error: "Unauthorized" });

//   // todo : check if user is current active lister of property or admin

//   const form = formidable({
//     allowEmptyFiles: false,
//     keepExtensions: true,
//     filename: (_, ext) => `${nanoid()}${ext}`,
//     maxFileSize: 4 * 1024 * 1024,
//   });

//   const parsed = await form.parse(req).catch((e) => {
//     console.log(e);
//     return;
//   });

//   if (!parsed) return;

//   const files = parsed[1];
//   if (!files["1"]) return res.status(400).json({ error: "No file uploaded" });
//   const file = files["1"][0];

//   if (!file.mimetype?.startsWith("image/"))
//     return res.status(400).json({ error: "Invalid file type" });

//   const body = createReadStream(file.filepath);
//   const path = `properties/${req.query.propertyId}/images/${file.newFilename}`;

//   const s3 = await s3Client.send(
//     new PutObjectCommand({
//       Bucket: process.env.PROPERTY_IMAGES_BUCKET as string,
//       Key: path,
//       Body: body,
//       ContentType: file.mimetype,
//     }),
//   );

//   if (s3.$metadata.httpStatusCode !== 200) {
//     return res.status(400).json({ error: "Failed to upload image" });
//   }

//   const image = await prisma.propertyImage.create({
//     data: {
//       propertyId: req.query.propertyId as string,
//       path,
//       filename: file.newFilename,
//       roomId: req.query.roomId as string | undefined,
//     },
//   });

//   return res.json({ image });
// }
