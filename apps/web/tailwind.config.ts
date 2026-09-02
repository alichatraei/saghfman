import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '1.5rem', screens: { '2xl': '1320px' } },
    extend: {
      colors: {
        navy: { DEFAULT: '#08263A', alt: '#0B3550', soft: '#123E5C' },
        gold: { DEFAULT: '#D6AF70', dark: '#C69A55', soft: '#F3E7D2' },
        cream: { DEFAULT: '#FCFAF6', soft: '#F7F2E9' },
        ink: '#12171B',
        muted: '#667078',
        line: '#E4E7E9',
        success: '#16845B',
        danger: '#C44949',
        warning: '#B98213',
      },
      fontFamily: { sans: ['Vazirmatn', 'system-ui', 'sans-serif'] },
      borderRadius: { sm: '10px', DEFAULT: '12px', md: '16px', lg: '20px', xl: '24px' },
      boxShadow: {
        card: '0 2px 10px rgba(8, 38, 58, 0.06)',
        'card-hover': '0 12px 30px rgba(8, 38, 58, 0.12)',
        panel: '0 6px 24px rgba(8, 38, 58, 0.08)',
      },
      keyframes: {
        'fade-up': { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { '100%': { transform: 'translateX(-100%)' } },
      },
      animation: { 'fade-up': 'fade-up 0.5s ease-out both' },
    },
  },
  plugins: [],
};

export default config;
