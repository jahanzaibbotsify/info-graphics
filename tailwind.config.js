/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B82F6',
          50: '#EBF2FF',
          100: '#D6E4FF',
          200: '#ADC8FF',
          300: '#85ABFF',
          400: '#5C8EFF',
          500: '#3B82F6',
          600: '#0A5CFF',
          700: '#0042D6',
          800: '#0033A3',
          900: '#002370',
        },
        background: '#FFFFFF',
        foreground: '#0F172A',
        card: '#F8FAFC',
        'card-foreground': '#0F172A',
        muted: '#F1F5F9',
        'muted-foreground': '#64748B',
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
    },
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
  },
  plugins: [],
} 