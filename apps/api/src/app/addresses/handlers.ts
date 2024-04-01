import env from "@api/env";
import { HTTPException } from "@api/utils/HTTPException";
import { Context } from "koa";
import { z } from "zod";

export const search = async (ctx: Context) => {
  const { query } = z.object({ query: z.string() }).parse(ctx.request.query);

  const res = await fetch(
    `https://api.getAddress.io/autocomplete/${encodeURIComponent(
      query,
    )}?api-key=${env.GETADDRESS_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filter: {
          residential: true,
        },
      }),
    },
  );

  const json: {
    suggestions: {
      address: string;
      url: string;
      id: string;
    }[];
  } = await res.json();

  if (json.suggestions.length == 0) throw new HTTPException(404);

  return json.suggestions;
};
