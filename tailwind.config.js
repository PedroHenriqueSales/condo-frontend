/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "Segoe UI", "Roboto", "Arial", "sans-serif"],
      },
      borderRadius: {
        xl: "14px",
        "2xl": "16px",
      },
      colors: {
        bg: "rgb(var(--c-bg) / <alpha-value>)",
        surface: "rgb(var(--c-surface) / <alpha-value>)",
        text: "rgb(var(--c-text) / <alpha-value>)",
        muted: "rgb(var(--c-muted) / <alpha-value>)",
        border: "rgb(var(--c-border) / <alpha-value>)",
        primary: "rgb(var(--c-primary) / <alpha-value>)",
        "primary-strong": "rgb(var(--c-primary-strong) / <alpha-value>)",
        accent: "rgb(var(--c-accent) / <alpha-value>)",
        "accent-strong": "rgb(var(--c-accent-strong) / <alpha-value>)",
        info: "rgb(var(--c-info) / <alpha-value>)",
        price: "rgb(var(--c-price) / <alpha-value>)",
        card: "rgb(var(--c-card) / <alpha-value>)",
        danger: "rgb(var(--c-danger) / <alpha-value>)",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(89, 63, 40, 0.12)",
        card: "0 8px 24px rgba(89, 63, 40, 0.1)",
      },
    },
  },
  plugins: [],
}

