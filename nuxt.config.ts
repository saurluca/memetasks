// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  modules: ['@vueuse/nuxt', '@vite-pwa/nuxt', '@nuxtjs/robots', '@nuxtjs/sitemap'],
  robots: {
    UserAgent: '*',
    Disallow: '/images, /backup',
    Sitemap: 'https://memetasks.com/sitemap.xml'
  },
  sitemap: {
    hostname: 'https://memetasks.com',
    gzip: true,
    routes: [
        '/'
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
  app: {
    head: {
      title: 'Memetasks',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: 'Memetasks is a fun and simple to-do app where checking off tasks rewards you with AI-generated memes tailored ' +
              'to what you’ve completed. Fast, offline-first, and designed for a clean, fuss-free experience.',
        },
        {
          hid: 'keywords',
          name: 'keywords',
          content: 'to-do app, meme app, productivity, AI-generated memes, offline-first, simple task manager'
        },
        {
          hid: 'author',
          name: 'author',
          content: 'Memetasks Team'
        },
        {
          hid: 'og:title',
          property: 'og:title',
          content: 'Memetasks - Meme-based To-Do App'
        },
        {
          hid: 'og:description',
          property: 'og:description',
          content: 'Complete tasks and get rewarded with fun AI-generated memes! Memetasks is fast, offline-first, and easy to use.'
        },
        {
          hid: 'og:url',
          property: 'og:url',
          content: 'https://memetasks.com'
        },
        {
          hid: 'twitter:card',
          name: 'twitter:card',
          content: 'summary_large_image'
        },
        {
          hid: 'twitter:title',
          name: 'twitter:title',
          content: 'Memetasks- Your meme-based To-Do App'
        },
        {
          hid: 'twitter:description',
          name: 'twitter:description',
          content: 'Get rewarded with fun memes when you complete tasks! Fast, offline, and simple.'
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