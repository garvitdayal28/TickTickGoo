import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    // This is the proxy configuration for development
    proxy: {
      // Requests to any path starting with /api will be forwarded
      '/api': {
        target: 'http://127.0.0.1:5000', // Your Flask server address
        changeOrigin: true, // Needed for virtual hosted sites
        secure: true,      // If your backend is HTTPS
      }
    }
  },
  define: {
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'http://127.0.0.1:5000')
  }
})
