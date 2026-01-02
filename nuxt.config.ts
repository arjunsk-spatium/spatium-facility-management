// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  telemetry: { enabled: false },
  devServer: {
    host: 'localhost',
    port: 4000
  },
  css: [
    './app/assets/css/main.css',
    'ant-design-vue/dist/reset.css'
  ],
  vite: {
    plugins: [
      tailwindcss(),
    ],
    // server: {
    //   hmr: {
    //     protocol: 'ws',
    //     host: 'localhost',
    //     port: 24678
    //   }
    // }
  }
})
