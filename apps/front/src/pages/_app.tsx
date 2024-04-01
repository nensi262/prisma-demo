import Layout from "@/components/layout/Layout";
import CookieConsentProvider from "@/providers/CookieConsentProvider";
import "@/styles/globals.css";
import { ContentfulLivePreviewProvider } from "@contentful/live-preview/react";
import { Analytics } from "@vercel/analytics/react";
import inter from "fonts/inter";
import satoshi from "fonts/satoshi";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ContentfulLivePreviewProvider locale="en-GB">
      <CookieConsentProvider>
        <div
          className={` ${satoshi.variable} ${inter.className} ${inter.variable}`}
        >
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </div>
        <Analytics />
      </CookieConsentProvider>
    </ContentfulLivePreviewProvider>
  );
}
