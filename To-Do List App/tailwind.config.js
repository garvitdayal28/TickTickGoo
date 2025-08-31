/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        xs: "360px", // Extra small Android devices
        "android-sm": "480px", // Small Android devices
        "android-md": "768px", // Medium Android tablets
        "android-lg": "1024px", // Large Android tablets
      },
      spacing: {
        "safe-top": "env(safe-area-inset-top)",
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-left": "env(safe-area-inset-left)",
        "safe-right": "env(safe-area-inset-right)",
      },
      height: {
        "screen-dynamic": "100dvh", // Dynamic viewport height for Android
      },
      minHeight: {
        touch: "48px", // Android touch target minimum
      },
      minWidth: {
        touch: "48px", // Android touch target minimum
      },
      fontSize: {
        "android-base": "16px", // Prevents zoom on Android
      },
      animation: {
        "android-spin": "spin 1s linear infinite",
      },
    },
  },
  plugins: [],
};
