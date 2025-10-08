/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'exact': '#ef4444',      // red-500
        'simhash': '#f97316',    // orange-500
        'embedding': '#eab308',  // yellow-500
      }
    },
  },
  plugins: [],
}

