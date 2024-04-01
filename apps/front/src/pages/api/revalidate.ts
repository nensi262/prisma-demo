/* eslint-disable @typescript-eslint/no-explicit-any */
import { previewClient } from "@/lib/contentful";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (
    req.headers["x-secret-token"] !== process.env.CONTENTFUL_REVALIDATE_TOKEN
  ) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const body = JSON.parse(req.body);

  if (req.headers["x-contentful-topic"] === "ContentManagement.Entry.publish") {
    const id = body.sys.id;
    const entry: any = await previewClient.getEntry(id).catch(() => {
      return null;
    });

    if (!entry) return res.status(404).json({ error: "Entry not found" });

    if (entry.sys.contentType.sys.id === "post") {
      await res.revalidate(
        `/blog/${entry.fields.category.fields.slug}/${entry.fields.slug}`,
      );
      await res.revalidate(`/blog`);
    }

    if (body.sys.contentType.sys.id === "term") {
      await res.revalidate(`/property-terms/${entry.fields.slug}`);
      await res.revalidate(`/property-terms`);
    }

    res.status(200).json({ ok: true });
    return;
  }

  if (
    req.headers["x-contentful-topic"] === "ContentManagement.Entry.unpublish"
  ) {
    const id = body.sys.id;
    const entry: any = await previewClient.getEntry(id).catch(() => {
      res.status(404).json({ error: "Entry not found" });
    });

    if (res.headersSent || !entry) {
      return;
    }

    if (entry.sys.contentType.sys.id === "post") {
      await res
        .revalidate(
          `/blog/${entry.fields.category.fields.slug}/${entry.fields.slug}`,
        )
        .catch(() => {
          res.status(500).json({ error: "Error revalidating" });
        });
      await res.revalidate(`/blog`);
    }

    if (body.sys.contentType.sys.id === "term") {
      await res.revalidate(`/property-terms/${entry.fields.slug}`).catch(() => {
        res.status(500).json({ error: "Error revalidating" });
      });
      await res.revalidate(`/property-terms`);
    }

    if (res.headersSent) {
      return;
    }

    res.status(200).json({ ok: true });
    return;
  }

  res.status(200).json({ ok: true });
}
