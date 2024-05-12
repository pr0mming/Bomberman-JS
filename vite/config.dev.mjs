import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: [
      {
        find: '@src',
        replacement: path.resolve(__dirname, 'src')
      },
      {
        find: '@game',
        replacement: path.resolve(__dirname, 'src/game')
      }
    ]
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser']
        }
      }
    }
  }
});
