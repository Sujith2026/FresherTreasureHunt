// tailwind.config.js

// 1. Import the plugin
import typographyPlugin from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  // 2. Add your content paths
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}", // Make sure to include .js and .jsx
  ],

  // 3. The theme object (can be empty)
  theme: {
    extend: {
      // You can add extensions here, but...
    },
  },
  

  // 4. Add the imported plugin to the plugins array
  plugins: [
    typographyPlugin,
  ],
}