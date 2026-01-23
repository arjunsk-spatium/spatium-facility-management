// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  ssr: false,
  srcDir: 'app',
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  telemetry: { enabled: false },
  modules: ['@pinia/nuxt'],
  runtimeConfig: {
    public: {
      apiBaseUrl: '',
      adminConsoleAppId: ''
    }
  },
  imports: {
    dirs: ['../composables', '../stores']
  },
  devServer: {
    host: 'localhost',
    port: 5000
  },
  css: [
    '~/assets/styles/main.css',
    'ant-design-vue/dist/reset.css'
  ],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  }
})

