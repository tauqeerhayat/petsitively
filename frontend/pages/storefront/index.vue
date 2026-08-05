<template>
  <div class="home">
    <section class="hero" aria-label="Petsitively hero">
      <div class="hero__backdrop" aria-hidden="true" />
      <div class="hero__veil" aria-hidden="true" />

      <div class="hero__content">
        <p class="hero__brand">Petsitively</p>
        <h1 class="hero__title">Shop for your pets</h1>
        <p class="hero__lead">
          Thoughtful gear and everyday essentials for happier companions.
        </p>
        <a href="#products" class="hero__cta">Shop Now</a>
      </div>

      <a href="#products" class="hero__scroll" aria-label="Scroll to products">
        <span class="hero__scroll-label">Scroll</span>
        <span class="hero__scroll-chevron" aria-hidden="true" />
      </a>
    </section>

    <section class="trust-bar" aria-label="Why shop with Petsitively">
      <div class="container trust-bar__inner">
        <div class="trust-bar__item">
          <span class="trust-bar__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
              <path
                d="M3 7h11v10H3V7Z"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linejoin="round"
              />
              <path
                d="M14 10h4.2L21 13v4h-7v-7Z"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linejoin="round"
              />
              <circle cx="7" cy="18.5" r="1.5" fill="currentColor" />
              <circle cx="17.5" cy="18.5" r="1.5" fill="currentColor" />
            </svg>
          </span>
          <span class="trust-bar__text">Fast Shipping</span>
        </div>

        <div class="trust-bar__item">
          <span class="trust-bar__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
              <path
                d="M4 7.5h11l3 3V19a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8.5a1 1 0 0 1 1-1Z"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linejoin="round"
              />
              <path
                d="M9 12.5h4M11 10.5v4"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linecap="round"
              />
              <path
                d="M15 4.5 18 7.5"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linecap="round"
              />
            </svg>
          </span>
          <span class="trust-bar__text">30-Day Returns</span>
        </div>

        <div class="trust-bar__item">
          <span class="trust-bar__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
              <rect
                x="4"
                y="10"
                width="16"
                height="10"
                rx="2"
                stroke="currentColor"
                stroke-width="1.7"
              />
              <path
                d="M8 10V7.5a4 4 0 0 1 8 0V10"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linecap="round"
              />
              <circle cx="12" cy="15" r="1.3" fill="currentColor" />
            </svg>
          </span>
          <span class="trust-bar__text">Secure Checkout</span>
        </div>

        <div class="trust-bar__item">
          <span class="trust-bar__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
              <path
                d="M12 20s-6.5-3.8-8.8-7.7C1.4 9.4 2.5 6.2 5.4 5.3c1.7-.5 3.5.1 4.6 1.5L12 9l2-2.2c1.1-1.4 2.9-2 4.6-1.5 2.9.9 4 4.1 2.2 7C18.5 16.2 12 20 12 20Z"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linejoin="round"
              />
            </svg>
          </span>
          <span class="trust-bar__text">Loved by Pet Owners</span>
        </div>
      </div>
    </section>

    <section v-reveal class="mission" aria-labelledby="mission-heading">
      <div class="container mission__inner">
        <div class="mission__media">
          <NuxtImg
            src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80"
            alt="Pet owner sitting outdoors with two happy dogs"
            width="1200"
            height="900"
            fit="cover"
            loading="lazy"
            format="webp"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div class="mission__copy">
          <p class="mission__eyebrow">Our mission</p>
          <h2 id="mission-heading">Caring for pets like family</h2>
          <p>
            At Petsitively, we believe every wag, purr, and quiet nuzzle deserves the same
            care you’d give the people you love. We choose products that feel thoughtful —
            the everyday comforts that turn a house into a home for your companions.
          </p>
          <NuxtLink to="/about" class="mission__link">Read our story</NuxtLink>
        </div>
      </div>
    </section>

    <div id="products" class="container home__catalog">
      <div class="home__catalog-header">
        <h2 class="home__catalog-title">Shop products</h2>
        <p v-if="!pending && !error" class="home__catalog-meta">
          {{ products.length }} product{{ products.length === 1 ? '' : 's' }}
        </p>
      </div>

      <ProductFilters
        :model-value="filters"
        :categories="categories"
        @update:model-value="onFiltersUpdate"
        @clear="clearFilters"
      />

      <ProductGridSkeleton v-if="pending" />
      <div v-else-if="error" class="state-box">
        Could not load products. Make sure the API is running on port 5000.
      </div>
      <div v-else-if="!products.length && hasActiveFilters" class="state-box product-filters-empty">
        <p>No products found matching your filters.</p>
        <button type="button" class="btn btn--primary" @click="clearFilters">
          Clear Filters
        </button>
      </div>
      <div v-else-if="!products.length" class="state-box">
        No products yet. Add some in the database to see them here.
      </div>

      <section
        v-else
        v-reveal.stagger
        class="product-grid"
        aria-label="Products"
      >
        <ProductCard
          v-for="product in products"
          :key="product._id"
          :product="product"
        />
      </section>
    </div>

    <section class="testimonials" aria-labelledby="testimonials-heading">
      <div class="container">
        <div v-reveal class="testimonials__intro">
          <p class="testimonials__eyebrow">Kind words</p>
          <h2 id="testimonials-heading">Loved by pet parents</h2>
        </div>

        <div v-reveal.stagger class="testimonials__grid">
          <article
            v-for="review in testimonials"
            :key="review.name"
            class="testimonial-card"
          >
            <p class="testimonial-card__stars" aria-label="5 out of 5 stars">
              <span aria-hidden="true">★★★★★</span>
            </p>
            <blockquote class="testimonial-card__quote">
              “{{ review.quote }}”
            </blockquote>
            <p class="testimonial-card__name">{{ review.name }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="home-faq" aria-labelledby="home-faq-heading">
      <div class="container">
        <div v-reveal class="home-faq__intro">
          <p class="home-faq__eyebrow">Help center</p>
          <h2 id="home-faq-heading">Frequently Asked Questions</h2>
          <p class="home-faq__lead">
            Quick answers about shipping, returns, payments, and orders.
          </p>
        </div>

        <div v-reveal class="home-faq__body">
          <FaqAccordion :items="topFaqs" />
          <p class="home-faq__footer">
            <NuxtLink to="/faq" class="home-faq__link">View All FAQs →</NuxtLink>
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { getTopFaqs } from '~/utils/faqData'

const config = useRuntimeConfig()
const topFaqs = getTopFaqs(4)

const testimonials = [
  {
    name: 'Ayesha R.',
    quote:
      'My dog’s new bed arrived quickly and he claimed it the same night. Feels like shopping from people who actually get pets.',
  },
  {
    name: 'Daniel K.',
    quote:
      'The rope toy survived our tug-of-war champion. Quality was solid and checkout was simple — already planning a reorder.',
  },
  {
    name: 'Maya L.',
    quote:
      'Finally a store that feels warm, not overwhelming. The cat teaser is her favorite thing in the apartment now.',
  },
]

const heroImage =
  'https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&w=2400&q=80'

usePageSeo({
  title: 'Petsitively — Shop for your pets',
  description:
    'Thoughtful gear and everyday essentials for happier companions. Shop food, toys, bedding, grooming, and more at Petsitively.',
  ogImage: heroImage,
  path: '/',
})

useHead({
  link: [
    {
      rel: 'preload',
      as: 'image',
      href: heroImage,
      fetchpriority: 'high',
    },
  ],
})

const { data: categoriesData } = await useFetch(`${config.public.apiBase}/api/categories`, {
  key: 'home-categories',
})

const categories = computed(() => categoriesData.value?.data ?? [])

const filters = reactive({
  search: '',
  category: '',
  sort: 'newest',
  minPrice: '',
  maxPrice: '',
})

const debouncedSearch = ref('')
let searchTimer

watch(
  () => filters.search,
  (value) => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
      debouncedSearch.value = String(value || '').trim()
    }, 400)
  }
)

