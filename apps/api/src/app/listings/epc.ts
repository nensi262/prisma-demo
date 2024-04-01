import db from "@api/database/client";
import env from "@api/env";
import { mapEpc } from "@api/utils/map-epc";

export const findEPC = async ({
  address,
  postcode,
  saveToPropertyId,
}: {
  address: string;
  postcode: string;
  saveToPropertyId?: string;
}) => {
  const res = await fetch(
    `https://epc.opendatacommunities.org/api/v1/domestic/search?address=${address}&postcode=${postcode}`,
    {
      headers: {
        accept: "application/json",
        authorization: `Basic ${Buffer.from(
          `${env.EPC_USERNAME}:${env.EPC_SECRET}`,
        ).toString("base64")}`,
      },
    },
  );

  const body = await res.text();

  if (body.length == 0) return null;

  const data: { rows: { [key: string]: string }[] } = JSON.parse(body);

  if (data.rows.length == 0 || data.rows.length > 1) return null;

  const epc = mapEpc(data.rows);

  if (saveToPropertyId) {
    await db.propertyEpc.create({
      data: {
        ...epc,
        property: {
          connect: {
            id: saveToPropertyId,
          },
        },
      },
    });
  }

  return epc;
};
