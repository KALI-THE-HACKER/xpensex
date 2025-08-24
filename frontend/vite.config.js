import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true,
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // server: {
  //   host: true,
  //   port: 5173,
  //   strictPort: true,
  //   origin: 'https://michel-noticed-medieval-robot.trycloudflare.com',
  //   hmr: {
  //     protocol: 'wss',
  //     host: 'michel-noticed-medieval-robot.trycloudflare.com',
  //     clientPort: 443,
  //   },
  // },
})
