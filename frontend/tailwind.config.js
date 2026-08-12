/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          50: '#FDF4F1',
          100: '#FBE7E0',
          200: '#F5CAB9',
          300: '#EEA98D',
          400: '#E38359',
          500: '#D97757',
          600: '#C15F3C',
          700: '#A14B2E',
          800: '#7D3B25',
          900: '#5C2C1C',
        },
      },
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 2px rgba(28, 25, 23, 0.04), 0 1px 8px rgba(28, 25, 23, 0.04)',
        popover: '0 8px 24px rgba(28, 25, 23, 0.12)',
      },
    },
  },
  plugins: [],
};
