/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0D1117',
          50: '#F6F8FA',
          100: '#E7ECF0',
          200: '#C9D1D9',
          300: '#8B949E',
          400: '#58606A',
          500: '#24292F',
          600: '#1B1F24',
          700: '#0D1117',
          800: '#010409',
        },
        accent: {
          DEFAULT: '#7C3AED',
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
        serif: ['Playfair'],
      },
    },
  },
  plugins: [],
}