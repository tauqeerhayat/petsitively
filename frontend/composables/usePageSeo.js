import { DEFAULT_OG_IMAGE } from '~/utils/seo'

/**
 * Shared SEO meta for storefront pages.
 * Pass reactive getters (computed/refs) or plain strings.
 */
export function usePageSeo(options) {
  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl || 'http://localhost:3000'

  const resolve = (value) => {
    if (typeof value === 'function') return value()
    return unref(value)
  }

  useSeoMeta({
    title: () => resolve(options.title),
    description: () => resolve(options.description),
    ogTitle: () => resolve(options.ogTitle) || resolve(options.title),
    ogDescription: () => resolve(options.ogDescription) || resolve(options.description),
    ogImage: () => resolve(options.ogImage) || resolve(options.image) || DEFAULT_OG_IMAGE,
    ogType: () => resolve(options.ogType) || 'website',
    ogUrl: () => {
      const path = resolve(options.path)
      if (!path) return undefined
      return path.startsWith('http') ? path : `${siteUrl}${path}`
    },
    twitterCard: () => resolve(options.twitterCard) || 'summary_large_image',
    twitterTitle: () => resolve(options.ogTitle) || resolve(options.title),
    twitterDescription: () => resolve(options.ogDescription) || resolve(options.description),
    twitterImage: () => resolve(options.ogImage) || resolve(options.image) || DEFAULT_OG_IMAGE,
    robots: () => resolve(options.robots),
  })
}
