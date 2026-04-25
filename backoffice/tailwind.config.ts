import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette sampled from the Pasion Balcanica logo
        brand: {
          purple: "#512e88", // primary — royal purple from the wordmark
          navy: "#2f326c", // gradient start
          plum: "#5e2b53",
          wine: "#822640",
          crimson: "#9c2332",
          red: "#b22027", // accent — Balkan red from gradient end
          cream: "#faf7f2", // warm off-white
          ink: "#1d1b22", // near-black on purple undertone
        },
        // Apple-style neutrals for corporate/minimalistic surfaces
        surface: {
          DEFAULT: "#ffffff",
          muted: "#f7f7f8", // app background
          subtle: "#f2f2f3",
        },
        line: {
          DEFAULT: "rgba(17, 17, 19, 0.08)",
          strong: "rgba(17, 17, 19, 0.14)",
        },
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, #2f326c 0%, #5e2b53 30%, #822640 55%, #9c2332 80%, #b22027 100%)",
        "brand-gradient-soft":
          "linear-gradient(135deg, rgba(47,50,108,0.06) 0%, rgba(178,32,39,0.06) 100%)",
        "hero-aurora":
          "radial-gradient(1200px 600px at 50% -20%, rgba(81,46,136,0.18), transparent 60%), radial-gradient(900px 500px at 110% 10%, rgba(178,32,39,0.14), transparent 55%), radial-gradient(700px 500px at -10% 110%, rgba(47,50,108,0.14), transparent 55%)",
      },
      fontFamily: {
        // Apple-first system font stack, Inter as cross-platform fallback
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Segoe UI"',
          "Inter",
          "Roboto",
          "system-ui",
          "sans-serif",
        ],
      },
      fontSize: {
        // Slightly tightened scale for a calmer hierarchy
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      letterSpacing: {
        tightish: "-0.01em",
      },
      borderRadius: {
        xl2: "1.1rem",
        "2xl+": "1.35rem",
      },
      boxShadow: {
        // Subtle, Apple-style layered shadows
        soft: "0 1px 2px rgba(17,17,19,0.04), 0 1px 1px rgba(17,17,19,0.03)",
        card: "0 1px 2px rgba(17,17,19,0.04), 0 6px 18px -10px rgba(17,17,19,0.14)",
        pop: "0 4px 14px -4px rgba(17,17,19,0.14), 0 10px 30px -10px rgba(17,17,19,0.22)",
        ring: "0 0 0 4px rgba(81,46,136,0.12)",
      },
      transitionTimingFunction: {
        "apple-out": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
