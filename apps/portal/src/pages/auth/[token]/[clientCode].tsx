import { AuthHeader } from "@/components/layout/AuthLayout";
import { useUser } from "@/providers/UserProvider";
import { mutationFetcher } from "@/utils/fetcher";
import {
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import type { Handlers, Schemas } from "api";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSWRMutation from "swr/mutation";
import Spinner from "ui/interactions/Spinner";

export default function AuthVerify() {
  const [error, setError] = useState<undefined | "warn" | "error">(undefined);
  const router = useRouter();
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
          return setError("warn");
        }
        setError("error");
      },
    },
  );

  useEffect(() => {
    if (Object.values(router.query).length == 0) return;
    if (
      Object.values(router.query).length !== 3 ||
      !Object.keys(router.query).every((key) =>
        ["clientCode", "token", "email"].includes(key),
      )
    ) {
      router.push("/");
      return;
    }

    const clientCode = localStorage.getItem("clientCode");
    if (!clientCode) {
      setError("warn");
      return;
    }
    if (router.query.clientCode !== clientCode) {
      setError("warn");
      return;
    }

    (async () => {
      const res = await verify.trigger({
        clientCode,
        token: `${router.query.token}`,
        email: `${router.query.email}`,
      });

      setBearer(res.token, res.expiresAt);

      if (res.next) return router.push(res.next);
      router.push("/");
    })();
  }, [router]);
  return (
    <>
      <Head>
        <title>Logging you in - Moove</title>
      </Head>
      <div>
        <AuthHeader>
          {!error ? "Logging you in" : "Something went wrong"}
        </AuthHeader>
        <p className="mt-2 text-sm text-dust text-center font-semibold">
          {!error
            ? "Please wait while we make sure it's you."
            : "We couldn't make sure you are who you say you are."}
        </p>
      </div>
      <div className="mt-10 flex flex-col items-center font-semibold text-center">
        {!error ? (
          <>
            <Spinner className="w-6 h-6" />
          </>
        ) : error == "warn" ? (
          <>
            <ExclamationTriangleIcon className="w-10 h-10" />
            <p className="mt-4">
              This could be because the link has expired, has already been used,
              or you are using a different browser than the one you used to sign
              in.
            </p>
          </>
        ) : (
          <ExclamationCircleIcon className="w-10 h-10" />
        )}
      </div>
    </>
  );
}
