import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#090b0f",
        panel: "#111419",
        line: "#242831",
        mint: "#6ee7b7",
        violet: "#a78bfa",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(110, 231, 183, 0.08)",
      },
    },
  },
  plugins: [],
} satisfies Config;
