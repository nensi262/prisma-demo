import { PropertyRoomType } from "api";
import {
  BathIcon,
  BedDouble,
  CarFront,
  ChefHat,
  Computer,
  Dumbbell,
  Info,
  Library,
  LucideIcon,
  MonitorPlay,
  Package,
  Pizza,
  Router,
  Sofa,
  Sparkles,
  Waves,
} from "lucide-react";

type Mapping = {
  type: PropertyRoomType;
  name: string;
  icon: LucideIcon;
};

export const mappings: Mapping[] = [
  {
    type: "BATHROOM",
    name: "Bathroom",
    icon: BathIcon,
  },
  {
    type: "BEDROOM",
    name: "Bedroom",
    icon: BedDouble,
  },
  {
    type: "KITCHEN",
    name: "Kitchen",
    icon: ChefHat,
  },
  {
    type: "CONSERVATORY",
    name: "Conservatory",
    icon: Sparkles,
  },
  {
    type: "DINING_ROOM",
    name: "Dining room",
    icon: Pizza,
  },
  {
    type: "GARAGE",
    name: "Garage",
    icon: CarFront,
  },
  {
    type: "GYM",
    name: "Gym",
    icon: Dumbbell,
  },
  {
    type: "LIBRARY",
    name: "Library",
    icon: Library,
  },
  {
    type: "LIVING_ROOM",
    name: "Living room",
    icon: Sofa,
  },
  {
    type: "MEDIA_ROOM",
    name: "Media room",
    icon: MonitorPlay,
  },
  {
    type: "POOL",
    name: "Pool",
    icon: Waves,
  },
  {
    type: "STORAGE",
    name: "Storage",
    icon: Package,
  },
  {
    type: "STUDY",
    name: "Study",
    icon: Computer,
  },
  {
    type: "UTILITY_ROOM",
    name: "Utility room",
    icon: Router,
  },
  {
    type: "OTHER",
    name: "Other",
    icon: Info,
  },
];
