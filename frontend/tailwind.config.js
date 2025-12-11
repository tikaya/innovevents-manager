/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Charte graphique Innov'Events
        'bleu-royal': '#1E3A8A',
        'bleu-ciel': '#DBEAFE',
        'or': '#D4A845',
        'blanc-casse': '#F8FAFC',
        'gris-ardoise': '#1E293B',
      },
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
        'opensans': ['Open Sans', 'sans-serif'],
      },
      borderRadius: {
        'btn': '8px',
        'card': '12px',
        'modal': '16px',
      },
      boxShadow: {
        'card': '0 4px 12px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}
