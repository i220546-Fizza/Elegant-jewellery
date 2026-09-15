/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#FBF6EE',
        cream: '#FAF3E7',
        beige: '#F0E4CF',
        champagne: '#C9A86A',
        'champagne-dark': '#8A6B3D',
        gold: {
          light: '#E3C68E',
          DEFAULT: '#C9A86A',
          dark: '#8A6B3D',
        },
        brown: {
          light: '#9C7A5B',
          DEFAULT: '#5C4632',
          dark: '#3B2C1F',
        },
        blush: '#F7E3D2',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Cormorant Garamond"', '"Inter"', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(92, 70, 50, 0.18)',
        card: '0 4px 24px -6px rgba(92, 70, 50, 0.12)',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        fadeInUp: 'fadeInUp 0.7s ease-out both',
        fadeIn: 'fadeIn 0.5s ease-out both',
        shimmer: 'shimmer 1.8s linear infinite',
      },
      letterSpacing: {
        widest2: '0.25em',
      },
    },
  },
  plugins: [],
};
