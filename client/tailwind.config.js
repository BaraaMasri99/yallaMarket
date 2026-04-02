/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#f59e0b',
        action: '#16a34a',
        'action-dark': '#15803d',
      },
      boxShadow: {
        card: '0 14px 30px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};
