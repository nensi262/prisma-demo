import { previewClient } from "@/lib/contentful";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const entry: any = await previewClient
    .getEntry(id as string)
    .catch(() => null);

  if (!entry) return res.status(404).send("Entry not found");

  res.redirect(
    `/blog/${entry.fields.category.fields.slug}/${entry.fields.slug}`,
  );
}
