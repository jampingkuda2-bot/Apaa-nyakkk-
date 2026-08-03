import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        dawn: "#FDF6EC",
        skyhigh: "#A7E0FB",
        skymid: "#5FB2E8",
        skydeep: "#2E74B5",
        skynight: "#123A5E",
        gold: "#F6C453",
        blush: "#FFD6E0",
        cloud: "#FFFFFF",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        script: ["var(--font-script)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      keyframes: {
        drift: {
          "0%": { transform: "translateX(-10%)" },
          "100%": { transform: "translateX(110%)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.2", transform: "scale(0.8)" },
          "50%": { opacity: "1", transform: "scale(1.1)" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        sparkle: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        drift: "drift linear infinite",
        twinkle: "twinkle 2.4s ease-in-out infinite",
        floaty: "floaty 5s ease-in-out infinite",
        sparkle: "sparkle 8s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
