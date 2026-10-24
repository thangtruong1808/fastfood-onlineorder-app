/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          primary: 'var(--bg-primary)',
          surface: 'var(--bg-surface)',
          elevated: 'var(--bg-elevated)',
          muted: 'var(--bg-muted)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        border: {
          subtle: 'var(--border-subtle)',
          strong: 'var(--border-strong)',
        },
        brand: {
          primary: 'var(--brand-primary)',
          'primary-hover': 'var(--brand-primary-hover)',
          secondary: 'var(--brand-secondary)',
          accent: 'var(--brand-accent)',
          dark: 'var(--brand-dark)',
        },
        status: {
          success: 'var(--status-success)',
          warning: 'var(--status-warning)',
          danger: 'var(--status-danger)',
          info: 'var(--status-info)',
        },
      },
      fontFamily: {
        sans: ['PlusJakartaSans_500Medium', 'System'],
        'sans-semibold': ['PlusJakartaSans_600SemiBold', 'System'],
        'sans-bold': ['PlusJakartaSans_700Bold', 'System'],
        display: ['Fraunces_700Bold', 'Georgia', 'serif'],
        'display-extrabold': ['Fraunces_800ExtraBold', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

