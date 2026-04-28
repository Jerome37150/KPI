import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// IMPORTANT : le base URL doit correspondre au nom EXACT de ton repo GitHub
// Le dashboard sera accessible sur : https://ton-username.github.io/KPI/
export default defineConfig({
  plugins: [react()],
  base: '/KPI/',
  build: {
    outDir: 'dist',
  },
});
