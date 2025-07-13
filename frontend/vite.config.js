import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  // Add these server and preview configurations
  server: {
    host: true, // This will expose to all network interfaces
    port: 5173, // Development port
    strictPort: true // Exit if port is occupied
  },
  preview: {
    host: true, // Important for Render
    port: 10000, // Production preview port (must match Render settings)
    strictPort: true
  },
  
  // Optional production build settings
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true // Helps with debugging
  }
})