import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000, // Inaondoa warning ya faili kubwa
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Inatenganisha libraries kubwa ili website iwe nyepesi
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) {
              return 'firebase';
            }
            return 'vendor';
          }
        },
      },
    },
  },
})