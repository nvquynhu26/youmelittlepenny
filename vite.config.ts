import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configure base path for GitHub Pages deployment
export default defineConfig({
  plugins: [react()],
  base: './',
});
