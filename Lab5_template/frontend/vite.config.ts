import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // P6 - El router usa basename="/threads", por lo que en produccion la
  // app se sirve desde esa ruta y los assets deben apuntar ahi.
  base: '/threads/',

  server: {
    // P2/P3/P5 - En desarrollo el frontend corre en :5173 y el backend
    // en :3001. Este proxy redirige las llamadas /api al backend para
    // poder usar rutas relativas y evitar problemas de CORS.
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
