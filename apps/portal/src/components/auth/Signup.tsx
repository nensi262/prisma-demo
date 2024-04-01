import { useLogin } from "@/pages/auth";
import { mutationFetcher } from "@/utils/fetcher";
import type { Handlers, Schemas } from "api";

import { nanoid } from "nanoid";
import { useState } from "react";
import useSWRMutation from "swr/mutation";
import Button from "ui/forms/Button";
import Input from "ui/forms/Input";
import { AuthHeader, BackButton } from "../layout/AuthLayout";

export default function Signup() {
  const { email, setEmail, setView } = useLogin();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [acceptsMarketing, setAcceptsMarketing] = useState(false);

  const signup = useSWRMutation(
    {
      url: "/auth/register",
    },
    mutationFetcher<
      Handlers["auth"]["register"],
      Schemas["auth"]["registerSchema"]
    >,
  );

  const handleNext = async () => {
    // todo handle 409
    const clientCode = nanoid();
    await signup.trigger({
      acceptsMarketing,
      clientCode,
      email,
      name,
      phone,
    });

    localStorage.setItem("clientCode", clientCode);
    setView("emailSent");
  };

  return (
    <>
      <div className="max-w-lg mx-auto">
        <AuthHeader>Hello, nice to meet you!</AuthHeader>
        <p className="mt-2 text-sm text-dust font-semibold text-center">
          You look new here, let&apos;s get you set up. Just a couple details
          from you and you&apos;re good to go.
        </p>
      </div>
      <div className="mt-10 space-y-5">
        <BackButton onClick={() => setView("login")} />

        <Input
          type="text"
          label="Your Name"
          autoFocus
          error={signup.error?.data?.zodError?.fieldErrors.name?.[0]}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          onKeyDown={(e) => e.key == "Enter" && handleNext()}
          placeholder="John Doe"
        />
        <Input
          type="email"
          label="Email"
          error={signup.error?.data?.zodError?.fieldErrors.email?.[0]}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value.toLowerCase());
          }}
          onKeyDown={(e) => e.key == "Enter" && handleNext()}
          placeholder="you@example.com"
        />
        <Input
          type="tel"
          label="Phone Number"
          error={signup.error?.data?.zodError?.fieldErrors.phone?.[0]}
          value={phone}
          onChange={(e) => {
            if (!/^[0-9\b]+$/.test(e.target.value) && e.target.value.length > 0)
              return;
            setPhone(e.target.value);
          }}
          onKeyDown={(e) => e.key == "Enter" && handleNext()}
          placeholder="07000 000000"
        />
        <div className="flex items-center">
          <input
            type="checkbox"
            id="acceptsMarketing"
            checked={acceptsMarketing}
            onChange={({ target }) => setAcceptsMarketing(target.checked)}
          />
          <label htmlFor="acceptsMarketing" className="ml-2 text-sm">
            I am happy to receive marketing (redesign this)
          </label>
        </div>
        <Button
          fullWidth
          className="mt-5"
          onClick={handleNext}
          loading={signup.isMutating}
        >
          Continue
        </Button>
      </div>
      <div className="relative my-10 flex justify-center items-center">
        <div
          className="absolute inset-0 flex items-center w-full border-t border-gray-300"
          aria-hidden="true"
        ></div>
        <div className="absolute w-full h-full flex items-center justify-center">
          <div className="bg-white px-2 text-sm text-gray-400 font-semibold">
            OR
          </div>
        </div>
      </div>
      <div>
        <Button variant="outline" fullWidth className="mt-5">
          Continue with Google
        </Button>
      </div>
    </>
  );
}
