/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'herb-deep': '#0F3D2E',
        'herb-leaf': '#2E7D32',
        'herb-turmeric': '#D89B1D',
        'herb-cream': '#F8F5EC',
        'herb-charcoal': '#1F2933',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
