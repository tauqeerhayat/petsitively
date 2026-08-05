export default defineSitemapEventHandler(async () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase || 'http://localhost:5000'
  const urls = []

  try {
    const productsRes = await $fetch(`${apiBase}/api/products`)
    const products = productsRes?.data || []
    for (const product of products) {
      if (!product?._id) continue
      urls.push({
        loc: `/products/${product._id}`,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: product.updatedAt || product.createdAt,
      })
    }
  } catch {
    // API may be offline during build — static routes still ship
  }

  try {
    const categoriesRes = await $fetch(`${apiBase}/api/categories`)
    const categories = categoriesRes?.data || []
    for (const category of categories) {
      if (!category?.slug) continue
      urls.push({
        loc: `/categories/${category.slug}`,
        changefreq: 'weekly',
        priority: 0.7,
        lastmod: category.updatedAt || category.createdAt,
      })
    }
  } catch {
    // ignore
  }

  return urls
})
