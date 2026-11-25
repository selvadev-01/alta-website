import type { Config } from "tailwindcss";

// One dark theme, one accent (jade), one radius (2px).
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0D1012",
        slate: "#161B1E",
        line: "#2B3338",
        bone: "#ECEEEA",
        mist: "#A6AEB2",
        jade: "#62CBA8",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        base: ["17px", { lineHeight: "1.6" }],
      },
      borderRadius: { DEFAULT: "2px", sm: "2px", md: "2px", lg: "2px" },
      maxWidth: { page: "1360px" },
    },
  },
  plugins: [],
};
export default config;
