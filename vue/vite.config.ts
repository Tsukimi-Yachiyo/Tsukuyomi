import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://localhost:8080'
  const wsProxyTarget = env.VITE_WS_PROXY_TARGET || 'ws://localhost:8080'

  return {
    plugins: [
      vue(),
      vueDevTools(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@live2d-framework': fileURLToPath(new URL('./public/live2d-framework', import.meta.url)),
        '@live2d': fileURLToPath(new URL('./src/live2d', import.meta.url)),
      },
    },
    server: {
      allowedHosts: [
        '0.0.0.0',
        'yachiyocat.top',
        'localhost',
        '127.0.0.1',
      ],
      host: '0.0.0.0',
      proxy: {
        '/api/extract': {
          target: 'http://127.0.0.1:3200',
          changeOrigin: true,
        },
        '/static': {
          target: 'http://127.0.0.1:3200',
          changeOrigin: true,
        },
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          rewrite: (path) => path,
        },
        '/file': {
          target: proxyTarget,
          changeOrigin: true,
        },
        '/ws': {
          target: wsProxyTarget,
          ws: true,
          changeOrigin: true,
        },
      },
    },
  }
})
