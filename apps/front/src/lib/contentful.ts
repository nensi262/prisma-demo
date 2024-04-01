import * as contentful from "contentful";

export const client = contentful.createClient({
  space: process.env.CONTENTFUL_SPACE_ID as string,
  environment: process.env.CONTENTFUL_ENVIRONMENT as string, // defaults to 'master' if not set
  accessToken: (process.env.NODE_ENV == "production"
    ? process.env.CONTENTFUL_ACCESS_TOKEN
    : process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN) as string,
  host:
    process.env.NODE_ENV === "production"
      ? "cdn.contentful.com"
      : "preview.contentful.com",
});

export const previewClient = contentful.createClient({
  space: process.env.CONTENTFUL_SPACE_ID as string,
  environment: process.env.CONTENTFUL_ENVIRONMENT as string, // defaults to 'master' if not set
  accessToken: process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN as string,
  host: "preview.contentful.com",
});
