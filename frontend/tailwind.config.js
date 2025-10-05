module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false,
  theme: {
    extend: {
      colors: {
        'brand-primary': '#c1292e',
        'brand-background': '#ffffff',
        'brand-active': '#c1292e',
        'brand-header-background': '#e2e1e1',
        'primary-red': '#c1292e',
        'red-hover': '#c1292e',
        'primary-white': '#ffffff',
        'white-hover': '#f2f2f2',
      },
      fontFamily: {
        'sans': ['Roboto', 'Helvetica', 'Helvetica Neue', 'Nunito Sans', 'sans-serif'],
      },
    },
  },
  variants: {
    extend: {
      opacity: ['disabled'],
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
