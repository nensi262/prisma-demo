import "@/styles/globals.css";
import { fetcher } from "@/utils/fetcher";
import { AppProps } from "next/app";
import { SWRConfig } from "swr";
import DynamicLayout from "../components/layout/DynamicLayout";
import { UserProvider } from "../providers/UserProvider";

export default function Moove({ Component, pageProps, router }: AppProps) {
  return (
    <SWRConfig value={{ fetcher }}>
      <UserProvider>
        <DynamicLayout pathname={router.pathname}>
          <Component {...pageProps} />
        </DynamicLayout>
      </UserProvider>
    </SWRConfig>
  );
}
