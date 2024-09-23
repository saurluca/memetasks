// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  modules: ['@vueuse/nuxt', '@vite-pwa/nuxt', '@nuxtjs/sitemap', '@nuxtjs/ionic', '@nuxthub/core'],
  ssr: false,
  target: 'static',
  hub: {
    database: true,
    kv: true,
    // cache: true,
  },
  sitemap: {
    hostname: 'https://memetasks.com',
    gzip: true,
    routes: [
      '/',
    ],
  },
  devtools: { enabled: true },
  ssr: false,
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  pwa: {
    manifest: {
      name: 'Memetasks',
      short_name: 'Memetasks',
      start_url: '/',
      display: 'standalone',
    },
    workbox: {
      precaching: {
        // Add the root URL to be precached
        staticFileGlobs: [
          '/*',
        ],
      },
      runtimeCaching: [
        {
          urlPattern: '/*',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'pages-cache',
          },
        },
      ],
    },
  },
  app: {
    head: {
      title: 'Memetasks',
      meta: [
        {
          name: 'description',
          content: 'Memetasks is a fun and simple to-do app where checking off tasks rewards you with AI-generated memes tailored ' +
              'to what you’ve completed.',
        },
      ]
    }
  },
  pwa: {
    manifest: {
      name: 'Memetasks',
      short_name: 'Memetasks',
      start_url: '/',
      display: 'standalone',
    }
  }
})