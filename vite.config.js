import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://oceanatlantic.pinesphere.co.in/',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
