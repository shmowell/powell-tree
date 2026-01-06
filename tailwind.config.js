/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'display': ['"Crimson Pro"', 'Georgia', 'serif'],
        'sans': ['Outfit', 'system-ui', 'sans-serif'],
      },
      scale: {
        '102': '1.02',
      }
    },
  },
  plugins: [],
}
