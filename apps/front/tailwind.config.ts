import shared from "tailwind-config/tailwind.config";
import type { Config } from "tailwindcss";

const config: Pick<Config, "presets"> = {
  presets: [
    {
      ...shared,
      content: [
        "./src/pages/**/*.{js,ts,jsx,tsx}",
        "./src/components/**/*.{js,ts,jsx,tsx}",
        "./src/static/blog/posts/**/*.{js,ts,jsx,tsx}",
        // h/t to https://www.willliu.com/blog/Why-your-Tailwind-styles-aren-t-working-in-your-Turborepo
        "../../packages/ui/**/*.tsx",
      ],
      theme: {
        ...shared.theme,
        extend: {
          ...shared.theme?.extend,
          fontFamily: {
            ...shared.theme?.extend?.fontFamily,

            satoshi: ["var(--font-satoshi)"],
          },
        },
      },
    },
  ],
};

export default config;
