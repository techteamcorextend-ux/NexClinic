import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // `<alpha-value>` keeps opacity modifiers (text-ink/60, border-line/70)
      // working against CSS-variable colors.
      colors: {
        bg: "rgb(var(--bg-rgb) / <alpha-value>)",
        "bg-frame": "rgb(var(--bg-frame-rgb) / <alpha-value>)",
        surface: {
          DEFAULT: "rgb(var(--surface-rgb) / <alpha-value>)",
          tint: "rgb(var(--surface-tint-rgb) / <alpha-value>)",
        },
        ink: {
          DEFAULT: "rgb(var(--ink-rgb) / <alpha-value>)",
          muted: "rgb(var(--ink-muted-rgb) / <alpha-value>)",
        },
        line: "rgb(var(--border-rgb) / <alpha-value>)",
        accent: {
          start: "rgb(var(--accent-start-rgb) / <alpha-value>)",
          mid: "rgb(var(--accent-mid-rgb) / <alpha-value>)",
          end: "rgb(var(--accent-end-rgb) / <alpha-value>)",
        },

        // Role portals — values come from the active .theme-* skin
        p: {
          bg: "rgb(var(--p-bg) / <alpha-value>)",
          card: "rgb(var(--p-card) / <alpha-value>)",
          ink: "rgb(var(--p-ink) / <alpha-value>)",
          muted: "rgb(var(--p-muted) / <alpha-value>)",
          line: "rgb(var(--p-line) / <alpha-value>)",
          accent: "rgb(var(--p-accent) / <alpha-value>)",
          accent2: "rgb(var(--p-accent-2) / <alpha-value>)",
          soft: "rgb(var(--p-soft) / <alpha-value>)",
        },

        // Super Admin panel palette
        admin: {
          bg: "rgb(var(--admin-page-bg-rgb) / <alpha-value>)",
          sidebar: "rgb(var(--admin-sidebar-bg-rgb) / <alpha-value>)",
          card: "rgb(var(--admin-card-bg-rgb) / <alpha-value>)",
          ink: "rgb(var(--admin-ink-rgb) / <alpha-value>)",
          muted: "rgb(var(--admin-muted-rgb) / <alpha-value>)",
          soft: "rgb(var(--admin-muted-soft-rgb) / <alpha-value>)",
          line: "rgb(var(--admin-border-rgb) / <alpha-value>)",
          pink: "rgb(var(--admin-pink-rgb) / <alpha-value>)",
          purple: "rgb(var(--admin-purple-rgb) / <alpha-value>)",
          blue: "rgb(var(--admin-blue-rgb) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        frame: "32px",
        card: "28px",
        chip: "16px",
        admin: "20px",
      },
      boxShadow: {
        frame: "0 30px 90px -30px rgba(11, 11, 15, 0.18)",
        soft: "0 18px 50px -24px rgba(11, 11, 15, 0.22)",
        lift: "0 26px 70px -28px rgba(91, 79, 224, 0.38)",
        admin: "0 4px 24px rgba(36, 30, 51, 0.06)",
        "admin-lg": "0 12px 40px rgba(36, 30, 51, 0.10)",
      },
      // Explicit opacity steps so every /NN modifier used in the app resolves,
      // rather than relying on bare-value fallbacks.
      opacity: {
        2: "0.02",
        3: "0.03",
        4: "0.04",
        8: "0.08",
        12: "0.12",
        15: "0.15",
        18: "0.18",
        22: "0.22",
        35: "0.35",
        45: "0.45",
        55: "0.55",
        62: "0.62",
        65: "0.65",
        85: "0.85",
        88: "0.88",
      },
      transitionDuration: {
        400: "400ms",
        600: "600ms",
      },
      transitionTimingFunction: {
        "out-soft": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "marquee-left": {
          from: { transform: "translate3d(0,0,0)" },
          to: { transform: "translate3d(-50%,0,0)" },
        },
        "marquee-right": {
          from: { transform: "translate3d(-50%,0,0)" },
          to: { transform: "translate3d(0,0,0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "btn-fly": {
          "0%": { transform: "translate(0,0) rotate(0deg)", opacity: "1" },
          "45%": { transform: "translate(38px,-38px) rotate(18deg)", opacity: "0" },
          "46%": { transform: "translate(-38px,38px) rotate(-18deg)", opacity: "0" },
          "100%": { transform: "translate(0,0) rotate(0deg)", opacity: "1" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(239, 68, 68, 0.55)" },
          "70%": { boxShadow: "0 0 0 10px rgba(239, 68, 68, 0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(239, 68, 68, 0)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "marquee-left": "marquee-left 34s linear infinite",
        "marquee-right": "marquee-right 34s linear infinite",
        float: "float 3s ease-in-out infinite",
        "pulse-ring": "pulse-ring 1.8s ease-out infinite",
        "btn-fly": "btn-fly 680ms cubic-bezier(0.4, 0, 0.2, 1)",
        "accordion-down": "accordion-down 380ms cubic-bezier(0.16, 1, 0.3, 1)",
        "accordion-up": "accordion-up 320ms cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
