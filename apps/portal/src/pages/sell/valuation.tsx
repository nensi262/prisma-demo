import NavigationButtons from "@/components/flows/sell/NavigationButtons";
import { useSellerFlow } from "@/components/flows/sell/SellerFlowWrapper";
import FlowHeading from "@/components/flows/sell/typography/FlowHeading";
import FlowSubHeading from "@/components/flows/sell/typography/FlowSubHeading";
import { useEffect, useState } from "react";

export default function Describe() {
  const { listing } = useSellerFlow();
  const [minVal, setMinVal] = useState(0);

  useEffect(() => {
    const totalWidth =
      listing?.property.rooms.reduce(
        (acc, room) => acc + (room.width ?? 0),
        0,
      ) ?? 0;

    const totalLength =
      listing?.property.rooms.reduce(
        (acc, room) => acc + (room.length ?? 0),
        0,
      ) ?? 0;

    const totalArea = totalWidth * totalLength;

    setMinVal(totalArea * 331);
  }, [listing]);

  return (
    <>
      <FlowHeading>
        Time to set a <span className="text-primary">price</span>.
      </FlowHeading>
      <FlowSubHeading className="mt-5">
        KEV - this is old and will be replaced when the valuation engine is
        running.
      </FlowSubHeading>

      <div className="grid grid-cols-2 gap-4 mt-16">
        <div className="w-full text-center">
          <p className="text-xs text-gray-600 uppercase">
            minimum (this is dynamic from sqft)
          </p>
          <p className="font-bold text-lg">
            {new Intl.NumberFormat("en-GB", {
              style: "currency",
              currency: "GBP",
              maximumFractionDigits: 0,
            }).format(minVal)}
          </p>
        </div>
        <div className="w-full text-center">
          <p className="text-xs text-gray-600 uppercase">maximum</p>
          <p className="font-bold text-lg">£675,000</p>
        </div>
      </div>

      <div className="px-5 my-5 mb-16">
        <input
          autoFocus
          className="py-5 px-2 w-full border-2 rounded-md outline-none text-2xl font-bold text-center focus:border-primary tabular-nums"
          placeholder={new Intl.NumberFormat("en-GB", {
            style: "currency",
            currency: "GBP",
            maximumFractionDigits: 0,
          }).format(minVal + 675000 / 2)}
        ></input>
      </div>
      <NavigationButtons />
    </>
  );
}
