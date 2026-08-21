/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      // Wall-mounted tablet in landscape (Lenovo Tab M10 and friends).
      // Keyed on orientation, not width: a 2000x1200 M10 at 2x density
      // reports only ~1000 CSS px, which would fall short of `lg`.
      screens: {
        wall: { raw: "(min-width: 900px) and (orientation: landscape)" },
        wallwide: { raw: "(min-width: 1200px) and (orientation: landscape)" },
      },
      colors: {
        sand: {
          50: "#FBF8F3",
          100: "#F5EFE4",
          200: "#EADFC9",
        },
        clay: {
          400: "#D98C5F",
          500: "#C56B3C",
          600: "#A9552C",
        },
        sage: {
          400: "#7BA383",
          500: "#5A8465",
          600: "#456B4F",
        },
        ink: {
          700: "#3D3428",
          800: "#2C2419",
          900: "#1E1810",
        },
        date: {
          500: "#8C5A3C",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        arabic: ["var(--font-arabic)", "Georgia", "serif"],
        urdu: ["var(--font-urdu)", "var(--font-arabic)", "serif"],
      },
      boxShadow: {
        soft: "0 2px 12px rgba(60, 52, 40, 0.06)",
        card: "0 4px 20px rgba(60, 52, 40, 0.08)",
      },
    },
  },
  plugins: [],
};
