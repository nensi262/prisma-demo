import env from "@api/env";

export type AddressResponse = {
  postcode: string;
  latitude: string;
  longitude: string;
  formatted_address: string;
  street: string;
  building_name: string;
  sub_building_name: string;
  sub_building_number: string;
  building_number: string;
  line_1: string;
  line_2: string;
  line_3: string;
  line_4: string;
  locality: string;
  town_or_city: string;
  county: string;
  district: string;
  country: string;
  residential: string;
};

export const addressById = async (id: string) => {
  const res = await fetch(
    `https://api.getAddress.io/get/${id}?api-key=${env.GETADDRESS_API_KEY}`,
  );

  if (!res.ok) return null;

  const json: AddressResponse = await res.json();

  return json;
};
