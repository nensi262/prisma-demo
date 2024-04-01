import { PropertyDetachment, PropertyType } from "@prisma/client";

const safeParseFloat = (value: string) => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

export const mapEpc = (rows: Array<Record<string, string>>) =>
  rows.map((row) => ({
    lmk: row["lmk-key"],
    potentialEnergyEfficiency: safeParseFloat(
      row["potential-energy-efficiency"],
    ),
    currentEnergyEfficiency: safeParseFloat(row["current-energy-efficiency"]),
    potentialEnergyRating: row["potential-energy-rating"],
    currentEnergyRating: row["current-energy-rating"],
    potentialEnvironmentalImpact: safeParseFloat(
      row["environment-impact-potential"],
    ),
    currentEnvironmentalImpact: safeParseFloat(
      row["environment-impact-current"],
    ),
    propertyType: mapPropertyType(row["property-type"]),
    builtForm: mapDetachment(row["built-form"]),
    habitableRooms: safeParseFloat(row["number-habitable-rooms"]),
    mainsGas: row["mains-gas-flag"] == "Y" ? true : false,
    lodgedAt: new Date(row["lodgement-datetime"]),
    totalFloorArea: safeParseFloat(row["total-floor-area"]),
    totalFloorSqft: Math.round(
      safeParseFloat(row["total-floor-area"]) * 10.76391,
    ),
  }))[0];

const mapPropertyType = (propertyType: string) => {
  const array: { [key: string]: PropertyType } = {
    flat: "FLAT",
    house: "HOUSE",
    bungalow: "BUNGALOW",
    maisonette: "MAISONETTE",
    "park home": "PARK_HOME",
  };

  return array[propertyType.toLowerCase()];
};

const mapDetachment = (detachment: string) => {
  const array: { [key: string]: PropertyDetachment } = {
    "enclosed end-terrace": "END_TERRACE",
    "enclosed mid-terrace": "MID_TERRACE",
    "end-terrace": "END_TERRACE",
    "mid-terrace": "MID_TERRACE",
    "semi-detached": "SEMI_DETACHED",
    detached: "DETACHED",
  };

  return array[detachment.toLowerCase()];
};
