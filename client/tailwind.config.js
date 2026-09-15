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
        lux: '0 30px 60px -20px rgba(92, 70, 50, 0.35)',
        glow: '0 0 0 1px rgba(201, 168, 106, 0.35), 0 20px 45px -15px rgba(201, 168, 106, 0.45)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.5)',
      },
      backgroundImage: {
        'gold-sheen': 'linear-gradient(120deg, #F3E3C0 0%, #C9A86A 45%, #8A6B3D 55%, #F3E3C0 100%)',
        'radial-glow': 'radial-gradient(circle at center, rgba(227,198,142,0.35), transparent 70%)',
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
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(2deg)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.08)' },
        },
        drift: {
          '0%': { transform: 'translate(0,0)' },
          '33%': { transform: 'translate(6px,-10px)' },
          '66%': { transform: 'translate(-6px,4px)' },
          '100%': { transform: 'translate(0,0)' },
        },
        heartBeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '30%': { transform: 'scale(1.35)' },
          '55%': { transform: 'scale(0.92)' },
        },
      },
      animation: {
        fadeInUp: 'fadeInUp 0.7s ease-out both',
        fadeIn: 'fadeIn 0.5s ease-out both',
        shimmer: 'shimmer 1.8s linear infinite',
        float: 'float 6s ease-in-out infinite',
        floatSlow: 'floatSlow 9s ease-in-out infinite',
        glowPulse: 'glowPulse 4s ease-in-out infinite',
        drift: 'drift 12s ease-in-out infinite',
        heartBeat: 'heartBeat 0.5s ease-in-out',
      },
      letterSpacing: {
        widest2: '0.25em',
      },
      transitionTimingFunction: {
        lux: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
