// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  modules: ['@vueuse/nuxt', '@vite-pwa/nuxt', '@nuxtjs/robots', '@nuxtjs/sitemap'],
  robots: {
    UserAgent: '*',
    Disallow: '/images, /backup',
    Sitemap: 'https://dodoit.net/sitemap.xml'
  },
  sitemap: {
    hostname: 'https://dodoit.net',
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
      title: 'Dodo it!',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: 'Dodoit is a fun and simple to-do app where checking off tasks rewards you with AI-generated memes tailored ' +
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
          content: 'Dodoit Team'
        },
        {
          hid: 'og:title',
          property: 'og:title',
          content: 'Dodo it! - Meme-based To-Do App'
        },
        {
          hid: 'og:description',
          property: 'og:description',
          content: 'Complete tasks and get rewarded with fun AI-generated memes! Dodoit is fast, offline-first, and easy to use.'
        },
        {
          hid: 'og:url',
          property: 'og:url',
          content: 'https://dodoit.net'
        },
        {
          hid: 'twitter:card',
          name: 'twitter:card',
          content: 'summary_large_image'
        },
        {
          hid: 'twitter:title',
          name: 'twitter:title',
          content: 'Dodo it! - Meme-based To-Do App'
        },
        {
          hid: 'twitter:description',
          name: 'twitter:description',
          content: 'Get rewarded with fun memes when you complete tasks! Fast, offline, and simple.'
        },
      ]

    }
  },
})