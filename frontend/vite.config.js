import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/demo-portal': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/screenshots': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      }
    }
  }
})