onBeforeUnmount(() => {
  clearTimeout(searchTimer)
})

const productsQuery = computed(() => {
  const query = {
    sort: filters.sort || 'newest',
  }

  if (debouncedSearch.value) {
    query.search = debouncedSearch.value
  }
  if (filters.category) {
    query.category = filters.category
  }
  if (filters.minPrice !== '' && filters.minPrice != null) {
    query.minPrice = filters.minPrice
  }
  if (filters.maxPrice !== '' && filters.maxPrice != null) {
    query.maxPrice = filters.maxPrice
  }

  return query
})

const hasActiveFilters = computed(() =>
  Boolean(
    String(filters.search || '').trim() ||
      filters.category ||
      (filters.minPrice !== '' && filters.minPrice != null) ||
      (filters.maxPrice !== '' && filters.maxPrice != null) ||
      (filters.sort && filters.sort !== 'newest')
  )
)

function onFiltersUpdate(next) {
  filters.search = next.search ?? ''
  filters.category = next.category ?? ''
  filters.sort = next.sort || 'newest'
  filters.minPrice = next.minPrice === undefined || next.minPrice === null ? '' : next.minPrice
  filters.maxPrice = next.maxPrice === undefined || next.maxPrice === null ? '' : next.maxPrice
}

function clearFilters() {
  clearTimeout(searchTimer)
  filters.search = ''
  filters.category = ''
  filters.sort = 'newest'
  filters.minPrice = ''
  filters.maxPrice = ''
  debouncedSearch.value = ''
}

const { data, pending, error } = await useFetch(() => `${config.public.apiBase}/api/products`, {
  key: 'products',
  query: productsQuery,
  watch: [productsQuery],
})

const products = computed(() => data.value?.data ?? [])
</script>
