/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // <--- THIS IS THE MAGIC LINE
  theme: {
    extend: {
      colors: {
        tucasa: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb', // Brand Blue
          900: '#1e3a8a', // Deep Navy
          950: '#172554', // Dark Mode Background
        }
      }
    },
  },
  plugins: [],
}