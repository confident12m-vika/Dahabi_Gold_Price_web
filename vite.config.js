import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true, // يفشل بوضوح لو المنفذ مشغول، بدل ما يغيّره بصمت
  },
});
