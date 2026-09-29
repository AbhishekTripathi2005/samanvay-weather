import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          0: "var(--surface-0)",
          1: "var(--surface-1)",
          2: "var(--surface-2)",
          3: "var(--surface-3)",
        },
        border: "var(--border)",
        "border-subtle": "var(--border-subtle)",
        "border-strong": "var(--border-strong)",
        text: {
          1: "var(--text-1)",
          2: "var(--text-2)",
          3: "var(--text-3)",
        },
        aurora: {
          cyan: "var(--accent-cyan)",
          blue: "var(--accent-blue)",
          violet: "var(--accent-violet)",
          magenta: "var(--accent-magenta)",
        },
        alert: {
          green: "var(--alert-green)",
          yellow: "var(--alert-yellow)",
          orange: "var(--alert-orange)",
          red: "var(--alert-red)",
        },
        model: {
          ncum: "var(--model-ncum)",
          neps: "var(--model-neps)",
          imd: "var(--model-imd)",
          ecmwf: "var(--model-ecmwf)",
          graphcast: "var(--model-graphcast)",
          pangu: "var(--model-pangu)",
          fourcastnet: "var(--model-fourcastnet)",
          samanvay: "var(--model-samanvay)",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        heading: ["Space Grotesk", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        glow: "var(--glow)",
        "inner-glow": "var(--glow-inner)",
        card: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
    },
  },
  plugins: [],
};
export default config;
