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
        "brand-primary": "#34C6F4", // Cyan Main
        "brand-secondary": "#E1F5FE", // Light Cyan
        "brand-bg": "#F8FAFC", // Cool White/Slate 50
        "brand-border": "#E2E8F0", // Slate 200
        "brand-text": "#1E293B", // Slate 800
        "brand-dark": "#0F172A", // Slate 900
        // Legacy mappings (temporary if needed, but we will replace)
        "warm-sand": "#F8FAFC",
        "soft-clay": "#E2E8F0",
        "forest-green": "#34C6F4",
        "soft-sage": "#E1F5FE",
        "charcoal": "#1E293B",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
