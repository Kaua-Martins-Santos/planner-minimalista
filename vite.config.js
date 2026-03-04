import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Muito importante para o Electron carregar os arquivos locais corretamente
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});