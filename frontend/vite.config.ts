import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Development proxy: enables seamless API calls to localhost:5000 during dev.
    // In production, this block is ignored and relative /api calls must be handled by the reverse proxy (e.g. Nginx).
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})