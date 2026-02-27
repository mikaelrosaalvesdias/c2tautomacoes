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
        background: "#0a0a0f",
        foreground: "#f0f0f0",
        card: {
          DEFAULT: "#13131a",
          foreground: "#f0f0f0"
        },
        border: "#1e1e2a",
        input: "#1e1e2a",
        primary: {
          DEFAULT: "#a3e635",
          foreground: "#0a0a0f"
        },
        secondary: {
          DEFAULT: "#1a1a24",
          foreground: "#a0a0b0"
        },
        muted: {
          DEFAULT: "#16161e",
          foreground: "#6b7280"
        },
        neon: "#a3e635",
        accent: {
          DEFAULT: "#a3e635",
          foreground: "#0a0a0f"
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#fff"
        }
      },
      fontWeight: {
        "500": "500",
        "600": "600",
        "700": "700"
      },
      fontFamily: {
        display: ["var(--font-sans)", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
