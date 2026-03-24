import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0f1a",
        surface: "#111827",
        border: "#1f2937",
        gold: {
          DEFAULT: "#d4a44a",
          dark: "#7d5a0b",
        },
        room: {
          bay: "#1a5276",
          office: "#2c3e7a",
          common: "#6c3483",
          utility: "#5d4e60",
          bedroom: "#1a5c5c",
          corridor: "#3a3a3a",
        },
        status: {
          available: "#1a5276",
          pledged: "#7d5a0b",
          sold: "#0e6b3a",
        },
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
