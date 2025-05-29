/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // 確保涵蓋所有 src 下的相關檔案
  ],
  theme: {
    extend: {
      colors: {
        primary: '#D4AF37',        // Gold
        secondary: '#E0E0E0',      // Light gray for text on dark backgrounds
        tertiary: '#B8860B',       // DarkGoldenRod - a darker gold/bronze
        background: '#1a1a1a',     // Very dark gray, almost black
        card: '#2c2c2c',           // Dark gray for cards
        'card-slot': '#3a3a3a',    // Slightly lighter gray for slots
        'text-main': '#cccccc',      // Light gray for general text on dark backgrounds
        'text-inverted': '#121212', // Dark text for on gold/light backgrounds
        'border-main': '#444444',    // Mid-gray for borders
        error: '#e74c3c',
        success: '#2ecc71',
      },
      fontFamily: {
        sans: ['Roboto', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Oxygen', 'Ubuntu', 'Cantarell', 'Open Sans', 'Helvetica Neue', 'sans-serif'],
        serif: ['Playfair Display', 'Montserrat', 'serif'],
      },
      spacing: {
        'header-height': '70px',
      },
      borderRadius: {
        'DEFAULT': '6px', // Default border radius from your variables
      },
      boxShadow: {
        'DEFAULT': '0 5px 15px rgba(0, 0, 0, 0.2)', // Default shadow
        'hover': '0 8px 20px rgba(0, 0, 0, 0.3)',   // Hover shadow
        'input-focus': '0 0 0 3px rgba(212, 175, 55, 0.25)', // Gold focus ring
      }
    },
  },
  plugins: [],
} 