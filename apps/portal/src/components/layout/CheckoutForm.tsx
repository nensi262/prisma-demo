import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  PaymentRequestButtonElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import {
  PaymentRequest,
  StripeCardNumberElementChangeEvent,
} from "@stripe/stripe-js";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
import Input from "ui/forms/Input";
import Alert from "ui/interactions/Alert";
import { useUser } from "../../providers/UserProvider";
import { formatPostcode } from "../../utils/postcodes";
import NavigationButtons from "../flows/sell/NavigationButtons";

export default function CheckoutForm({
  clientSecret,
  amount,
  postcodeSuggestion = "",
}: {
  clientSecret: string;
  amount: number;
  postcodeSuggestion?: string;
}) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useUser();

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState<null | PaymentRequest>(
    null,
  );
  const [name, setName] = useState(user?.name ?? "");
  const [postcode, setPostcode] = useState(postcodeSuggestion);

  const [cardBrand, setCardBrand] =
    useState<StripeCardNumberElementChangeEvent["brand"]>("unknown");

  useEffect(() => {
    if (!stripe) return;

    (async () => {
      const request = stripe.paymentRequest({
        country: "GB",
        currency: "gbp",
        total: {
          label: "Moove Payment",
          amount,
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });

      const check = await request.canMakePayment();
      if (!check) return;

      setPaymentRequest(request);

      request.on("paymentmethod", async (event) => {
        const { error } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: event.paymentMethod.id,
        });

        if (error) {
          console.log(error);
          setError(error.message ?? "");
          return;
        }

        // next function
      });
    })();
  }, [stripe]);

  const handleCardUpdate = (e: StripeCardNumberElementChangeEvent) => {
    setCardBrand(e.brand);
  };

  const handleSubmit = async (nextStep: () => void) => {
    if (!stripe || !elements) return;

    setIsLoading(true);

    const card = elements.getElement(CardNumberElement);
    if (!card) return;

    const { error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card,
        billing_details: {
          name,
          email: user?.email,
          address: {
            postal_code: postcode,
            country: "GB",
          },
        },
      },

      return_url: `${process.env.NEXT_PUBLIC_DOMAIN}${router.asPath}`,
    });

    setIsLoading(false);
    if (error) {
      setError(error.message ?? "");
      return;
    }

    nextStep();
  };

  return (
    <>
      {paymentRequest && (
        <PaymentRequestButtonElement options={{ paymentRequest }} />
      )}
      <Input
        label="Name on Card"
        placeholder="Albert Einstein"
        className="mb-5"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <InputWrapper label="Card Number" id="card-number">
        <CardNumberElement
          id="card-number"
          className="block w-full py-3 px-3 text-gray-900 bg-gray-50 border border-gray-200 placeholder:text-gray-400 focus:ring-2 focus:outline-none ring-gray-300 focus:ring-primary rounded-lg transition-all text-base font-semibold sm:leading-6"
          options={{
            showIcon: true,
            style: { base: { fontSize: "16px" } },
            classes: {
              invalid: "border-red-500",
              focus: "ring-2 ring-primary",
            },
          }}
          onChange={handleCardUpdate}
        />
      </InputWrapper>
      <div className="grid grid-cols-2 gap-5 mt-5">
        <InputWrapper
          label={cardBrand === "amex" ? "CID" : "CVC"}
          id="card-cvc"
        >
          <CardCvcElement
            id="card-cvc"
            options={{
              style: { base: { fontSize: "16px" } },
              classes: {
                invalid: "border-red-500",
                focus: "ring-2 ring-primary",
              },
            }}
            className="block w-full py-3 px-3 text-gray-900 bg-gray-50 border border-gray-200 placeholder:text-gray-400 focus:ring-2 focus:outline-none ring-gray-300 focus:ring-primary rounded-lg transition-all text-base font-semibold sm:leading-"
          />
        </InputWrapper>
        <InputWrapper label="Expiry Date" id="card-expiry">
          <CardExpiryElement
            id="card-expiry"
            options={{
              style: { base: { fontSize: "16px" } },
              classes: {
                invalid: "border-red-500",
                focus: "ring-2 ring-primary",
              },
            }}
            className="block w-full py-3 px-3 text-gray-900 bg-gray-50 border border-gray-200 placeholder:text-gray-400 focus:ring-2 focus:outline-none ring-gray-300 focus:ring-primary rounded-lg transition-all text-base font-semibold sm:leading-"
          />
        </InputWrapper>
      </div>
      <Input
        label="Postcode"
        id="postcode"
        className="mt-5"
        value={postcode}
        onChange={(e) => formatPostcode(e.target.value, (p) => setPostcode(p))}
      />

      {error && (
        <Alert severity="error" title="Payment Failed" className="mt-10">
          {error}
        </Alert>
      )}

      <NavigationButtons
        onNext={handleSubmit}
        nextText="Pay & Continue"
        loading={isLoading}
        disableNext={isLoading || !stripe || !elements}
      />
    </>
  );
}

const InputWrapper = ({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: ReactNode;
}) => {
  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="bg-white px-1 text-sm pb-1.5 block font-medium text-gray-500"
        >
          {label}
        </label>
      )}
      {children}
    </div>
  );
};
