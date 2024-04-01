import SuperJSON from "superjson";
import { ZodError } from "zod";

export class HTTPError extends Error {
  status: number;
  issues: ZodError["issues"] | null;
  message: string;

  constructor({
    status,
    message,
    issues,
  }: {
    status: number;
    message: string;
    issues: ZodError["issues"] | [];
  }) {
    super(message);
    this.message = message;
    this.issues = issues;
    this.status = status;
  }
}

export const fetcher = async ({
  url,
  bearer,
  baseUrl,
}: {
  baseUrl?: string;
  url: string;
  bearer?: string;
}) => {
  const headers = new Headers();

  if (bearer) headers.append("authorization", `Bearer ${bearer}`);

  const res = await fetch(
    `${baseUrl || process.env.NEXT_PUBLIC_API_DOMAIN}${url}`,
    {
      headers,
    },
  );

  const data = await res.json();

  if (!res.ok) {
    throw new HTTPError({
      issues: data.issues || [],
      message: data.message,
      status: res.status,
    });
  }

  if (res.headers.get("content-type")?.includes("application/json")) {
    if ("json" in data || "meta" in data) return SuperJSON.deserialize(data);

    return data;
  }

  return data;
};

export const mutationFetcher = async <T = unknown, S = unknown>(
  {
    url,
    bearer,
    method = "POST",
    contentType = "application/json",
    baseUrl,
  }: {
    url: string;
    bearer?: string;
    method?: string;
    contentType?: string;
    baseUrl?: string;
  },
  extra?: { arg: S },
): Promise<T> => {
  const headers = new Headers({
    "content-type": contentType,
  });

  if (bearer) headers.append("authorization", `Bearer ${bearer}`);

  const res = await fetch(
    `${baseUrl || process.env.NEXT_PUBLIC_API_DOMAIN}${url}`,
    {
      method,
      body: extra ? JSON.stringify(extra.arg) : undefined,
      headers,
    },
  );

  const data = await res.json();

  if (!res.ok) {
    throw new HTTPError({
      issues: data.issues || [],
      message: data.message,
      status: res.status,
    });
  }

  if (res.headers.get("content-type")?.includes("application/json")) {
    if (!("json" in data)) return data;

    return SuperJSON.deserialize(data);
  }

  return data;
};
