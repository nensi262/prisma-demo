import { Step } from "../hooks/useStep";

export const sellSteps: Step[] = [
  {
    name: "Start",
    pathname: "/sell",
  },
  {
    name: "Details",
    pathname: "/sell/details",
  },
  {
    name: "Floors",
    pathname: "/sell/floors",
  },
  {
    name: "Floor",
    pathname: "/sell/floors/[floorSlug]",
  },
  {
    name: "Describe",
    pathname: "/sell/describe",
  },
  {
    name: "Preview",
    pathname: "/sell/preview",
  },
  {
    name: "Valuation",
    pathname: "/sell/valuation",
  },
  {
    name: "Terms",
    pathname: "/sell/terms",
  },
  {
    name: "Payment",
    pathname: "/sell/stripe",
  },
  {
    name: "Complete",
    pathname: "/sell/review",
  },
];
