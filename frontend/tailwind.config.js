/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Poppins"', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        accent: {
          500: '#06b6d4',
          600: '#0891b2',
        },
      },
      boxShadow: {
        card: '0 18px 45px -25px rgba(99, 102, 241, 0.55)',
        glass: '0 24px 60px -35px rgba(15, 23, 42, 0.65)',
      },
      backgroundImage: {
        'hero-glow': 'radial-gradient(circle at top left, rgba(99,102,241,0.18), transparent 55%), radial-gradient(circle at top right, rgba(6,182,212,0.18), transparent 45%)',
      },
      animation: {
        pulseSlow: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}

