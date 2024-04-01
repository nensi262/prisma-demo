import db from "@api/database/client";
import { HTTPException } from "@api/utils/HTTPException";
import { Context, Next } from "koa";

export const enforceListingOwner = async (ctx: Context, next: Next) => {
  const id = ctx.params.id;

  if (!id) return await next();

  const user = ctx.user;

  const listing = await db.listing.findFirst({
    where: {
      id,
      userId: user.id,
      status: { notIn: ["COMPLETED", "EXPIRED"] },
    },
  });

  if (!listing) throw new HTTPException(404);
  if (listing.userId !== user.id) throw new HTTPException(403);

  await next();
};
