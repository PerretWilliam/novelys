/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./App.tsx", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef8ff",
          100: "#d8edff",
          500: "#0f4c81",
          700: "#0a3359",
        },
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
