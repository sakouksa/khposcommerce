/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#e0eaff',
          200: '#c7d9ff',
          300: '#a4beff',
          400: '#7b9dff',
          500: '#4f73f8',
          600: '#3b57ef',
          700: '#2d40d8',
          800: '#2434af',
          900: '#1e2b8a',
        },
      },
      maxWidth: {
        site: '1400px',
      },
      boxShadow: {
        'soft-sm': '0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)',
        'soft':    '0 4px 16px rgba(0,0,0,.08), 0 2px 6px rgba(0,0,0,.04)',
        'soft-lg': '0 10px 40px rgba(0,0,0,.10), 0 4px 16px rgba(0,0,0,.06)',
        'glow':    '0 0 0 3px rgba(79,115,248,.25)',
        'card':    '0 1px 4px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(.34,1.56,.64,1)',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(.96)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulse: {
          '0%,100%': { opacity: '1' },
          '50%':     { opacity: '.5' },
        },
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
        bounce: {
          '0%,100%': { transform: 'translateY(-25%)', animationTimingFunction: 'cubic-bezier(.8,0,1,1)' },
          '50%':     { transform: 'translateY(0)',    animationTimingFunction: 'cubic-bezier(0,0,.2,1)' },
        },
      },
      animation: {
        'fade-in':  'fadeIn .4s ease-out',
        'slide-up': 'slideUp .4s ease-out',
        'slide-down': 'slideDown .25s ease-out',
        'scale-in': 'scaleIn .2s ease-out',
        'shimmer':  'shimmer 2s infinite linear',
      },
      aspectRatio: {
        '4/3':  '4 / 3',
        '3/4':  '3 / 4',
        '16/9': '16 / 9',
      },
      screens: {
        'xs': '480px',
      },
    },
  },
  plugins: [],
}
