/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary colors for light and dark mode
        'primary-bg': 'var(--figma-color-bg)', // Light: rgba(255, 255, 255, 1), Dark: #2c2c2c
        'secondary-bg': 'var(--figma-color-bg-secondary)', // Light: #f5f5f5, Dark: #383838
        'active-bg': 'var(--figma-color-bg-tertiary)',

        'primary-text': 'var(--figma-color-text)', // Light: rgba(0, 0, 0, 0.9), Dark: rgba(255, 255, 255, 1)
        'secondary-text': 'var(--figma-color-text-secondary)', // Light: rgba(0, 0, 0, 0.5), Dark: rgba(255, 255, 255, 0.7)

        // Brand colors for light and dark mode
        'brand-bg': 'var(--figma-color-bg-brand)', // Light: #0d99ff, Dark: #0c8ce9
        'brand-text': 'var(--figma-color-text-brand)', // Light: #007be5, Dark: #7cc4f8
        'selected-bg': 'var(--figma-color-bg-selected)', // Light: #bde3ff, Dark:

        // Additional colors
        'f-border': 'var(--figma-color-border)', // Light: #e6e6e6,  Dark: #444444
        'danger': 'var(--figma-color-bg-danger)', // Light: #f24822, Dark: #e03e1a
        'danger-hover': 'var(--figma-color-bg-danger-hover)', // Light: #dc3412, Dark: #c4381c

        // Additional colors for scrollbar
        'scrollbar-thumb': 'var(--figma-color-border)',
        'scrollbar-track': 'var(--figma-color-bg-secondary)',
        'scrollbar-thumb-hover': 'var(--figma-color-bg-secondary)',

        'light-gray': '#B2B2B2',
        'secondary-gray': '#0000004d',
        'btn-bg-dark': '#505050',
      },
    },
  },
  plugins: [require('tailwind-scrollbar')],
  darkMode: ['class', '.figma-dark'], // Enables dark mode using .figma-dark class
};
