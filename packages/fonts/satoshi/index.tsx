import local from "next/font/local";

const satoshi = local({
  src: [
    {
      path: "./Satoshi-Light.woff2",
      weight: "300",
    },
    {
      path: "./Satoshi-Regular.woff2",
      weight: "400",
    },
    {
      path: "./Satoshi-Medium.woff2",
      weight: "500",
    },
    {
      path: "./Satoshi-Bold.woff2",
      weight: "600",
    },
    {
      path: "./Satoshi-Black.woff2",
      weight: "700",
    },
    {
      path: "./Satoshi-Black.woff2",
      weight: "900",
    },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

export default satoshi;
