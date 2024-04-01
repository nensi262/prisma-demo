import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { createPortal } from "react-dom";
import Logo from "../Logo";

export default function Nav() {
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const items = [
    { name: "Glossary", href: "/property-terms" },
    { name: "Blog", href: "/blog", catchAll: true },
    { name: "About", href: "/about" },
  ];

  return (
    <div
      className={`w-full fixed top-0 left-0 z-[100] ${
        mobileNavOpen ? "bg-gray-100" : "bg-white/10"
      } backdrop-blur-lg transition-all`}
    >
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8 h-20"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Moove</span>
            <Logo className="w-40" />
          </Link>
        </div>

        <div className="hidden sm:flex sm:gap-x-12">
          {items.map(({ name, href, catchAll }) => (
            <Link
              href={href}
              key={href}
              className={`text-sm font-bold leading-6 ${
                (
                  catchAll
                    ? router.pathname.startsWith(href)
                    : router.pathname === href
                )
                  ? "text-primary"
                  : "text-black"
              }`}
            >
              {name}
            </Link>
          ))}
        </div>
        <div className="sm:hidden flex items-center">
          <button onClick={() => setMobileNavOpen(!mobileNavOpen)}>
            <span className="sr-only">Open main menu</span>
            {mobileNavOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>
      {mobileNavOpen &&
        createPortal(
          <div className="fixed flex-col flex space-y-5 top-20 w-full h-screen bg-gray-100 z-[60] px-6 pt-10">
            {items.map(({ name, href, catchAll }) => (
              <Link
                href={href}
                key={href}
                onClick={() => setMobileNavOpen(false)}
                className={`font-semibold font-satoshi leading-6 ${
                  (
                    catchAll
                      ? router.pathname.startsWith(href)
                      : router.pathname === href
                  )
                    ? "text-primary"
                    : "text-black"
                }`}
              >
                {name}
              </Link>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
