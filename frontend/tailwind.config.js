/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        sonora: {
          sand: '#f4e7d6',
          cream: '#f7f1e6',
          beige: '#d9c2aa',
          dark: '#4a3020',
          terracotta: '#b75a3c',
          desert: '#d4752a',
          gold: '#cfa86f',
          cactus: '#6a8264',
          water: '#c8dce1',
          glass: 'rgba(255, 255, 255, 0.18)',
          glassBorder: 'rgba(255, 255, 255, 0.28)',
        },
      },
      boxShadow: {
        glass: '0 20px 50px rgba(34, 40, 49, 0.08)',
        soft: '0 10px 30px rgba(34, 40, 49, 0.08)',
        panel: '0 4px 24px rgba(34, 40, 49, 0.08)',
      },
      borderRadius: {
        elegant: '1.25rem',
        glass: '1.75rem',
      },
      backgroundImage: {
        'sonora-hero': 'linear-gradient(135deg, rgba(247,241,230,1) 0%, rgba(212,119,60,0.20) 48%, rgba(74,48,32,0.08) 100%)',
        'sonora-panel': 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(236,224,209,0.85) 100%)',
        'sonora-soft': 'linear-gradient(180deg, rgba(244,231,214,0.95) 0%, rgba(220,207,186,0.62) 100%)',
      },
      blur: {
        soft: '12px',
        glass: '18px',
      },
      borderWidth: {
        1.5: '1.5px',
      },
    },
  },
  plugins: [],
};
