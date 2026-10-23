/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#F0F5FA',
          100: '#E1EBF5',
          200: '#C3D7EB',
          300: '#95B8DC',
          400: '#5F92CA',
          500: '#356FB4',
          600: '#235596',
          700: '#1B4275',
          800: '#17365F',
          900: '#142B45', // Primary Deep Navy
          950: '#0C1A2B',
        },
        teal: {
          50: '#F0FDFB',
          100: '#CCFBF4',
          200: '#99F6E8',
          300: '#5EEAD7',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0F9D8A', // Primary Teal
          700: '#0D7B6D',
          800: '#115E54',
          900: '#134E46',
          950: '#052E2A',
        },
        gov: {
          surface: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          darkBorder: '#CBD5E1',
          subtle: '#F1F5F9',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
        'elevated': '0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.06)',
        'modal': '0 20px 25px -5px rgba(15, 23, 42, 0.15), 0 8px 10px -6px rgba(15, 23, 42, 0.1)',
      }
    },
  },
  plugins: [],
}
