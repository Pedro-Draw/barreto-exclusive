// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'  // ← agora vai resolver depois de instalar

export default defineConfig({
  plugins: [react()],
  base: '/barreto-exclusive/',           // ← importante pro GitHub Pages
  server: {
    port: 5173,
    open: true
  }
})