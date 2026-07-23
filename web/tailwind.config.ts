import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0B1220",
          soft: "#39435A",
          faint: "#7B879E",
        },
        brand: {
          50: "#EEF4FF",
          100: "#DCE8FF",
          200: "#BBD1FF",
          300: "#8DB2FF",
          400: "#5B8CFB",
          500: "#356CF0",
          600: "#2455D6",
          700: "#1D43AC",
          800: "#1B3A88",
          900: "#1B346D",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          soft: "#F6F8FC",
          mute: "#EEF2F9",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,0.04), 0 8px 24px rgba(16,24,40,0.06)",
        lift: "0 12px 40px rgba(29,67,172,0.14)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
