/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        olive: {
          50:  '#ebf8f0',
          100: '#d8f3dc',
          200: '#a7d9b8',
          300: '#74c69d',
          400: '#52b788',
          500: '#40916c',
          600: '#368264',
          700: '#2d6a4f',
          800: '#23523a',
          900: '#1a3c2a',
         },
        gold: {
          700: '#8B6914',
          500: '#d4a017',
          400: '#e0b02e',
          300: '#ecc04a',
          100: '#fdf4d8',
         },
        terra: {
          500: '#c0392b',
          400: '#d54c3d',
          300: '#e06050',
        },
        cream: {
          50: '#faf7f0',
          100: '#f0ece1',
          200: '#e5ddd0',
          300: '#d4cbb8',
        },
        ink: {
          900: '#1a1a2e',
          800: '#2a2a3e',
          700: '#3a3a4e',
          600: '#5a5a72',
          500: '#4a5a4c',
          400: '#5a6a5c',
         },
      },
      fontFamily: {
        display: ['Georgia', 'Times New Roman', 'serif'],
        body: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      maxWidth: {
        'app': '1200px',
      },
    },
  },
  plugins: [],
}
