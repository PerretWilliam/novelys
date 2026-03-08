/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./App.tsx", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        canvas: "#eef8ff",
        "canvas-dark": "#020617",
        surface: "#ffffff",
        "surface-dark": "#0f172a",
        "surface-2": "#f1f5f9",
        "surface-2-dark": "#1e293b",
        "surface-3": "#e2e8f0",
        "surface-3-dark": "#334155",
        overlay: "rgba(15, 23, 42, 0.55)",
        border: "#cbd5e1",
        "border-dark": "#334155",
        "border-strong-dark": "#475569",
        text: "#0f172a",
        "text-dark": "#e2e8f0",
        "text-soft": "#334155",
        "text-soft-dark": "#cbd5e1",
        muted: "#64748b",
        "muted-dark": "#94a3b8",
        primary: "#0a3359",
        "primary-soft": "#d8edff",
        "primary-text": "#0f4c81",
        danger: "#b91c1c",
        "danger-soft": "#fda4af",
        "danger-text": "#dc2626",
        success: "#047857",
        "success-soft": "#a7f3d0",
        warning: "#b45309",
        "warning-soft": "#fde68a",
        "warning-text": "#f59e0b",
        "neutral-inverse": "#ffffff",
      },
      boxShadow: {
        // iOS can flicker when using rounded cards + shadows in long lists.
        // Keep the class for consistency, but disable real shadow rendering.
        soft: "none",
      },
    },
  },
  plugins: [],
};
