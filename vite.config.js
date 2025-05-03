import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://2nbcjqrb-8000.inc1.devtunnels.ms/',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
