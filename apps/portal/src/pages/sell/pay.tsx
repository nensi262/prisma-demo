import { useSellerFlow } from "@/components/flows/sell/SellerFlowWrapper";
import FlowHeading from "@/components/flows/sell/typography/FlowHeading";
import FlowSubHeading from "@/components/flows/sell/typography/FlowSubHeading";
import CheckoutForm from "@/components/layout/CheckoutForm";
import { useUser } from "@/providers/UserProvider";
import { mutationFetcher } from "@/utils/fetcher";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import type { Handlers, Schemas } from "api";
import Link from "next/link";
import { useState } from "react";
import useSWRMutation from "swr/mutation";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string,
);

export default function Stripe() {
  const [clientSecret, setClientSecret] = useState("");
  const [amount, setAmount] = useState(0);
  const { bearer } = useUser();

  const createPayment = useSWRMutation(
    {
      url: `/payments/create`,
      bearer,
    },
    mutationFetcher<
      Handlers["payments"]["create"],
      Schemas["payments"]["createListingPaymentSchema"]
    >,
  );

  const { listing } = useSellerFlow({
    onSuccess: async ({ listing }) => {
      if (!listing) return;
      const data = await createPayment.trigger({
        listingId: listing.id,
      });
      setClientSecret(data.secret ?? "");
      setAmount(data.amount);
    },
  });

  return (
    <>
      <FlowHeading>Payment Section Title</FlowHeading>
      <FlowSubHeading className="mt-5">
        Payment section prose. KEV - use 4242 4242 4242 4242 and any future
        expiry and any CVC to simulate a succesful payment. Don&apos;t put any
        real card details in - it wont charge you but is against TOS.{" "}
        <Link
          href="https://stripe.com/docs/testing#cards"
          className="underline text-primary"
        >
          More test cards
        </Link>
      </FlowSubHeading>

      <p className="text-lg font-medium mt-10">
        {new Intl.NumberFormat("en-gb", {
          currency: "GBP",
          style: "currency",
        }).format(amount / 100)}{" "}
      </p>
      <p>account bypass/discount info would be displayed here</p>
      <div className="mt-5 mb-10">
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
    </>
  );
}
