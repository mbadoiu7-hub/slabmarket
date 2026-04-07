import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#08080a',
        raised: '#0e0e12',
        card: '#121218',
        'card-hover': '#17171e',
        line: '#1a1a22',
        'line-light': '#24242e',
        t1: '#eaeaf0',
        t2: '#9898a8',
        t3: '#58586a',
        orange: '#e8552e',
        green: '#2dca72',
        red: '#e84057',
        blue: '#4d8df7',
        purple: '#9874f0',
        gold: '#daa520',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
