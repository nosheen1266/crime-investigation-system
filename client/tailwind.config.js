/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#050810', 900: '#0a0d1a', 800: '#0f1328',
          700: '#141929', 600: '#161b35', 500: '#1e2545',
        },
        neon: { blue: '#00b4ff', cyan: '#00e5ff', purple: '#9b5fff' },
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] },
    },
  },
  plugins: [],
}