/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './*.{html,js}', // Scans root-level HTML and JS files
    './src/**/*.{html,js}', // Scans all HTML and JS files in the src folder and subfolders
    './index.html', // Explicitly includes index.html
  ],
  theme: {
    extend: {
      // Add customizations here, e.g., colors, fonts, spacing, etc.
    },
  },
  plugins: [
    // Add Tailwind plugins here, e.g., typography, forms, etc.
  ],
};