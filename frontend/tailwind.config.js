// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'custom-purple': '#8B5CF6',
        'custom-pink': '#EC4899',
        'custom-blue': '#3B82F6',
        'custom-green': '#10B981',
        'custom-orange': '#F59E0B',
        'neon-cyan': '#00FFFF',
        'dark-purple': '#4C1D95',
        'gradient-start': '#667eea',
        'gradient-end': '#764ba2',
      },
      backgroundImage: {
        'gradient-custom': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'gradient-ocean': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      },
      boxShadow: {
        'custom-glow': '0 0 20px rgba(139, 92, 246, 0.5)',
        'neon': '0 0 10px #00FFFF, 0 0 20px #00FFFF, 0 0 30px #00FFFF',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
}
