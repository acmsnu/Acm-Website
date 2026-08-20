import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/backend/api': {
        target: 'http://localhost:3001',
        rewrite: (path) => path.replace(/^\/backend\/api/, '/api')
      },
      '/uploads': 'http://localhost:3001'
    }
  }
})
