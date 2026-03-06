/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          'card-bg': 'var(--theme-card-bg)',
          'card-ring': 'var(--theme-card-ring)',
          'accent': 'var(--theme-accent)',
          'accent-hover': 'var(--theme-accent-hover)',
          'accent-subtle': 'var(--theme-accent-subtle)',
          'accent-text': 'var(--theme-accent-text)',
          'text-primary': 'var(--theme-text-primary)',
          'text-secondary': 'var(--theme-text-secondary)',
          'text-subtle': 'var(--theme-text-subtle)',
        }
      }
    },
  },
  plugins: [],
}
