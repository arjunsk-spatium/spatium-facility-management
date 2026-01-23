// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  ssr: false,
  srcDir: 'app',
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  telemetry: { enabled: false },
  modules: ['@pinia/nuxt', '@nuxt/test-utils/module'],
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
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Fira+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap'
        }
      ]
    }
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  }
})
