// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',
    modules: ['@vueuse/nuxt', '@vite-pwa/nuxt', '@nuxtjs/sitemap', '@nuxthub/core', '@nuxtjs/supabase'],
    ssr: false,
    target: 'static',
    hub: {
        database: true,
        kv: true,
    },
    supabase: {
        redirect: false,
        exclude: ["/login", "/sign_up"],
    },
    runtimeConfig: {
        public: {
            supabaseUrl: "" ,
            test: "",
            supabaseAnonKey: ""
        }
    },
    sitemap: {
        hostname: 'https://memetasks.com',
        gzip: true,
        routes: [
            '/',
        ],
    },
    devtools: {enabled: true},
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