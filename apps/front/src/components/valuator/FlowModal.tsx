import useURLState from "@/hooks/useURLState";
import inter from "fonts/inter";
import satoshi from "fonts/satoshi";
import { motion } from "framer-motion";
import useDebounce from "hooks/useDebounce";
import useFetch, { useMutation } from "hooks/useFetch";
import { Keys } from "ui/logos/Keys";

import type { Handlers, Schemas } from "api";
import { ArrowRight, HandCoins, LocateOff } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";
import Button from "ui/forms/Button";
import Input from "ui/forms/Input";
import Select from "ui/forms/Select";
import ConfusedLocation from "../icons/ConfusedLocation";

export default function FlowModal() {
  const [{ query }, { setQuery }] = useURLState();
  const router = useRouter();
  const value = useDebounce(query.postcode as string, 300);

  const { data: addresses } = useFetch<Handlers["valuations"]["inPostcode"]>(
    `${process.env.NEXT_PUBLIC_API_URL}/valuations/postcode/${value}`,
    {
      enabled: !!query.postcode,
    },
  );

  const m = useMutation<
    Handlers["valuations"]["generateValuation"],
    Schemas["valuations"]["generatePublicValuationSchema"]
  >(`${process.env.NEXT_PUBLIC_API_URL}/valuations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    marketing: false,
  });

  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [showAreaExplain, setShowAreaExplain] = useState(false);

  // const e = useMutation(
  //   "https://ft53mwfm5j.execute-api.eu-west-2.amazonaws.com/valuations",
  //   {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   },
  // );

  // useFetch -> addresses from api
  // address isn't listed button and modal confirmation for area only
  // steps derived from url state. postcode = address lookup -> address id = we found your property/rough location (show basic info) -> fill in user details

  // after user details. redirect to /value-my-home/uuid & allow user to fine tune valuation

  return (
    <motion.div
      animate={{
        opacity: [0, 1, 1],
        backdropFilter: ["blur(0px)", "blur(10px)", "blur(20px)"],
        background: [
          "rgba(255,255,255,0)",
          "rgba(255,255,255,0.7)",
          "rgba(255,255,255,1)",
        ],
      }}
      exit={{
        opacity: 0,
        backdropFilter: "blur(0px)",
        background: "rgba(255,255,255,0)",
      }}
      className={`${satoshi.variable} ${inter.variable} w-screen h-screen fixed top-0 left-0 z-[100] flex justify-center text-oxford-blue`}
    >
      <div className="max-w-xl flex flex-col items-center py-12">
        <Keys className="text-primary h-12" />
        {!query.id ? (
          <>
            <h2 className="text-3xl font-satoshi font-semibold mt-10">
              Please select your property
            </h2>
            <div className="mt-10 max-w-sm w-full">
              <Input
                label="Postcode"
                value={query.postcode}
                className="w-full"
                onChange={(e) =>
                  setQuery((q) => ({ ...q, postcode: e.target.value }))
                }
              />
              <Select
                label="Address"
                className="mt-8 w-full"
                placeholder="Select your address"
                value={selectedAddress}
                onChange={(e) => {
                  setSelectedAddress(e.target.value);
                }}
                options={
                  addresses?.map((a) => ({ label: a.line1, value: a.id })) || []
                }
              />
              <Button
                icon={ArrowRight}
                fullWidth
                disabled={!selectedAddress}
                className="mt-12"
                onClick={() => {
                  setQuery((q) => ({ ...q, id: selectedAddress }));
                }}
              >
                Continue
              </Button>
              <Button
                variant="outline"
                icon={showAreaExplain ? LocateOff : undefined}
                fullWidth
                className="mt-5"
                onClick={() => {
                  if (!showAreaExplain) return setShowAreaExplain(true);
                  setQuery((q) => ({ ...q, id: "area" }));
                }}
              >
                {showAreaExplain
                  ? "Continue with postcode"
                  : "My property isn't listed?"}
              </Button>
              {showAreaExplain && (
                <div className="mt-5 max-w-sm">
                  <div className="flex items-start gap-5">
                    <ConfusedLocation className="min-w-[48px] w-12" />
                    <div>
                      <p className="font-semibold tracking-tight">
                        Where&apos;s my house?
                      </p>
                      <p className="text-sm font-medium tracking-tight">
                        We can only provide valuations for properties that have
                        been sold since 1995. If your property isn&apos;t
                        listed, it may be because it hasn&apos;t been sold since
                        then.
                      </p>
                      <p className="mt-2 text-sm font-medium">
                        You can still get a rough valuation of your area by
                        continuing with your postcode.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-satoshi font-semibold mt-10">
              You&apos;re one step away!
            </h2>
            <div className="mt-10 max-w-sm">
              <p className="font-medium tracking-tight text-center">
                We just need a couple details from you.{" "}
                <span className="font-bold">Don&apos;t worry</span> we will{" "}
                <span className="font-bold">never</span> share your information.
              </p>
              <Input
                label="Name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className="mt-8"
                placeholder="E.g. John Doe"
              />

              <Input
                type="email"
                label="Email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                className="mt-4"
                placeholder="E.g. john.doe@example.com"
              />
              <p className="text-sm font-medium mt-2 text-platinum-800 tracking-tight">
                We&apos;ll send you a copy of your valuation and store it for
                you to return to later.
              </p>
              <div className="mt-4">
                <input
                  type="checkbox"
                  id="marketing"
                  checked={form.marketing}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, marketing: e.target.checked }))
                  }
                />
                <label htmlFor="marketing" className="ml-2">
                  (todo redesign) I&apos;d like to receive marketing emails
                </label>
              </div>
              <div className="mt-6">
                <Button
                  icon={HandCoins}
                  fullWidth
                  loading={m.status === "loading"}
                  onClick={async () => {
                    const res = await m.mutate({
                      email: form.email,
                      name: form.name,
                      marketing: form.marketing,
                      propertyId:
                        query.id === "area" ? undefined : (query.id as string),

                      postcode: query.postcode as string,
                    });
                    router.push(`/value-my-home/${res?.id}`);
                  }}
                >
                  Get my valuation
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
