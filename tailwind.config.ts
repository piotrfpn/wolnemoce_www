import type { Config } from 'tailwindcss';

/**
 * Tailwind configuration for the WolneMoce.pl frontend.
 *
 * We leverage CSS variables defined in `globals.css` so that colors
 * remain consistent throughout the app. Extending Tailwind's theme
 * via `extend` allows us to reference these variables in our
 * components using classes like `bg-primary` or `text-accent`.
 */
const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        dark: 'var(--color-dark)',
        light: 'var(--color-light)',
        muted: 'var(--color-muted)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
};

export default config;