import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// Tencent Cloud: served from domain root "/"
// GitHub Pages project site: served from "/vueDemo/" (pnpm build:github -> --mode github)
export default defineConfig(({ mode }) => ({
  base:
    mode === 'github' || process.env.BUILD_TARGET === 'github'
      ? '/vueDemo/'
      : '/',

  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
}))