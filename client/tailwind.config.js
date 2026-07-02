/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Rentix brand palette (marketplace tech premium, dark theme)
        ink: {
          950: '#07070c',
          900: '#0b0b12',
          850: '#0f0f18',
          800: '#14141f',
          700: '#1c1c2b',
          600: '#26263a',
          500: '#33334d',
        },
        brand: {
          DEFAULT: '#2f6bff',
          50: '#eaf1ff',
          400: '#5b8bff',
          500: '#2f6bff',
          600: '#1d54e8',
          700: '#1642c4',
        },
        violet: {
          DEFAULT: '#7c4dff',
          500: '#7c4dff',
          600: '#6a35f0',
        },
        neon: {
          cyan: '#22d3ee',
          green: '#4ade80',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px -8px rgba(47,107,255,0.45)',
        'glow-violet': '0 0 40px -6px rgba(124,77,255,0.5)',
        card: '0 8px 30px -12px rgba(0,0,0,0.7)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #2f6bff 0%, #7c4dff 100%)',
        'brand-text': 'linear-gradient(120deg, #5b8bff 0%, #7c4dff 60%, #4ade80 120%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
