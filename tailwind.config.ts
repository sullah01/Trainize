import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2f0fb",
          100: "#e4e0f7",
          200: "#c3baed",
          300: "#a294e2",
          400: "#8168d6",
          500: "#6D5BD0",
          600: "#5847b0",
          700: "#443790",
          800: "#302870",
          900: "#1c1850",
        },
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
