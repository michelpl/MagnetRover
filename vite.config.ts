import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    port: 8082,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser'],
        },
      },
    },
  },
});
