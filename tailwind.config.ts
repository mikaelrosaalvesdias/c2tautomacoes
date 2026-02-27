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
        background: "#050507",
        foreground: "#f0f0f0",
        card: {
          DEFAULT: "#0f0f14",
          foreground: "#f0f0f0"
        },
        border: "#1e1e2a",
        input: "#1a1a24",
        primary: {
          DEFAULT: "#7CFC00",
          foreground: "#050507"
        },
        secondary: {
          DEFAULT: "#16161e",
          foreground: "#a0a0b0"
        },
        muted: {
          DEFAULT: "#13131a",
          foreground: "#6b7280"
        },
        neon: "#7CFC00",
        gold: "#d4a574",
        violet: "#9333ea",
        accent: {
          DEFAULT: "#7CFC00",
          foreground: "#050507"
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#fff"
        }
      },
      fontFamily: {
        display: ["var(--font-sans)", "system-ui", "sans-serif"]
      },
      fontWeight: {
        "400": "400",
        "500": "500",
        "600": "600",
        "700": "700",
        "800": "800"
      },
      spacing: {
        "4.5": "1.125rem"
      },
      keyframes: {
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px) scale(1)" },
          "50%": { transform: "translateY(-20px) scale(1.02)" }
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "0.5" }
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "neon-line": {
          "0%": { width: "0" },
          "100%": { width: "100%" }
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "15%": { transform: "translateX(-6px)" },
          "30%": { transform: "translateX(6px)" },
          "45%": { transform: "translateX(-4px)" },
          "60%": { transform: "translateX(4px)" },
          "75%": { transform: "translateX(-2px)" },
          "90%": { transform: "translateX(2px)" }
        }
      },
      animation: {
        "float-slow": "float-slow 12s ease-in-out infinite",
        "pulse-glow": "pulse-glow 4s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.5s ease-out both",
        "neon-line": "neon-line 0.8s ease-out 0.4s both",
        shake: "shake 0.5s ease-in-out"
      }
    }
  },
  plugins: []
};

export default config;
