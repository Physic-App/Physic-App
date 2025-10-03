/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'nunito': ['Nunito', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      typography: {
        DEFAULT: {
          css: {
            fontFamily: 'Inter, sans-serif',
            maxWidth: 'none',
            color: 'inherit',
            h1: {
              fontFamily: 'Inter, sans-serif',
            },
            h2: {
              fontFamily: 'Inter, sans-serif',
            },
            h3: {
              fontFamily: 'Inter, sans-serif',
            },
            h4: {
              fontFamily: 'Inter, sans-serif',
            },
          },
        },
      },
    },
  },
  plugins: [],
};
