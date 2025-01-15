// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',
    modules: ['@vueuse/nuxt', '@vite-pwa/nuxt', '@nuxtjs/sitemap', '@nuxthub/core', '@nuxtjs/supabase'],
    ssr: false,
    plugins: ['~/plugins/db.ts'],

    // plugins: ['~/plugins/db.ts', '~/plugins/posthog.client.js'],
    supabase: {
        redirect: false,
        exclude: ["/login", "/sign_up"],
    },
    runtimeConfig: {
        public: {
            posthogPublicKey: 'phc_11uwYEIIVE4L5AI37NS8U7MwLLRoeJnFKWYwLwIf4zX',
            posthogHost: 'https://eu.i.posthog.com'
        },
    },
    sitemap: {
        hostname: 'https://memetasks.com',
        gzip: true,
        routes: [
            '/',
        ],
    },
    devtools: {enabled: true},
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
            cacheId: 'memetasks',
            runtimeCaching: [
                {
                    urlPattern: '/',
                    handler: 'NetworkFirst',
                    options: {
                        cacheName: 'html-cache',
                    },
                },
            ],
        },
    },
    nitro: {
        preset: 'cloudflare-pages',
        compatibilityDate: '2024-04-03',
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
})