import { useLogin } from "@/pages/auth";
import { mutationFetcher } from "@/utils/fetcher";
import type { Handlers, Schemas } from "api";
import { nanoid } from "nanoid";
import { useRouter } from "next/router";
import useSWRMutation from "swr/mutation";
import Button from "ui/forms/Button";
import Input from "ui/forms/Input";
import { AuthHeader } from "../layout/AuthLayout";

export default function Login() {
  const { email, setView, setEmail } = useLogin();

  const router = useRouter();
  const login = useSWRMutation(
    {
      url: "/auth/login",
    },
    mutationFetcher<Handlers["auth"]["login"], Schemas["auth"]["loginSchema"]>,
  );

  const handleNext = async () => {
    const clientCode = nanoid();

    const res = await login.trigger({
      clientCode,
      email,
      next: router.query.next as string,
    });

    if (res.next === "signup") {
      return setView("signup");
    }

    localStorage.setItem("clientCode", clientCode);
    setView("emailSent");
  };

  return (
    <>
      <div className="max-w-lg mx-auto">
        <AuthHeader>Welcome home</AuthHeader>
        <p className="mt-2 text-sm text-dust text-center font-semibold">
          Enter your email address to login or create an account, or use one of
          the providers below.
        </p>
      </div>
      <div className="mt-10">
        <Input
          type="email"
          label="Email"
          value={email}
          error={login.error?.issues?.email}
          onChange={(e) => {
            setEmail(e.target.value.toLowerCase());
          }}
          onKeyDown={(e) => e.key == "Enter" && handleNext()}
          placeholder="you@example.com"
        />
        <Button
          fullWidth
          className="mt-5"
          onClick={handleNext}
          loading={login.isMutating}
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
          Login with Google
        </Button>
      </div>
    </>
  );
}
