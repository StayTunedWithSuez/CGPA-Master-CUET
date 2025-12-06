/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./insert.html', './content.js'],
  important: '#myExtensionRoot', // scope all rules inside this container
  theme: {
    extend: {},
  },
  plugins: [],
  prefix: 'tw-', // optional, avoid class conflicts
};
