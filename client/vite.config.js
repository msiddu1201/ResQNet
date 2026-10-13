import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function copyToRootDistPlugin() {
  return {
    name: 'copy-to-root-dist',
    closeBundle() {
      try {
        const src = path.resolve(__dirname, 'dist');
        const dest = path.resolve(__dirname, '../dist');
        if (fs.existsSync(src)) {
          if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
          }
          fs.cpSync(src, dest, { recursive: true });
          console.log('[Vite Plugin] Successfully mirrored build to root /dist directory');
        }
      } catch (err) {
        console.warn('[Vite Plugin Warning]: Could not copy to root dist:', err.message);
      }
    }
  };
}

export default defineConfig({
  plugins: [react(), copyToRootDistPlugin()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true
      }
    }
  }
});
