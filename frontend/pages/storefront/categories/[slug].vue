<template>
  <div class="container category-page">
    <NuxtLink to="/" class="back-link">← Back to products</NuxtLink>

    <section class="page-hero">
      <p class="content-page__eyebrow">Category</p>
      <h1>{{ category?.name || 'Category' }}</h1>
      <p v-if="category">
        Shop {{ category.name.toLowerCase() }} essentials for happier pets.
      </p>
    </section>

    <ProductGridSkeleton v-if="pending" />
    <div v-else-if="!category" class="state-box">
      Category not found.
    </div>
    <div v-else-if="!products.length" class="state-box">
      No products in this category yet.
    </div>
    <section v-else class="product-grid" aria-label="Category products">
      <ProductCard
        v-for="product in products"
        :key="product._id"
        :product="product"
      />
    </section>
  </div>
</template>

<script setup>
import { DEFAULT_OG_IMAGE } from '~/utils/seo'

definePageMeta({
  layout: 'default',
})

const route = useRoute()
const config = useRuntimeConfig()
const slug = computed(() => String(route.params.slug || ''))

const { data: categoriesData } = await useFetch(`${config.public.apiBase}/api/categories`, {
  key: 'categories-list',
})

const category = computed(() => {
  const list = categoriesData.value?.data || []
  return list.find((item) => item.slug === slug.value) || null
})

const { data: productsData, pending } = await useAsyncData(
  () => `products-category-${slug.value}`,
  async () => {
    if (!category.value?._id) {
      return { success: true, data: [] }
    }
    return await $fetch(`${config.public.apiBase}/api/products`, {
      query: {
        category: category.value._id,
        sort: 'newest',
      },
    })
  },
  {
    watch: [() => category.value?._id, slug],
  }
)

const products = computed(() => productsData.value?.data ?? [])

const seoImage = computed(() => products.value[0]?.images?.[0] || DEFAULT_OG_IMAGE)

usePageSeo({
  title: () =>
    category.value
      ? `${category.value.name} — Petsitively`
      : 'Category — Petsitively',
  description: () =>
    category.value
      ? `Browse ${category.value.name} products at Petsitively — thoughtful gear and everyday essentials for happier pets.`
      : 'Browse pet product categories at Petsitively.',
  ogImage: seoImage,
  path: () => `/categories/${slug.value}`,
})
</script>
