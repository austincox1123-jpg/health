import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0B0D12',
        surface: '#13161E',
        'surface-alt': '#1C2030',
        border: '#2A2F3E',
        accent: '#3B82F6',
        'accent-alt': '#F97316',
        'text-primary': '#F1F5F9',
        'text-secondary': '#94A3B8',
        'text-muted': '#4B5563',
        success: '#22C55E',
        warning: '#EAB308',
        danger: '#EF4444',
        phase: {
          base: '#3B82F6',
          build: '#8B5CF6',
          hypertrophy: '#8B5CF6',
          strength: '#F97316',
          peak: '#EF4444',
          power: '#EF4444',
          taper: '#EAB308',
          deload: '#22C55E',
          active_recovery: '#22C55E',
          custom: '#94A3B8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        label: '0.08em',
      },
    },
  },
  plugins: [],
} satisfies Config;
