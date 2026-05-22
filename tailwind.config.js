module.exports = {
  mode: 'jit',
  content: ['./src/**/**/*.{js,ts,jsx,tsx,html,mdx}', './src/**/*.{js,ts,jsx,tsx,html,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            p: {
              marginTop: '0',
              marginBottom: '0',
            },
          },
        },
      },
      colors: {
        primary: '#111111',
        secondary: '#C9AE8A',
        text_w: '#ffffff',
        text: '#111111',
        ivory: '#FAF9F6',
        cream: '#F8F4EE',
        section: '#F1E9DE',
        luxury: '#C9AE8A',
        mocha: '#8B7355',
      },

      boxShadow: {},
      fontFamily: {
        sans: ['Libre Franklin', 'sans-serif'],
        serif: ['Cormorant Garamond', 'serif'],
        notosans: ['Libre Franklin', 'sans-serif'],
        castoro: ['Cormorant Garamond', 'serif'],
        libre: ['Libre Franklin', 'sans-serif'],
        cormorant: ['Cormorant Garamond', 'serif'],
      },
    },
    screens: {
      // "2xl": { max: "1680px" }, // Add breakpoint for screens larger than 1920px
      '2xl': { max: '1710px' }, // Add breakpoint for screens larger than 1920px
      '1xl': { max: '1600px' },
      xl: { max: '1553px' },
      xls: { max: '1280px' },
      lg: { max: '1024px' },
      md: { max: '769px' },
      sm: { max: '550px' },
      // "sm-min": { min: "320px" }, // Example min-width for mobile screens
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
};
