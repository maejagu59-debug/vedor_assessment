/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
    },
  },
  plugins: [],
}
