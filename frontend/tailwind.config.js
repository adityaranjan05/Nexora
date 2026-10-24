/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#0A0A0B',
        panel: '#0F1011',
        card: '#151618',
        'card-hover': '#1A1B1E',
        active: '#1F2023',
        border: '#232427',
        primary: '#F4F4F5',
        secondary: '#A1A1AA',
        muted: '#71717A',
        accent: {
          DEFAULT: '#00E676',
          hover: '#00c864',
          purple: '#7C3AED',
        },
        status: {
          pending: '#8A99B5',
          process: '#6C7BFF',
          disposed: '#19D3A2',
          transferred: '#B07CFF',
          escalated: '#FF4D79',
          breach: '#FF5C5C',
        },
        // Keep gov & navy for backwards compatibility while migrating to new tokens
        navy: {
          900: '#0F1011',
          950: '#0A0A0B',
        },
        teal: {
          500: '#00E676',
          600: '#00c864',
        },
        gov: {
          surface: '#0A0A0B',
          card: '#151618',
          border: '#232427',
          darkBorder: '#232427',
          subtle: '#0F1011',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        btn: '8px',
        card: '12px',
        panel: '16px',
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
        'elevated': '0 4px 12px 0 rgba(0, 0, 0, 0.5)',
        'modal': '0 24px 38px 3px rgba(0,0,0,0.7), 0 9px 46px 8px rgba(0,0,0,0.6)',
      }
    },
  },
  plugins: [],
}
