/* eslint-disable @typescript-eslint/no-empty-function */
import { useUser } from "@/providers/UserProvider";
import type { Handlers } from "api";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import useSWR from "swr";
import { KeyLoader } from "ui/interactions/Spinner";
import { KeysBlue } from "ui/logos/Keys";

type Listing = Handlers["listings"]["getById"];

const STEPS = [
  {
    name: "Details",
    paths: ["/sell", "/sell/details"],
  },
  {
    name: "Layout",
    paths: ["/sell/floors", "/sell/floors/[slug]"],
  },
  {
    name: "Preview",
    paths: ["/sell/describe", "/sell/preview"],
  },
  {
    name: "Valuation",
    paths: ["/sell/valuation"],
  },
  {
    name: "Final Steps",
    paths: ["/sell/terms", "/sell/pay"],
  },
  {
    name: "Submitted",
    paths: ["/sell/submitted"],
  },
];

const SellerFlowContext = createContext<{
  id: string | null;
  listing: Listing;
  loading: boolean;
  refetch: () => void;
  setId: (id: string) => void;
  goToNextStep: () => void;
  goToPrevStep: () => void;
  currentStep: (typeof STEPS)[number];
  nextStep: (typeof STEPS)[number] | null;
  prevStep: (typeof STEPS)[number] | null;
  steps: typeof STEPS;
}>({
  id: null,
  listing: {} as Listing,
  loading: true,
  refetch: () => {},
  setId: () => {},
  goToNextStep: () => {},
  goToPrevStep: () => {},
  steps: STEPS,
  currentStep: STEPS[0],
  nextStep: null,
  prevStep: null,
});

type StepState = {
  step: (typeof STEPS)[number] | null;
  path: string | null;
};

const SellerFlowWrapper = ({ children }: { children: ReactNode }) => {
  const [listingId, setListingId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<(typeof STEPS)[number]>(
    STEPS[0],
  );
  const { bearer } = useUser();

  useEffect(() => {
    const id = localStorage.getItem("listingId");
    if (!id) return;

    setListingId(id);
  }, []);

  const [next, setNext] = useState<StepState>({
    step: null,
    path: null,
  });
  const [prev, setPrev] = useState<StepState>({
    step: null,
    path: null,
  });

  const router = useRouter();

  const {
    data: listing,
    isLoading: loading,
    mutate: refetch,
    error,
  } = useSWR<Handlers["listings"]["getById"]>(
    router.isReady && listingId !== null && bearer
      ? {
          url: `/listings/seller/${listingId}`,
          bearer,
        }
      : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  const setId = (id: string) => {
    localStorage.setItem("listingId", id);
    setListingId(id);
  };

  useEffect(() => {
    if (!router.pathname) return;
    const step = STEPS.find((step) => step.paths.includes(router.pathname));
    if (!step) return;

    setCurrentStep(step);

    const currentStepIndex = STEPS.indexOf(step);

    const currentPathIndex = step.paths.indexOf(router.pathname);

    let nextPath = step.paths[currentPathIndex + 1];
    let prevPath = step.paths[currentPathIndex - 1];

    if (!nextPath) {
      console.error("No next path found");
      nextPath = STEPS[currentStepIndex + 1]?.paths[0];
    }

    const nextStep = STEPS.find((step) => step.paths.includes(nextPath));

    if (!prevPath) {
      console.error("No prev path found");
      const prevIndex = currentStepIndex - 1;
      prevPath = STEPS[prevIndex]?.paths[STEPS[prevIndex]?.paths.length - 1];
    }

    const prevStep = STEPS.find((step) => step.paths.includes(prevPath));

    nextPath = nextPath?.replace("floors/[slug]", "floors/ground");
    prevPath = prevPath?.replace(
      "floors/[slug]",
      `floors/${
        listing?.property.floors[
          listing.property.floors.length - 1
        ]?.type.toLowerCase() ?? "ground"
      }`,
    );

    setNext({
      step: nextStep ?? null,
      path: nextPath,
    });

    setPrev({
      step: prevStep ?? null,
      path: prevPath,
    });
  }, [router.pathname]);

  const goToNextStep = () => {
    if (!next.path) return console.error("No next path found");

    return router.push(next.path);
  };

  const goToPrevStep = () => {
    if (!prev.path) return console.error("No next path found");

    return router.push(prev.path);
  };

  return (
    <SellerFlowContext.Provider
      value={{
        id: listingId,
        listing: listing as Listing,
        loading,
        refetch,
        setId,
        goToNextStep,
        goToPrevStep,
        steps: STEPS,
        currentStep,
        nextStep: next.step,
        prevStep: prev.step,
      }}
    >
      <AnimatePresence mode="popLayout">
        {router.pathname == "/sell" ? (
          <motion.div
            key="application"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 },
            }}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <Layout>{children}</Layout>
          </motion.div>
        ) : listing ? (
          <motion.div
            key="application"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 },
            }}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <Layout>{children}</Layout>
          </motion.div>
        ) : (
          <motion.div
            key="loader"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 },
            }}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="w-screen h-screen flex items-center justify-center flex-col"
          >
            <KeyLoader />
            {error && <p>error: {error.message}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </SellerFlowContext.Provider>
  );
};

const Layout = ({ children }: { children: ReactNode }) => {
  const { currentStep } = useSellerFlow();

  useEffect(() => {
    const steps = document.querySelectorAll("[data-steps-carousel] > div");
    const widths = Array.from(steps).map((step) => step.clientWidth);

    const currentStepIndex = STEPS.indexOf(currentStep);

    const widthUpToCurrentStep = widths
      ?.slice(0, currentStepIndex)
      .reduce((a, b) => a + b / 2 + 4, 0);

    const carousel = document.querySelector<HTMLDivElement>(
      "[data-steps-carousel]",
    );

    if (!carousel) return;
    carousel.style.transform = `translateX(-${widthUpToCurrentStep}px)`;
  }, [currentStep]);

  return (
    <div className="w-full min-h-screen py-7 px-7">
      <div className="flex items-center space-x-7">
        <KeysBlue className="w-12 min-w-[48px]" />
        <div className="flex overflow-hidden" data-steps-parent="">
          <motion.div
            className="flex flex-grow items-center gap-x-1 font-medium transition-all duration-500"
            data-steps-carousel=""
          >
            {STEPS.map((step, i) => (
              <div
                key={step.name}
                data-step-name={step.name}
                data-step-i={i}
                className={`rounded-full min-w-max px-3 py-1 text-sm border ${
                  step === currentStep ? "bg-primary text-white" : ""
                }`}
              >
                {step.name}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
      <div className="flex flex-col mt-10">{children}</div>
    </div>
  );
};

const useSellerFlow = ({
  onSuccess,
}: {
  onSuccess?: ({ listing }: { listing: Listing }) => void;
} = {}) => {
  const context = useContext(SellerFlowContext);
  if (context === undefined) {
    throw new Error("useSellerFlow must be used within a SellerFlowProvider");
  }

  useEffect(() => {
    if (!context || !context.listing || context.loading) return;

    onSuccess && onSuccess({ listing: context.listing as Listing });
  }, [context]);

  return context;
};

export { SellerFlowWrapper, useSellerFlow };
