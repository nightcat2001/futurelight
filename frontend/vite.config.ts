import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 37173,
    strictPort: true,
    proxy: {
      '/api': 'http://127.0.0.1:37200',
      '/health': 'http://127.0.0.1:37200',
    },
  },
})
