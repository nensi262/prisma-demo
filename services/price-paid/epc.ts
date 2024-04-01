import { mapEpc } from "home/src/utils/map-epc";

export const findEPC = async ({
  address,
  postcode,
}: {
  address: string;
  postcode: string;
}) => {
  const res = await fetch(
    `https://epc.opendatacommunities.org/api/v1/domestic/search?address=${address}&postcode=${postcode}`,
    {
      headers: {
        accept: "application/json",
        authorization: `Basic ${Buffer.from(
          `${process.env.EPC_USERNAME}:${process.env.EPC_SECRET}`,
        ).toString("base64")}`,
      },
    },
  );

  const body = await res.text();

  if (body.length == 0) return null;

  const data: { rows: { [key: string]: string }[] } = JSON.parse(body);

  if (data.rows.length == 0) return null;

  return mapEpc(data.rows);
};
