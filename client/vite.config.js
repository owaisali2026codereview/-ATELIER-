import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.BASE_URL,
        changeOrigin: true,
      },
      
      '/uploads': {
        target: process.env.BASE_URL,
        changeOrigin: true,
      },
    },
  },
});
