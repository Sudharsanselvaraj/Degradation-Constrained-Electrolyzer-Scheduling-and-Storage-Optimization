/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          900: '#064e3b',
        },
        // Reference design tokens
        ref: {
          bg: '#F8F8F3',
          surface: '#EDEDE2',
          surfaceSubtle: '#F3F4ED',
          dark: '#09342B',
          darkSecondary: '#072B23',
          darkElevated: '#0D4238',
          lime: '#E5F937',
          limeHover: '#D8EC28',
          text: '#3B3B33',
          textMuted: 'rgba(59, 59, 51, 0.70)',
          textSubtle: 'rgba(59, 59, 51, 0.40)',
          borderLight: 'rgba(59, 59, 51, 0.12)',
          borderDark: 'rgba(248, 248, 243, 0.20)',
          borderLime: 'rgba(229, 249, 55, 0.35)',
        }
      },
      fontFamily: {
        sans: ['"Funnel Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Geist Mono"', '"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        marquee: 'marquee 35s linear infinite',
        'fade-in': 'fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }
    },
  },
  plugins: [],
}
