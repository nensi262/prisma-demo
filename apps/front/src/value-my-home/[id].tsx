import BrandGradientWrapperContainer, {
  BrandGradientWrapper,
} from "@/components/BrandGradientWrapper";
import { Handlers, Schemas } from "api";
import { animate } from "framer-motion";
import useFetch, { Overwrite, useMutation } from "hooks/useFetch";
import {
  AlertTriangle,
  CheckCircle,
  Circle,
  TrendingDown,
  TrendingUp,
  Wand2,
} from "lucide-react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  Dispatch,
  HTMLProps,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import Button from "ui/forms/Button";
import Modal from "ui/Modal";

export default function GetValuation() {
  const router = useRouter();
  const [showFineTuneModal, setShowFineTuneModal] = useState(false);

  const [original, setOriginal] = useState<number>();

  const { data: valuation, overwrite } = useFetch<
    Handlers["valuations"]["retrieveValuation"]
  >(`${process.env.NEXT_PUBLIC_API_URL}/valuations/${router.query.id}`, {
    enabled: !!router.query.id,
  });

  useEffect(() => {
    if (valuation && !original) setOriginal(valuation.value.actual);
  }, [valuation, original]);

  return (
    <>
      <Head>
        <title>{`Moove Valuation - ${
          valuation ? valuation.property?.line1 || valuation.postcode : ""
        }`}</title>
      </Head>
      {valuation ? (
        <>
          <FineTuneModal
            open={showFineTuneModal}
            overwrite={overwrite}
            setOpen={setShowFineTuneModal}
            valuation={valuation}
          />
          <BrandGradientWrapperContainer className="pt-36 sm:pt-52 pb-28 sm:pb-40  text-white">
            <div className="w-full px-8 max-w-7xl flex flex-col md:flex-row items-center justify-between z-10 gap-10 sm:gap-20">
              <div className="md:max-w-xl">
                <h1 className="text-2xl sm:text-3xl font-semibold font-satoshi tracking-tight">
                  Your personalised valuation
                </h1>

                <p className="text-6xl sm:text-7xl font-bold font-satoshi my-6 sm:my-8 tracking-tight">
                  {valuation.property
                    ? valuation.property.line1
                    : valuation.postcode}
                </p>

                <p className="text-xl sm:text-3xl font-semibold font-satoshi tracking-tight">
                  {!!valuation.property?.line2 &&
                    `${valuation.property?.line2} — `}
                  {valuation.region}
                </p>
                <p className="font-medium tracking-tight text-lg mt-4">
                  We&apos;ve also sent this to your email, so you can come back
                  to it at any time.
                </p>
                {valuation.type === "AREA" && (
                  <div className="rounded-full px-4 font-semibold py-2 bg-white w-max text-oxford-blue flex items-center space-x-2 text-sm mt-5">
                    <AlertTriangle className="text-pumpkin" />
                    <span>Area Only</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-start w-full md:w-auto md:items-center md:px-6 min-w-[300px] lg:min-w-[450px] flex-grow max-w-xl">
                <div className="w-full bg-white rounded-xl p-5 py-7 shadow-xl">
                  <p className="text-oxford-blue font-satoshi text-center text-2xl font-semibold">
                    Estimated
                  </p>
                  {original && original !== valuation.value.actual && (
                    <div className="w-full flex items-center justify-center gap-2 mt-4">
                      <AnimatedNumber
                        val={original}
                        className="font-satoshi text-center text-lg md:text-xl text-platinum-700 font-semibold line-through"
                      />
                    </div>
                  )}
                  <AnimatedNumber
                    val={valuation.value.actual}
                    className="font-satoshi text-center text-5xl mt-4 text-primary font-semibold"
                  />
                  <div className="w-full grid grid-cols-2 divide-x mt-7 border-t">
                    <div className="pt-5">
                      <p className="text-oxford-blue/70 font-satoshi text-center text-base md:text-lg font-semibold">
                        Lower
                      </p>
                      <AnimatedNumber
                        val={valuation.value.min}
                        className="font-satoshi text-center text-xl md:text-2xl mt-1 text-primary/80 font-semibold"
                      />
                    </div>
                    <div className="pt-5">
                      <p className="text-oxford-blue/70 font-satoshi text-center text-base md:text-lg font-semibold">
                        Upper
                      </p>
                      <AnimatedNumber
                        val={valuation.value.max}
                        className="font-satoshi text-center text-xl md:text-2xl mt-1 text-primary/80 font-semibold"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-5 w-full">
                  <button
                    className="w-full rounded-xl bg-white shadow-xl p-4 px-6 box-border gap-5 text-left flex items-center"
                    onClick={() => setShowFineTuneModal(true)}
                  >
                    <div className="size-8 min-w-[32px]">
                      <Wand2 className="size-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-oxford-blue font-satoshi text-lg font-semibold">
                        Fine tune your valuation
                      </p>
                      <p className="text-oxford-blue/70 tracking-tighter font-medium text-sm  mt-1">
                        Adjust your valuation based on property improvements.
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </BrandGradientWrapperContainer>
          <div className="grid md:grid-cols-2 gap-10 max-w-7xl w-full mx-auto px-6 my-10 md:my-14">
            <div>
              <h2 className="text-2xl font-semibold font-satoshi text-oxford-blue tracking-tight">
                About your valuation
              </h2>
              <p className="tracking-tighter font-medium text-oxford-blue/70 mt-2">
                Your valuation is based on the most recent data available and is
                a guide price. It is not a formal valuation &mdash; you know
                your property better than anyone else.
              </p>
              <p className="tracking-tighter font-medium text-oxford-blue/70 mt-2">
                {valuation.type === "AREA"
                  ? "Since there wasn't enough information available about your property. This valuation is based on the average price of properties in the area based on recent transactions."
                  : "We have calculated the value of your house based on our model that takes into account the market movements and how they have affected your property."}
              </p>
              {valuation.property && (
                <div className="mt-10">
                  <h2 className="text-2xl font-semibold font-satoshi text-oxford-blue tracking-tight">
                    {valuation.property.line1}
                  </h2>
                  <p className="tracking-tighter font-medium text-oxford-blue/70 mt-2">
                    A {valuation.property.detachment?.toLowerCase()}{" "}
                    {valuation.property.type?.toLowerCase()} in{" "}
                    {valuation.region}, with a{" "}
                    {valuation.property.tenure?.toLowerCase()} tenure.{" "}
                    {valuation.property.transactionHistory.length > 0
                      ? `It was last sold for ${new Intl.NumberFormat("en-GB", {
                          style: "currency",
                          maximumFractionDigits: 0,
                          currency: "GBP",
                        }).format(
                          valuation.property.transactionHistory[0].price,
                        )} on ${new Date(
                          valuation.property.transactionHistory[0].date,
                        ).toLocaleDateString()}`
                      : ""}
                  </p>

                  <h3 className="font-satoshi text-oxford-blue font-semibold text-lg tracking-tight mt-4">
                    Transaction History
                  </h3>

                  <ul className="mt-2 space-y-3 w-full">
                    <YourNextSaleCard valuation={valuation} />

                    {valuation.property.transactionHistory.length > 0 ? (
                      valuation.property.transactionHistory.map((_, i) => (
                        <TransactionHistoryLineItem
                          key={i}
                          i={i}
                          property={valuation.property}
                        />
                      ))
                    ) : (
                      <li className="text-oxford-blue/70">
                        No further transaction history available.
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-semibold font-satoshi text-oxford-blue tracking-tight">
                Transactions in your area
              </h2>
              <p className="tracking-tighter font-medium text-oxford-blue/70 mt-2">
                Lorem ipsum dolor sit amet
              </p>
              <div className="mt-5">
                {valuation.transactionsInPostcode.map((t, i) => (
                  <div
                    key={i}
                    className="rounded-xl bg-white p-4 shadow-md border mb-4"
                  >
                    <p className="font-satoshi text-oxford-blue font-semibold">
                      {t.line1}
                    </p>
                    <p className="tracking-tighter font-medium text-oxford-blue/70 mt-1">
                      {new Intl.DateTimeFormat("en-GB", {
                        dateStyle: "long",
                      }).format(t.date)}{" "}
                      &mdash;{" "}
                      {new Intl.NumberFormat("en-GB", {
                        style: "currency",
                        maximumFractionDigits: 0,
                        currency: "GBP",
                      }).format(t.price)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}

const YourNextSaleCard = ({
  valuation,
}: {
  valuation: Handlers["valuations"]["retrieveValuation"];
}) => (
  <BrandGradientWrapper className="p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between border-2 border-primary gap-4">
    <div>
      <p className="text-lg text-white font-satoshi font-semibold tracking-tight mb-2">
        Your next sale on Moove
      </p>
      <div className="flex items-center gap-4">
        <div>
          <AnimatedNumber
            val={valuation.value.actual}
            className="text-white font-satoshi text-xl font-semibold"
          />
        </div>
        {valuation.property?.transactionHistory[0] && (
          <PercentageChangePill
            percentageChange={
              (valuation.value.actual -
                valuation.property.transactionHistory[0].price) /
              valuation.property.transactionHistory[0].price
            }
          />
        )}
      </div>
    </div>
    <Button variant="outline">Sell your property</Button>
  </BrandGradientWrapper>
);

const TransactionHistoryLineItem = ({
  i,
  property,
}: {
  i: number;
  property: Handlers["valuations"]["retrieveValuation"]["property"];
}) => {
  if (!property) return null;

  // sales are in descending order
  const entry = property.transactionHistory[i];
  const prevEntry = property.transactionHistory[i + 1];

  const percentageChange = prevEntry
    ? (entry.price - prevEntry.price) / prevEntry.price
    : 0;

  return (
    <li
      key={i}
      className="rounded-xl bg-white p-4 shadow-md border mb-4 flex items-center gap-3"
    >
      <div>
        <p className="font-satoshi text-oxford-blue font-semibold">
          {new Intl.NumberFormat("en-GB", {
            style: "currency",
            maximumFractionDigits: 0,
            currency: "GBP",
          }).format(entry.price)}
        </p>
        <p className="tracking-tighter font-medium text-oxford-blue/70 mt-1">
          {new Intl.DateTimeFormat("en-GB", {
            dateStyle: "long",
          }).format(entry.date)}
        </p>
      </div>

      {percentageChange !== 0 && (
        <PercentageChangePill percentageChange={percentageChange} />
      )}
    </li>
  );
};

const PercentageChangePill = ({
  percentageChange,
}: {
  percentageChange: number;
}) => (
  <div className="px-4 py-2 bg-white rounded-full border shadow-md flex items-center gap-2">
    {percentageChange > 0 ? (
      <TrendingUp className="size-4 text-green-500" />
    ) : (
      <TrendingDown className="size-4 text-pumpkin" />
    )}
    <p
      className={`text-sm font-semibold font-satoshi ${
        percentageChange > 0 ? "text-green-500" : "text-primary"
      }`}
    >
      {new Intl.NumberFormat("en-GB", {
        style: "percent",
        maximumFractionDigits: 2,
      }).format(percentageChange)}
    </p>
  </div>
);

const FineTuneModal = ({
  overwrite,
  open,
  valuation,
  setOpen,
}: {
  overwrite: Overwrite<Handlers["valuations"]["retrieveValuation"]>;
  valuation: Handlers["valuations"]["retrieveValuation"];
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const { data: valueAdders } = useFetch<
    Handlers["valuations"]["getValueAdders"]
  >(`${process.env.NEXT_PUBLIC_API_URL}/valuations/value-adders`);

  const router = useRouter();

  const [fineTunes, setFineTunes] = useState<
    Schemas["valuations"]["fineTuneValuationSchema"]
  >([]);

  const {
    data: updatedValuation,
    mutate,
    status,
  } = useMutation<
    Handlers["valuations"]["fineTuneValuation"],
    Schemas["valuations"]["fineTuneValuationSchema"]
  >(`${process.env.NEXT_PUBLIC_API_URL}/valuations/${router.query.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
  });

  useEffect(() => {
    if (updatedValuation) {
      overwrite({
        ...valuation,
        value: updatedValuation.value,
      });
    }
  }, [updatedValuation]);

  return (
    <Modal.Root
      open={open}
      onClose={() => setOpen(false)}
      onSubmit={async () => {
        await mutate(fineTunes);
        setOpen(false);
      }}
      loading={status === "loading"}
    >
      <Modal.Title>Fine tune your valuation</Modal.Title>
      <Modal.Description>
        Adjust your valuation based on property improvements.
      </Modal.Description>
      <Modal.Body>
        <div className="mt-5 flex flex-row gap-5 flex-wrap">
          {valueAdders?.map((va) => (
            <Button
              key={va.type}
              icon={
                fineTunes.find((f) => f.type === va.type) ? CheckCircle : Circle
              }
              variant={
                fineTunes.find((f) => f.type === va.type)
                  ? "primary"
                  : "outline"
              }
              onClick={() => {
                if (fineTunes.find((f) => f.type === va.type)) {
                  setFineTunes((prev) =>
                    prev.filter((f) => f.type !== va.type),
                  );
                } else {
                  setFineTunes((prev) => [...prev, { type: va.type }]);
                }
              }}
            >
              {va.name}
            </Button>
          ))}
        </div>
      </Modal.Body>
      <Modal.Buttons />
    </Modal.Root>
  );
};

const AnimatedNumber = ({
  val,
  ...props
}: HTMLProps<HTMLParagraphElement> & { val: number }) => {
  const [prev, setPrev] = useState(val);

  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = nodeRef.current;

    const controls = animate(prev, val, {
      duration: 0.3,
      onUpdate(value) {
        if (!node) return;
        node.textContent = new Intl.NumberFormat("en-GB", {
          style: "currency",
          maximumFractionDigits: 0,
          currency: "GBP",
        }).format(value);
      },
    });

    setPrev(val);

    return () => {
      controls.stop();
    };
  }, [val]);

  return <p {...props} ref={nodeRef} />;
};
