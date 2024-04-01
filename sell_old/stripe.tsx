import { FlowSection } from "@/components/flows/FlowLayout";

import { H1 } from "@/components/typography/Heading";

import { useSellerFlow } from "@/components/flows/sell/SellerFlowWrapper";
import CheckoutForm from "@/components/layout/CheckoutForm";
import { trpc } from "@/utils/trpc";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string,
);

export default function Stripe() {
  const [clientSecret, setClientSecret] = useState("");
  const [amount, setAmount] = useState(0);
  const createPaymentIntent = trpc.listings.createPayment.useMutation();

  const { listing } = useSellerFlow({
    onSuccess: async ({ listing }) => {
      if (!listing) return;
      const data = await createPaymentIntent.mutateAsync({
        listingId: listing.id,
      });
      setClientSecret(data.secret ?? "");
      setAmount(data.amount);
    },
  });

  return (
    <>
      <FlowSection>
        <H1>Almost there</H1>
      </FlowSection>
      <FlowSection>
        <p className="mb-5">
          Almost there now. Just a{" "}
          {new Intl.NumberFormat("en-gb", {
            currency: "GBP",
            style: "currency",
          }).format(amount / 100)}{" "}
          payment to get you up and running.
        </p>
        <div className="mt-10 mb-10">
          {clientSecret && (
            <Elements
              options={{
                appearance: { theme: "stripe" },
                clientSecret,
                locale: "en",
              }}
              stripe={stripePromise}
            >
              <CheckoutForm
                clientSecret={clientSecret}
                amount={amount}
                postcodeSuggestion={listing.property.postcode}
              />
            </Elements>
          )}
        </div>
      </FlowSection>
    </>
  );
}
