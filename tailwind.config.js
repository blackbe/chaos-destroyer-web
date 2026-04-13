/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        chaos: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d946ef',
          400: '#d900ff',
          500: '#d000ff',
          600: '#c000e8',
          700: '#a000d0',
          800: '#7000b0',
          900: '#400060',
        },
        vibe: {
          dark: '#0a0e27',
          darker: '#050812',
          accent: '#ff006e',
          cyan: '#00f5ff',
          lime: '#39ff14',
          gold: '#ffd700',
        },
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        bounce: 'bounce 1s infinite',
        glow: 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { textShadow: '0 0 10px #d900ff' },
          '50%': { textShadow: '0 0 20px #d900ff, 0 0 30px #a000d0' },
        },
      },
    },
  },
  plugins: [],
}
