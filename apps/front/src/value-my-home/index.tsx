import BrandGradientWrapperContainer from "@/components/BrandGradientWrapper";
import Button from "@/components/forms/Button";
import FlowModal from "@/components/valuator/FlowModal";
import useURLState from "@/hooks/useURLState";
import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const formatPostcode = (val: string) => {
  const parts = val.match(/^([A-Z]{1,2}\d{1,2}[A-Z]?)\s*(\d[A-Z]{2})$/i);
  if (!parts) return val;

  parts.shift();
  return parts.join(" ").toUpperCase();
};

export default function ValueMyHome() {
  const [mounted, setMounted] = useState(false);
  const [postcode, setPostcode] = useState("");

  const [{ query }, { setQuery }] = useURLState();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = () => {
    setQuery((q) => ({ ...q, postcode }));
  };

  return (
    <>
      <BrandGradientWrapperContainer className="pt-36 sm:pt-52 pb-28 sm:pb-40  text-white">
        <div className="w-full px-8 max-w-7xl flex flex-col md:flex-row items-center justify-between z-10 gap-10 sm:gap-5">
          <div className="md:max-w-xl">
            <h1 className="text-2xl sm:text-3xl font-semibold font-satoshi">
              How much is my house worth?
            </h1>
            <p className="text-6xl sm:text-7xl font-bold font-satoshi my-6 sm:my-10">
              Value your home
            </p>
            <p className="font-medium tracking-tight text-lg">
              Enter your postcode to reveal your property&apos;s value and track
              changes over time.
            </p>
          </div>
          <div className="flex flex-col items-start w-full md:w-auto md:items-center md:px-6 min-w-[300px] lg:min-w-[450px]">
            <label
              htmlFor="postcode"
              className="md:block md:text-center text-base mb-1 md:mb-0 font-satoshi md:text-3xl font-semibold"
            >
              Enter your postcode
            </label>
            <input
              type="text"
              id="postcode"
              value={postcode}
              onChange={(e) =>
                setPostcode(formatPostcode(e.target.value.toUpperCase()))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              placeholder="e.g. SW1A 1AA"
              className="w-full max-w-xl border md:text-center outline-none rounded-lg bg-white px-2.5 py-3 text-primary placeholder:text-oxford-blue/40 font-satoshi font-semibold mt-0 mb-5 md:my-10"
            />
            <Button
              variant="white"
              onClick={handleSubmit}
              decoration={
                postcode.length >= 7 && (
                  <div className="absolute h-full -right-6 top-0 flex items-center justify-center">
                    <div className="relative size-4 rounded-full bg-white flex items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    </div>
                  </div>
                )
              }
            >
              Value my house
            </Button>
          </div>
        </div>
      </BrandGradientWrapperContainer>
      <div className="h-20 w-full"></div>
      {mounted &&
        createPortal(
          <AnimatePresence>{query.postcode && <FlowModal />}</AnimatePresence>,
          document.body,
        )}
    </>
  );
}
