import { PropertyFloorType, PropertyRoomType } from "api";
import { ReactNode } from "react";

type Mapping = {
  name: string;
  type: PropertyFloorType;
  greeting: ReactNode;
  featuredRooms: PropertyRoomType[];
};

export const mappings: Mapping[] = [
  {
    name: "Basement",
    type: "BASEMENT",
    greeting: (
      <>
        Tell us about your <span className="text-primary">Basement.</span>
      </>
    ),
    featuredRooms: [],
  },
  {
    name: "Ground floor",
    type: "GROUND",
    greeting: (
      <>
        Let&apos;s begin with the{" "}
        <span className="text-primary">Ground floor.</span>
      </>
    ),
    featuredRooms: ["KITCHEN", "LIVING_ROOM"],
  },
  {
    name: "First floor",
    type: "FIRST",
    greeting: (
      <>
        Moving on to the <span className="text-primary">First floor.</span>
      </>
    ),
    featuredRooms: [],
  },
  {
    name: "Second floor",
    type: "SECOND",
    greeting: (
      <>
        Now, the <span className="text-primary">Second floor.</span>
      </>
    ),
    featuredRooms: [],
  },
  {
    name: "Third floor",
    type: "THIRD",
    greeting: (
      <>
        Finally, the <span className="text-primary">Third floor.</span>
      </>
    ),
    featuredRooms: [],
  },
];
