import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget =
    env.VITE_DEV_API_PROXY?.trim() ||
    env.VITE_API_ORIGIN?.trim() ||
    'http://localhost:3001'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: proxyTarget.replace(/\/$/, ''),
          changeOrigin: true,
        },
      },
    },
  }
})
