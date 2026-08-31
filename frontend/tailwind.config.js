/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        claude: {
          light: {
            bg: '#FFFFFF',
            secondary: '#F5F5F5',
            tertiary: '#ECECEC',
            text: '#1A1A1A',
            muted: '#666666',
            subtle: '#999999',
            border: '#E0E0E0',
            divider: '#F0F0F0',
            accent: '#0066CC',
            accentHover: '#0052A3',
          },
          dark: {
            bg: '#0F0F0F',
            secondary: '#1A1A1A',
            tertiary: '#242424',
            text: '#FFFFFF',
            muted: '#B0B0B0',
            subtle: '#808080',
            border: '#2D2D2D',
            divider: '#1F1F1F',
            accent: '#4D94FF',
            accentHover: '#66A3FF',
          },
          status: {
            success: '#10A950',
            error: '#DC3545',
            warning: '#FF9800',
            info: '#2196F3',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Fira Code', 'Monaco', 'Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
}