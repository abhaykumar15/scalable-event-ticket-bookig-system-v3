/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111111",
        stage: "#1f1b1b",
        spotlight: "#f6d365",
        ember: "#f97316",
        velvet: "#6b1d1d"
      },
      boxShadow: {
        glow: "0 20px 60px rgba(246, 211, 101, 0.18)"
      },
      backgroundImage: {
        "cinema-grid":
          "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)"
      }
    }
  },
  plugins: []
};
