import { PartyPopper, ServerCrash } from "lucide-react";
import { useState } from "react";
import Button from "ui/forms/Button";
import Input from "./forms/Input";

export default function RegisterInterestBanner({
  className,
}: {
  className: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"success" | "error" | "loading" | null>(
    null,
  );

  const registerInterest = async () => {
    setStatus("loading");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
      }),
    });

    if (!res.ok) return setStatus("error");

    setStatus("success");
    if ("gtag" in window) window.gtag("event", "register_interest");
  };

  return (
    <div className={className}>
      {status == "success" ? (
        <div className="flex items-center space-x-5">
          <div className="w-16 h-16 min-w-[64px] flex items-center justify-center rounded-full bg-blue-100 text-blue-500">
            <PartyPopper />
          </div>
          <div>
            <p className="text-lg font-bold">You&apos;re on the list</p>
            <p>
              Thanks for signing up, you&apos;ll be the first to know when we
              launch.
            </p>
          </div>
        </div>
      ) : (
        <>
          <p className="max-w-xl mb-5 font-medium">
            Moove is a new way to buy and sell property, coming soon. Register
            your interest for the future of real estate, and be the first to be
            contacted when we launch.
          </p>
          <div className="flex items-center gap-5">
            <Input
              type="email"
              className="w-full"
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key == "Enter" && registerInterest()}
              placeholder="myemail@example.com"
            />
            <Button loading={status == "loading"} onClick={registerInterest}>
              Register
            </Button>
          </div>
          {status == "error" && (
            <div className="flex items-center mt-10 space-x-5">
              <div className="w-16 h-16 min-w-[64px] flex items-center justify-center rounded-full bg-red-100 text-red-500">
                <ServerCrash />
              </div>
              <div>
                <p className="text-lg font-bold">Something went wrong</p>
                <p>
                  Sorry about that, please make sure your email is spelt
                  correctly and try again.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
