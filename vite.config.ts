import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false, // питч-билд: меньше вес, исходники не выкладываем
  },
  server: {
    port: 3000,
    open: false,
  },
});
