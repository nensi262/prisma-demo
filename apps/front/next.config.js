/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["ui"],
  experimental: {
    scrollRestoration: true,
  },
  images: {
    domains: ["localhost", "images.ctfassets.net"],
  },
  async redirects() {
    return [
      {
        source: "/blog/uk-property-market-2024-promising-start",
        destination:
          "/blog/news-and-insights/uk-property-market-2024-promising-start",
        permanent: true,
      },
      {
        source: "/blog/moove-news-starting-the-moovement-january-2024",
        destination: "/blog/moove-news/starting-the-moovement-january-2024",
        permanent: true,
      },
      {
        source: "/blog/top-features-homebuyers-new-house-2024",
        destination:
          "/blog/buying-guides/top-features-homebuyers-new-house-2024",
        permanent: true,
      },
      {
        source: "/blog/what-impacts-how-much-i-can-borrow-to-buy-a-property",
        destination:
          "/blog/finances/what-impacts-how-much-i-can-borrow-to-buy-a-property",
        permanent: true,
      },
      {
        source: "/blog/the-ultimate-guide-to-buying-a-house",
        destination: "/blog/buying-guides/the-ultimate-guide-to-buying-a-house",
        permanent: true,
      },
      {
        source: "/blog/can-you-sell-your-house-without-estate-agent",
        destination:
          "/blog/selling-guides/can-you-sell-your-house-without-estate-agent",
        permanent: true,
      },
      {
        source: "/blog/save-money-buying-real-estate",
        destination: "/blog/finances/save-money-buying-real-estate",
        permanent: true,
      },
      {
        source: "/blog/selling-home-without-estate-agent-diy",
        destination:
          "/blog/selling-guides/selling-home-without-estate-agent-diy",
        permanent: true,
      },
      {
        source: "/blog/house-prices-uk-important-factors",
        destination: "/blog/selling-guides/house-prices-uk-important-factors",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;


// Injected content via Sentry wizard below

const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(
  module.exports,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,
    org: "moovedev",
    project: "front",
  },
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: true,

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    tunnelRoute: "/monitoring",

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors.
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
  }
);
