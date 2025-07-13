import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  // Add these server and preview configurations
  server: {
    host: true,
    port: 5173,
    allowedHosts: [
      'online-book-exchange-platform-2.onrender.com'
    ]
  },
  preview: {
    port: 10000,
    host: true,
    allowedHosts: [
      'online-book-exchange-platform-2.onrender.com' // Allow Render's domain
    ]
  },

  // Optional production build settings
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true // Helps with debugging
  }
})