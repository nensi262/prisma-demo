import Footer from "@/components/layout/Footer";
import Nav from "@/components/layout/Nav";
import Head from "next/head";

import Script from "next/script";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <Nav />
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Moove",
              url: "https://www.moove.house",
              logo: "https://www.moove.house/logos/bow.png",
              sameAs: [
                "https://www.instagram.com/moove.uk",
                "https://twitter.com/MooveUpdates",
                "https://www.linkedin.com/company/moovehouse",
              ],
            }),
          }}
        />
      </Head>
      {children}
      {process.env.NEXT_PUBLIC_ENVIRONMENT === "production" && (
        <>
          <Script
            strategy="afterInteractive"
            async
            src="https://www.googletagmanager.com/gtag/js?id=G-JR9VE37Z5B"
          />
          <Script id="gtm" strategy="afterInteractive">
            {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-JR9VE37Z5B');
          `}
          </Script>
        </>
      )}

      <Footer />
    </>
  );
}
