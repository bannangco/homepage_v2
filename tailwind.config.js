/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        "ink-muted": "rgb(var(--color-ink-muted) / <alpha-value>)",
        ivory: "rgb(var(--color-ivory) / <alpha-value>)",
        "ivory-muted": "rgb(var(--color-ivory-muted) / <alpha-value>)",
        signal: "rgb(var(--color-signal) / <alpha-value>)",
        grid: "rgb(var(--color-grid) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        "surface-dark": "rgb(var(--color-surface-dark) / <alpha-value>)",
        "surface-light": "rgb(var(--color-surface-light) / <alpha-value>)",
      },
      fontFamily: {
        inter: ["var(--font-inter)", "sans-serif"],
        nacelle: ["var(--font-nacelle)", "sans-serif"],
      },
      fontSize: {
        xs: ["0.8125rem", { lineHeight: "1.5384" }],
        sm: ["0.875rem", { lineHeight: "1.5715" }],
        base: [
          "0.9375rem",
          { lineHeight: "1.5333", letterSpacing: "0em" },
        ],
        lg: ["1.125rem", { lineHeight: "1.5", letterSpacing: "0em" }],
        xl: ["1.25rem", { lineHeight: "1.5", letterSpacing: "0em" }],
        "2xl": ["1.5rem", { lineHeight: "1.415", letterSpacing: "0em" }],
        "3xl": [
          "1.75rem",
          { lineHeight: "1.3571", letterSpacing: "0em" },
        ],
        "4xl": ["2.5rem", { lineHeight: "1.1", letterSpacing: "0em" }],
        "5xl": ["3.5rem", { lineHeight: "1", letterSpacing: "0em" }],
        "6xl": ["4rem", { lineHeight: "1", letterSpacing: "0em" }],
        "7xl": ["4.5rem", { lineHeight: "1", letterSpacing: "0em" }],
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
