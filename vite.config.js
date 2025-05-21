import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Try to locate the correct entry point
export default defineConfig({
  plugins: [react()],
  
  // This should point to where your index.html is located
  root: '.',
  
  build: {
    outDir: 'dist/client',
    emptyOutDir: true
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src')
    }
  }
});
