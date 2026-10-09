import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        // the 3D world and the playground load as their own chunks
        manualChunks(id) {
          if (id.includes('/components/world/') && !id.includes('NoorIllustration')) return 'world-3d';
          if (id.includes('/components/playground/')) return 'playground';
          if (id.includes('node_modules')) return 'vendor';
        },
      },
    },
  },
});
