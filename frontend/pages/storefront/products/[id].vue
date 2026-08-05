<template>
  <div class="container">
    <NuxtLink to="/" class="back-link">← Back to products</NuxtLink>

    <div v-if="pending" class="state-box">
      <div class="ui-loading">
        <UiSpinner size="lg" />
        <p class="ui-loading__text">Loading product…</p>
      </div>
    </div>
    <div v-else-if="error || !product" class="state-box">
      Product not found or API is unavailable.
    </div>

    <section v-else class="detail">
      <div class="detail__media" ref="mediaEl">
        <span
          v-if="discountPercent != null"
          class="detail__sale-badge"
        >
          -{{ discountPercent }}% OFF
        </span>
        <NuxtImg
          v-if="showProductImage"
          :src="productImageSrc"
          :alt="product.name"
          width="900"
          height="900"
          fit="cover"
          loading="eager"
          format="webp"
          sizes="(max-width: 768px) 100vw, 50vw"
          @error="imageFailed = true"
        />
        <div v-else class="detail__media--placeholder">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" aria-hidden="true">
            <rect
              x="3"
              y="5"
              width="18"
              height="14"
              rx="2"
              stroke="currentColor"
              stroke-width="1.6"
            />
            <circle cx="9" cy="10" r="1.5" fill="currentColor" />
            <path
              d="M4.5 16.5 9 12l3 3 3.5-4.5 4 5.5"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>No image available</span>
        </div>
      </div>

      <div class="detail__content">
        <h1>{{ product.name }}</h1>
        <div class="detail__meta">
          <span v-if="categoryName">
            Category:
            <NuxtLink
              v-if="categorySlug"
              :to="`/categories/${categorySlug}`"
              class="detail__category-link"
            >
              {{ categoryName }}
            </NuxtLink>
            <template v-else>{{ categoryName }}</template>
          </span>
          <span>Stock: {{ product.stock }}</span>
        </div>
        <p class="detail__price">
          <template v-if="onSale">
            <span class="detail__price-current">{{ formatMoney(chargePrice) }}</span>
            <span class="detail__price-compare">{{ formatMoney(sellingPrice) }}</span>
          </template>
          <template v-else>
            {{ formatMoney(chargePrice) }}
          </template>
        </p>
        <p class="detail__description">{{ product.description }}</p>

        <button
          class="btn btn--primary"
          type="button"
          :disabled="product.stock < 1"
          @click="handleAddToCart"
        >
          {{ product.stock < 1 ? 'Out of stock' : 'Add to Cart' }}
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import {
  formatMoney,
  getChargePrice,
  getDiscountPercent,
  getSellingPrice,
  hasActiveDiscount,
} from '~/utils/pricing'
import { buildProductJsonLd } from '~/utils/productJsonLd'
import { DEFAULT_OG_IMAGE } from '~/utils/seo'

definePageMeta({
  layout: 'default',
})

const route = useRoute()
const config = useRuntimeConfig()
const cart = useCartStore()
const { flyToCart } = useFlyToCart()
const mediaEl = ref(null)
const imageFailed = ref(false)

const productId = computed(() => route.params.id)
const siteUrl = config.public.siteUrl || 'http://localhost:3000'
const pageUrl = computed(() => `${siteUrl}/products/${productId.value}`)

const { data, pending, error } = await useFetch(
  () => `${config.public.apiBase}/api/products/${productId.value}`,
  {
    key: () => `product-${productId.value}`,
    watch: [productId],
  }
)

const product = computed(() => data.value?.data ?? null)

const productImageSrc = computed(() => {
  const src = product.value?.images?.[0]
  return typeof src === 'string' ? src.trim() : ''
})

const showProductImage = computed(() => Boolean(productImageSrc.value) && !imageFailed.value)

watch(productImageSrc, () => {
  imageFailed.value = false
})

const categoryName = computed(() => {
  const category = product.value?.category
  if (!category) return ''
  if (typeof category === 'object') return category.name || ''
  return String(category)
})

const categorySlug = computed(() => {
  const category = product.value?.category
  if (category && typeof category === 'object') return category.slug || ''
  return ''
})

const onSale = computed(() => hasActiveDiscount(product.value))
const chargePrice = computed(() => getChargePrice(product.value))
const sellingPrice = computed(() => getSellingPrice(product.value))
const discountPercent = computed(() => getDiscountPercent(product.value))

const seoDescription = computed(() => {
  if (!product.value) return 'View this product at Petsitively.'
  const text = String(product.value.description || '').replace(/\s+/g, ' ').trim()
  return text.length > 155 ? `${text.slice(0, 152)}…` : text
})

const seoImage = computed(() => product.value?.images?.[0] || DEFAULT_OG_IMAGE)

usePageSeo({
  title: () =>
    product.value ? `${product.value.name} — Petsitively` : 'Product — Petsitively',
  description: seoDescription,
  ogTitle: () => (product.value ? product.value.name : 'Product — Petsitively'),
  ogImage: seoImage,
  ogType: 'product',
  path: () => `/products/${productId.value}`,
})

const jsonLd = computed(() =>
  buildProductJsonLd(product.value, {
    siteUrl,
    pageUrl: pageUrl.value,
  })
)

useHead(() => ({
  script: jsonLd.value
    ? [
        {
          key: 'product-jsonld',
          type: 'application/ld+json',
          children: JSON.stringify(jsonLd.value),
        },
      ]
    : [],
}))

async function handleAddToCart() {
  if (!product.value) return
  cart.addToCart(product.value)
  await flyToCart({
    fromEl: mediaEl.value,
    imageUrl: showProductImage.value ? productImageSrc.value : '',
  })
}
</script>
