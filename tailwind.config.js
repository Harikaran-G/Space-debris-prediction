/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#131315',
          900: '#1A1A1D', // Exact Color 1: #1A1A1D
          850: '#232328', // Elevated surface card
          800: '#2C2C34', // Sub-surface / header
          750: '#383842', // Hover & subtle dividers
          700: '#4E4E50', // Exact Color 2: #4E4E50
          600: '#64646A', // Interactive borders
          500: '#868690', // Muted icons
          400: '#ADADB8', // Secondary text
          300: '#CECED6',
          200: '#ECECF0',
          100: '#FEFFFF', // Pure White text
        },
        brand: {
          DEFAULT: '#C3073F', // Exact Color 5: #C3073F
          50: '#FDF2F4',
          100: '#FBE4E9',
          200: '#F7BAC7',
          300: '#F0839D',
          400: '#E6446E',
          500: '#C3073F', // Exact Color 5: #C3073F (Electric Crimson)
          600: '#950740', // Exact Color 4: #950740 (Ruby Crimson)
          700: '#6F2232', // Exact Color 3: #6F2232 (Deep Maroon Wine)
          800: '#4E4E50', // Exact Color 2: #4E4E50 (Slate Gray)
          900: '#1A1A1D', // Exact Color 1: #1A1A1D (Charcoal Black)
        },
        inpieces: {
          charcoal: '#1A1A1D',
          gunmetal: '#4E4E50',
          maroon: '#6F2232',
          ruby: '#950740',
          crimson: '#C3073F',
        },
        risk: {
          low: '#10B981',
          medium: '#F59E0B',
          high: '#950740',
          critical: '#C3073F',
        }
      },
      fontFamily: {
        mono: ['"Roboto"', 'sans-serif'],
        sans: ['"Roboto"', 'sans-serif'],
        serif: ['"Roboto"', 'sans-serif'],
      },
      borderRadius: {
        'sm': '3px',
        'DEFAULT': '4px',
        'md': '6px',
        'lg': '6px',
        'xl': '8px',
      }
    },
  },
  plugins: [],
}
