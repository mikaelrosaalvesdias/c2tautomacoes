import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#f8fafc",
        foreground: "#0f172a",
        primary: {
          DEFAULT: "#0369a1",
          foreground: "#f8fafc"
        },
        border: "#e2e8f0",
        muted: {
          DEFAULT: "#e2e8f0",
          foreground: "#475569"
        }
      }
    }
  },
  plugins: []
};

export default config;
