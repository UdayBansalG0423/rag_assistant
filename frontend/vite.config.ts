import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/auth': {
        target: backendUrl,
        changeOrigin: true,
      },
      '/upload': {
        target: backendUrl,
        changeOrigin: true,
      },
      '/documents': {
        target: backendUrl,
        changeOrigin: true,
      },
      '/ask': {
        target: backendUrl,
        changeOrigin: true,
      },
      '/chat': {
        target: backendUrl,
        changeOrigin: true,
      },
    },
  },
})