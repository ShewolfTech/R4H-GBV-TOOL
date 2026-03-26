import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  "#fdf2f8",
          100: "#fce7f3",
          300: "#f9a8d4",
          500: "#7bdcb5",
          600: "#7a1d48",
          700: "#6b183e",
          800: "#25d366",
          900: "#254252",
        },
        accent: { DEFAULT: "#D4A853", light: "#e8c97a", dark: "#b8892e" },
        safe: "#2D6A4F",
        danger: "#C0392B",
      },
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        body:    ["'DM Sans'", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in":    "fadeIn 0.5s ease-in-out",
        "slide-up":   "slideUp 0.4s ease-out",
        "pulse-soft": "pulseSoft 2s infinite",
      },
      keyframes: {
        fadeIn:    { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp:   { "0%": { opacity: "0", transform: "translateY(20px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        pulseSoft: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.6" } },
      },
    },
  },
  plugins: [],
};
export default config;
