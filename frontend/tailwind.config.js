/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds — layered depth
        'bg-base': '#080B0F',
        'bg-surface': '#0E1117',
        'bg-elevated': '#161B24',
        'bg-overlay': '#1C2333',
        'bg-glass': 'rgba(255, 255, 255, 0.04)',
        
        // Brand Accent — electric violet-blue
        'accent-primary': '#6C63FF',
        'accent-secondary': '#00D4FF',
        'accent-warm': '#FF6B35',
        
        // Text
        'text-primary': '#F0F2F5',
        'text-secondary': '#8B95A8',
        'text-muted': '#4A5568',
        'text-inverse': '#080B0F',

        // Borders
        'border-subtle': 'rgba(255, 255, 255, 0.06)',
        'border-default': 'rgba(255, 255, 255, 0.10)',
        'border-strong': 'rgba(255, 255, 255, 0.18)',
        'border-accent': 'rgba(108, 99, 255, 0.4)',
        
        // Status
        'status-ready': '#22C55E',
        'status-indexing': '#F59E0B',
        'status-error': '#EF4444',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '16px',
        'xl': '24px',
        'full': '9999px',
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'modal': '0 24px 64px rgba(0,0,0,0.7)',
        'glow': '0 0 40px rgba(108,99,255,0.2)',
        'accent-glow': '0 0 32px rgba(108,99,255,0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(108,99,255,0.2)' },
          '100%': { boxShadow: '0 0 40px rgba(108,99,255,0.4)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}
