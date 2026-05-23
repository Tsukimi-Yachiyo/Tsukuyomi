import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import postCssPxToRem from 'postcss-pxtorem'

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
    css: {
      postcss: {
        plugins: [
          postCssPxToRem({
            rootValue: 16, // 视你的设计稿而定，160px -> 16
            propList: ['*'],
          }),
        ],
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
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
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          rewrite: (path) => path,
        },
        '/file': {
          target: proxyTarget,
          changeOrigin: true,
        },
        '/actuator': {
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
