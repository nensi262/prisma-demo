import shared from "tailwind-config/tailwind.config";
import type { Config } from "tailwindcss";

const config: Pick<Config, "presets"> = {
  presets: [
    {
      ...shared,
      content: [
        "./src/pages/**/*.{js,ts,jsx,tsx}",
        "./src/components/**/*.{js,ts,jsx,tsx}",
        // h/t to https://www.willliu.com/blog/Why-your-Tailwind-styles-aren-t-working-in-your-Turborepo
        "../../packages/ui/**/*.tsx",
        "../../packages/drawer/**/*.tsx",
      ],
      theme: {
        ...shared.theme,
        extend: {
          ...shared.theme?.extend,
          animation: {
            travel: "travel 1.8s linear infinite",
          },
          keyframes: {
            travel: {
              "0%": { strokeDashoffset: "100" },
              "100%": { strokeDashoffset: "0" },
            },
          },
        },
      },
    },
  ],
} as Pick<Config, "presets">;

export default config;
