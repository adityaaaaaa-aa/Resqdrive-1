/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#060810',
        surface: '#0d1422',
        surface2: '#111928',
        border: 'rgba(0,229,255,0.15)',
      },
      fontFamily: {
        mono: ['Share Tech Mono', 'monospace'],
        display: ['Orbitron', 'sans-serif'],
        ui: ['Rajdhani', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
