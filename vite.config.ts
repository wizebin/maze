import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: ['nexusoft.ngrok.io']
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
  }
})
