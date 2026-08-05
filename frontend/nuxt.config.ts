// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    '@nuxt/image',
  ],

  // Keep short auto-import names after domain folders (storefront/, admin/, ui/)
  components: [
    { path: '~/components/storefront', pathPrefix: false },
    { path: '~/components/admin', pathPrefix: false },
    { path: '~/components/ui', pathPrefix: false },
    '~/components',
  ],

  // Nested composables (e.g. composables/admin/) are not scanned by default
  imports: {
    dirs: ['composables', 'composables/admin', 'composables/customer'],
  },

  piniaPluginPersistedstate: {
    storage: 'localStorage',
  },

  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:5000',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    },
  },

  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    name: 'Petsitively',
    description: 'Thoughtful pet products for happier companions.',
    defaultLocale: 'en',
  },

  sitemap: {
    sources: ['/api/__sitemap__/urls'],
    exclude: [
      '/admin/**',
      '/admin',
      '/account/**',
      '/account',
      '/checkout',
      '/cart',
      '/order-confirmation',
      '/forgot-password',
      '/reset-password/**',
    ],
  },

  robots: {
    disallow: [
      '/admin',
      '/admin/**',
      '/account',
      '/account/**',
      '/checkout',
      '/cart',
      '/order-confirmation',
      '/forgot-password',
      '/reset-password',
    ],
    sitemap: '/sitemap.xml',
  },

  image: {
    domains: ['images.unsplash.com', 'localhost'],
    format: ['webp', 'avif'],
    quality: 80,
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
  },

  css: ['~/assets/scss/main.scss'],

  build: {
    transpile: ['vue-toastification', 'vue3-apexcharts'],
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // Inject tokens into Vue SFCs only — skip global partials to avoid circular @use
          additionalData: (content: string, filename: string) => {
            const normalized = filename.replace(/\\/g, '/')
            if (
              normalized.includes('/assets/scss/') ||
              normalized.includes('/node_modules/')
            ) {
              return content
            }
            return `@use "~/assets/scss/abstracts" as *;\n${content}`
          },
        },
      },
    },
  },

  app: {
    head: {
      title: 'Petsitively',
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'description', content: 'Pet products for happier companions' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Nunito:wght@400;600;700&display=swap',
        },
      ],
    },
    // Storefront only — admin pages set pageTransition: false
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: false,
  },

  experimental: {
    // Avoid Vite "#app-manifest" resolve errors in recent Nuxt 3 builds
    appManifest: false,
  },

  // pages/storefront/* keeps clean URLs (/, /about, /cart…) without /storefront prefix
  hooks: {
    'pages:extend'(pages) {
      const stripStorefrontPrefix = (list) => {
        for (const page of list) {
          if (page.path === '/storefront' || page.path.startsWith('/storefront/')) {
            page.path = page.path.replace(/^\/storefront/, '') || '/'
          }
          if (page.name?.startsWith('storefront')) {
            page.name = page.name.replace(/^storefront-?/, '') || 'index'
          }
          if (page.children?.length) {
            stripStorefrontPrefix(page.children)
          }
        }
      }
      stripStorefrontPrefix(pages)
    },
  },
})
