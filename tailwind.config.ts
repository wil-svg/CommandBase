import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sand: "#F5F3ED",
        purple: {
          primary: "#534AB7",
          light: "#EEEDFE",
        },
        blue: {
          primary: "#185FA5",
          light: "#E6F1FB",
        },
        teal: {
          primary: "#0F6E56",
          light: "#E1F5EE",
        },
        coral: {
          primary: "#993C1D",
          light: "#FAECE7",
        },
        pink: {
          primary: "#993556",
          light: "#FBEAF0",
        },
        amber: {
          primary: "#854F0B",
          light: "#FAEEDA",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        card: "10px",
      },
    },
  },
  plugins: [],
};
export default config;
