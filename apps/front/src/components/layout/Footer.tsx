import Link from "next/link";
import { useRouter } from "next/router";
import RegisterInterestBanner from "../RegisterInterestBanner";
import { Instagram } from "../icons/Instagram";
import { TwitterX } from "../icons/TwitterX";

export default function Footer() {
  const router = useRouter();
  return (
    <div className="w-full py-10 px-10 bg-gray-100 font-light text-sm text-gray-500">
      <div className="max-w-7xl mx-auto flex flex-col mb-7 sm:mb-0 sm:flex-row justify-between items-center">
        {router.pathname !== "/" ? (
          <RegisterInterestBanner className="max-w-lg mb-10" />
        ) : (
          <span></span>
        )}
        <div className="flex items-center gap-3.5 pb-5">
          <Link
            href="https://www.instagram.com/moove.uk"
            rel="noopener"
            target="_blank"
          >
            <Instagram className="h-5 hover:text-black transition-all" />
          </Link>
          <Link
            href="https://x.com/MooveUpdates"
            rel="noopener"
            target="_blank"
          >
            <TwitterX className="h-5 hover:text-black transition-all" />
          </Link>
        </div>
      </div>
      <div className="max-w-7xl mx-auto flex items-center justify-between ">
        <div>
          <p>
            &copy; Moove House Limited {new Date().getFullYear()}. All Rights
            Reserved
          </p>
        </div>
        <a href="mailto:hello@moove.house">hello@moove.house</a>
      </div>
    </div>
  );
}
