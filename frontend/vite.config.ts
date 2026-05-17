import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ----------CONFIGURACAO DO VITE----------
// Proxy /api -> backend em dev para evitar problemas de CORS
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
