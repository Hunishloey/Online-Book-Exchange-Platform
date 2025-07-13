import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    host: true,
    port: 5173,
    allowedHosts: 'all' // ✅ Allow all domains in dev
  },
  preview: {
    host: true,
    port: 10000,
    allowedHosts: 'all' // ✅ Allow all domains in preview
  },

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true
  }
})
