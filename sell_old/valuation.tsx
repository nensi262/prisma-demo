import { FlowSection } from "@/components/flows/FlowLayout";
import NavigationButtons from "@/components/flows/sell/NavigationButtons";
import { useSellerFlow } from "@/components/flows/sell/SellerFlowWrapper";
import { H1 } from "@/components/typography/Heading";
import { useStep } from "@/hooks/useStep";
import { sellSteps } from "@/utils/steps";
import { useEffect, useState } from "react";

export default function Describe() {
  const { listing } = useSellerFlow();
  const { next } = useStep(sellSteps);
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
      <FlowSection>
        <H1>Can you put a price on freedom?</H1>
      </FlowSection>
      <FlowSection>
        <p className="mb-5">
          Turns out you can. Based on x,y and z we suggest the following bounds
          for your price.
        </p>
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
            className="py-5 px-2 w-full border-2 rounded-md outline-none text-2xl font-bold text-center focus:border-primary"
            placeholder={new Intl.NumberFormat("en-GB", {
              style: "currency",
              currency: "GBP",
              maximumFractionDigits: 0,
            }).format(minVal + 675000 / 2)}
          ></input>
        </div>
        <NavigationButtons onNext={next} />
      </FlowSection>
    </>
  );
}
