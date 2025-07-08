import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL,
        changeOrigin: true,
        secure: false,
      },
      '/tasks': {
        target: process.env.VITE_BACKEND_URL,
        changeOrigin: true,
        secure: false,
      },
      '/logout-api': {
        target: process.env.VITE_BACKEND_URL,
        changeOrigin: true,
        secure: false,
      },
      '/task-api': {
        target: process.env.VITE_BACKEND_URL,
        changeOrigin: true,
        secure: false,
      },
      '/logs': {
        target: process.env.VITE_BACKEND_URL,
        changeOrigin: true,
        secure: false,
      }
    }
  },
  define: {
    'process.env': process.env
  }
});
