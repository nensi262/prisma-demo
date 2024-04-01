import crypto from "crypto";

export const propertyFingerprint = (input: {
  paon: string;
  city: string;
  saon?: string;
  street: string;
  postcode: string;
}) => {
  const address = {
    paon: normalise(input.paon ?? ""),
    saon: normalise(input.saon ?? ""),
    street: normalise(input.street),
    postcode: normalise(input.postcode),
    city: normalise(input.city),
  };
  const sortedKeys = Object.keys(address).sort();
  const sortedValuesString = sortedKeys
    .map((key) => address[key as keyof typeof address])
    .join(",");

  return crypto.createHash("sha256").update(sortedValuesString).digest("hex");
};

const normalise = (str: string) => {
  return str
    .toUpperCase()
    .trim()
    .replace(/[\s\W]+/g, "");
};
