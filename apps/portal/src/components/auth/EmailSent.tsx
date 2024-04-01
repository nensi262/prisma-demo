import { useLogin } from "@/pages/auth";
import { useUser } from "@/providers/UserProvider";
import { mutationFetcher } from "@/utils/fetcher";
import type { Handlers, Schemas } from "api";
import { useRouter } from "next/router";
import { useState } from "react";
import useSWRMutation from "swr/mutation";
import CodeInput from "ui/forms/CodeInput";
import { AuthHeader, BackButton } from "../layout/AuthLayout";

export default function EmailSent() {
  const { email, setView } = useLogin();
  const router = useRouter();

  const [error, setError] = useState("");
  const { setBearer } = useUser();

  const verify = useSWRMutation(
    {
      url: "/auth/verify",
    },
    mutationFetcher<
      Handlers["auth"]["verify"],
      Schemas["auth"]["verifySchema"]
    >,
    {
      onError: (error) => {
        if (error.status === 401) {
          return setError(
            "The code you entered is incorrect, or has already been used.",
          );
        }
        setError("Something went wrong while trying to log you in.");
      },
    },
  );

  const onComplete = async (code: string) => {
    const clientCode = localStorage.getItem("clientCode") ?? undefined;

    const res = await verify.trigger({
      clientCode,
      code: parseInt(code),
      email: email,
    });

    setBearer(res.token, res.expiresAt);

    if (res.next) return router.push(res.next);
    router.push("/");
  };

  return (
    <>
      <div className="max-w-lg mx-auto">
        <AuthHeader>Check your emails</AuthHeader>
        <p className="mt-2 text-sm text-dust text-center font-semibold">
          We have sent you a one-time login link and code. Click the link in
          your email or enter the code below to continue.
        </p>
        <div className="mt-10">
          <BackButton onClick={() => setView("login")} />
          <div className="flex justify-center">
            <CodeInput
              loading={verify.isMutating}
              error={error}
              onComplete={onComplete}
              length={6}
              label="Code"
            />
          </div>
          <div className="mt-4 text-sm font-semibold text-gray-600">
            Not got it? Resend code (implement this)
          </div>
        </div>
      </div>
    </>
  );
}
