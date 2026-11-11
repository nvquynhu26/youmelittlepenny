/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        darkBg: '#090d16',
        panelBg: '#111827',
        subtleBg: '#1f293d',
      },
    },
  },
  plugins: [],
};
