// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  ssr: false,
  srcDir: 'app',
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  telemetry: { enabled: false },
  modules: ['@pinia/nuxt', '@nuxt/test-utils/module'],
  runtimeConfig: {
    public: {
      apiBaseUrl: '',
      tenantAdminAppId: '',
      tenantClientAppId: ''
    }
  },
  imports: {
    dirs: ['../composables', '../stores'],
    presets: [
      {
        from: 'ant-design-vue',
        imports: ['message', 'notification']
      }
    ]
  },
  components: [
    { path: '../components', pathPrefix: false }
  ],
  devServer: {
    host: 'localhost',
    port: 4000
  },
  css: [
    '../assets/styles/main.css',
    'ant-design-vue/dist/reset.css'
  ],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  }
})
