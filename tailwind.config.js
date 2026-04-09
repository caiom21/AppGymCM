/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#FBFF00",
        bg: "#0A0A0A",
        surface: "#111111",
        surface2: "#1A1A1A",
        textPrimary: "#FFFFFF",
        textSecondary: "#888888",
        textFaint: "#444444",
        accentDim: "rgba(251, 255, 0, 0.10)",
        accentBorder: "rgba(251, 255, 0, 0.20)",
        accentBorderStrong: "rgba(251, 255, 0, 0.50)",
        borderColor: "rgba(255, 255, 255, 0.08)",
        success: "#22C55E",
        error: "#EF4444",
        warning: "#F59E0B",
      },
      spacing: {
        'micro': '4px',
        'tight': '8px',
        'compact': '12px',
        'default': '16px',
        'section-p': '20px',
        'card-p': '24px',
        'section-p-lg': '32px',
        'section-gap': '48px',
        'section-gap-lg': '80px',
        'hero-pt': '120px',
      },
      fontFamily: {
        mono: ["JetBrainsMono_400Regular", "monospace"],
        "mono-bold": ["JetBrainsMono_700Bold", "monospace"],
      },
    },
  },
  plugins: [],
};
