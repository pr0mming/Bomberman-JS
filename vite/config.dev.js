// Config taken from https://phaser.io/news/2024/01/phaser-vite-template

import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: [
      {
        find: '@src',
        replacement: path.resolve(path.join(__dirname, '..', 'src'))
      },
      {
        find: '@game',
        replacement: path.resolve(path.join(__dirname, '..', 'src/game'))
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
  },
  server: {
    port: 3006
  }
});
