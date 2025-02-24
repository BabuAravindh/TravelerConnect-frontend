import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6999aa",
        button: "#1b374c",
        sidebar: {
          DEFAULT: "#6999aa", // Set a direct color value
          foreground: "#ffffff", // Set a valid color if needed
          primary: "#1b374c",
          "primary-foreground": "#ffffff",
          accent: "#5a8b99",
          "accent-foreground": "#ffffff",
          border: "#5a8b99",
          ring: "#1b374c",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
