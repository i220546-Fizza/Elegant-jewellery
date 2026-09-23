/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // NB Classic Scents palette - do not introduce other hues.
        ink: '#0D0E10',
        ivory: '#F8F7F3',
        gold: '#C9B27C',
        stone: '#8D8A83',
        taupe: '#D8D0C2',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Jost', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        luxe: '0.32em',
        wide2: '0.18em',
      },
      fontSize: {
        display: ['clamp(2.75rem, 5.8vw, 6.25rem)', { lineHeight: '0.92', letterSpacing: '-0.01em' }],
      },
      boxShadow: {
        soft: '0 30px 60px -30px rgba(13, 14, 16, 0.25)',
        card: '0 18px 40px -24px rgba(13, 14, 16, 0.22)',
      },
      transitionTimingFunction: {
        lux: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      transitionDuration: {
        700: '700ms',
        900: '900ms',
        1200: '1200ms',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2.4s linear infinite',
        marquee: 'marquee 60s linear infinite',
      },
    },
  },
  plugins: [],
};
