import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Changed to use port 5173
    cors: true,
    hmr: {
      port: 5173, // Ensure HMR uses the same port
      overlay: true
    },
    strictPort: true // Don't try other ports if 5173 is in use
  },
  define: {
    'process.env': {}
  }
});
