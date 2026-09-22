/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{njk,html,md,js}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Sofia Sans"', "system-ui", "sans-serif"],
        display: ['"Sofia Sans Condensed"', '"Sofia Sans"', "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          DEFAULT: "#057230",
          dark: "#045a26",
          deeper: "#033f1c",
          soft: "#E6F4EC",
          mist: "#F3F8F5",
        },
        ink: {
          DEFAULT: "#24332B",
          muted: "#5F6E66",
          faint: "#8A9690",
        },
      },
      maxWidth: {
        site: "80rem",
      },
      boxShadow: {
        card: "0 3px 15px rgba(36, 51, 43, 0.06)",
        lift: "0 18px 42px rgba(36, 51, 43, 0.12)",
      },
    },
  },
  plugins: [],
};
