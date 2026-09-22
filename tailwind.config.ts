import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: 'var(--ink)',
        inksoft: 'var(--ink-soft)',
        paper: 'var(--paper)',
        surface: 'var(--surface)',
        surface2: 'var(--surface-2)',
        brass: 'var(--brass)',
        brassink: 'var(--brass-ink)',
        teal: 'var(--teal)',
        tealink: 'var(--teal-ink)',
        rust: 'var(--rust)',
        line: 'var(--line)'
      },
      fontFamily: {
        head: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body: ['IBM Plex Sans', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        DEFAULT: '10px'
      }
    }
  },
  plugins: []
};

export default config;
