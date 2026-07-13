/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e8f5e9', 100: '#c8e6c9', 200: '#a5d6a7', 300: '#81c784',
          400: '#66bb6a', 500: '#2E7D32', 600: '#2E7D32', 700: '#1B5E20',
          800: '#1B5E20', 900: '#0D3B0F',
        },
        secondary: { 500: '#00695C', 600: '#00695C', 700: '#004D40' },
      },
    },
  },
  plugins: [],
}
