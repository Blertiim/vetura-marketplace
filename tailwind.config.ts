import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff8ff",
          100: "#dbeefe",
          500: "#0d84f2",
          600: "#0868c4",
          700: "#065299",
        },
      },
    },
  },
  plugins: [],
};
export default config;
