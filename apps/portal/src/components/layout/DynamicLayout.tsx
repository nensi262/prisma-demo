import { SellerFlowWrapper } from "@/components/flows/sell/SellerFlowWrapper";
import React from "react";
import AuthLayout from "./AuthLayout";
import Header from "./navigation/Header";

import inter from "fonts/inter";
import satoshi from "fonts/satoshi";

export default function DynamicLayout({
  children,
  pathname,
}: {
  children: React.ReactNode;
  pathname: string;
}) {
  return (
    <div
      className={`${satoshi.className} ${satoshi.variable} ${inter.variable} bg-white w-full overflow-auto`}
      drawer-wrapper=""
    >
      {pathname.startsWith("/auth") ? (
        <AuthLayout>{children}</AuthLayout>
      ) : pathname.startsWith("/sell") ? (
        <SellerFlowWrapper>{children}</SellerFlowWrapper>
      ) : (
        <>
          <Header />
          <div className="pt-20 pb-5">{children}</div>
        </>
      )}
    </div>
  );
}
