<template>
  <div class="home">
    <!-- 1. Hero — emotion + conversion -->
    <section class="hero" aria-label="Petsitively hero">
      <div class="hero__backdrop" aria-hidden="true" />
      <div class="hero__veil" aria-hidden="true" />

      <div class="hero__content">
        <p class="hero__brand">Petsitively</p>
        <h1 class="hero__title">Because They're Family.</h1>
        <p class="hero__lead">
          Thoughtfully selected products that make everyday life easier, cleaner and
          happier—for both pets and the people who love them.
        </p>
        <div class="hero__actions">
          <div class="hero__primary">
            <a href="#best-sellers" class="hero__cta">Shop Best Sellers</a>
            <p class="hero__trust">
              Thoughtfully selected products. No clutter. No gimmicks.
            </p>
          </div>
          <NuxtLink to="/about" class="hero__cta hero__cta--secondary">Our Story</NuxtLink>
        </div>
      </div>

      <a href="#trust" class="hero__scroll" aria-label="Scroll to next section">
        <span class="hero__scroll-label">Scroll</span>
        <span class="hero__scroll-chevron" aria-hidden="true" />
      </a>
    </section>

    <!-- 2. Trust bar -->
    <section id="trust" class="trust-bar" aria-label="Why shop with Petsitively">
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
          <span class="trust-bar__text">Loved by Pet Parents</span>
        </div>
      </div>
    </section>

    <!-- 3. Shop by Problem — conversion via real needs -->
    <section
      id="shop-by-problem"
      v-reveal
      class="shop-problems"
      aria-labelledby="shop-problems-heading"
    >
      <div class="container">
        <div class="section-intro">
          <p class="section-intro__eyebrow">Start here</p>
          <h2 id="shop-problems-heading">Shop by the problem you want solved</h2>
          <p class="section-intro__lead">
            Skip endless aisles. Find what actually helps your pet—and your day.
          </p>
        </div>

        <div v-reveal.stagger class="shop-problems__grid">
          <NuxtLink
            v-for="item in problemLinks"
            :key="item.title"
            :to="item.to"
            class="shop-problems__item"
          >
            <span class="shop-problems__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
                <path
                  v-if="item.icon === 'bowl'"
                  d="M4 11.5h16v1.2A6.5 6.5 0 0 1 13.5 19h-3A6.5 6.5 0 0 1 4 12.7v-1.2ZM6 11.5V9.8A6 6 0 0 1 12 4a6 6 0 0 1 6 5.8v1.7"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  v-else-if="item.icon === 'moon'"
                  d="M14.5 4.2A7.5 7.5 0 1 0 19.8 14 6.2 6.2 0 1 1 14.5 4.2Z"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linejoin="round"
                />
                <path
                  v-else-if="item.icon === 'toy'"
                  d="M12 4.5v15M4.5 12h15M7.1 7.1l9.8 9.8M16.9 7.1 7.1 16.9"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linecap="round"
                />
                <path
                  v-else-if="item.icon === 'brush'"
                  d="M7 16.5 16.5 7M9.2 18.7l-2.6-2.6a1.2 1.2 0 0 1 0-1.7l1.3-1.3 4.3 4.3-1.3 1.3a1.2 1.2 0 0 1-1.7 0ZM14 5.5l4.5 4.5"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  v-else
                  d="M12 4.2c1.3 2.2 4.8 3.2 4.8 6.4A4.8 4.8 0 0 1 12 15.4 4.8 4.8 0 0 1 7.2 10.6c0-3.2 3.5-4.2 4.8-6.4ZM8 18.5h8"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
            <span class="shop-problems__title">{{ item.title }}</span>
            <span class="shop-problems__desc">{{ item.description }}</span>
            <span class="shop-problems__cta" aria-hidden="true">Shop →</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 4. Best Sellers — conversion -->
    <section
      id="best-sellers"
      class="best-sellers"
      aria-labelledby="best-sellers-heading"
    >
      <div class="container">
        <div v-reveal class="section-intro section-intro--row">
          <div>
            <p class="section-intro__eyebrow">Most loved</p>
            <h2 id="best-sellers-heading">Best Sellers</h2>
            <p class="section-intro__lead">
              Tried, reordered, and trusted by pet parents like you.
            </p>
          </div>
        </div>

        <ProductGridSkeleton v-if="pending" />
        <div v-else-if="error" class="state-box">
          Could not load products. Make sure the API is running on port 5000.
        </div>
        <div v-else-if="!bestSellers.length" class="state-box">
          Best sellers will appear here once products are added.
        </div>
        <section
          v-else
          v-reveal.stagger
          class="product-grid"
          aria-label="Best selling products"
        >
          <ProductCard
            v-for="product in bestSellers"
            :key="product._id"
            :product="product"
            :benefit="benefitForProduct(product)"
          />
        </section>
      </div>
    </section>

    <!-- 5. Why Petsitively — trust -->
    <section v-reveal class="why" aria-labelledby="why-heading">
      <div class="container why__inner">
        <div class="why__media">
          <NuxtImg
            :src="whyImage"
            alt="Person outdoors with a golden retriever, sharing a moment together"
            width="1200"
            height="900"
            fit="cover"
            loading="lazy"
            format="webp"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div class="why__copy">
          <p class="why__eyebrow">Why Petsitively</p>
          <h2 id="why-heading">Curated care, not clutter</h2>
          <p class="why__lead">
            We only carry products that make life better for pets and the people who love them—
            chosen with the same care you’d give family.
          </p>
          <ul class="why__list">
            <li>
              <strong>Thoughtfully selected</strong>
              — every item earns its place for quality and real everyday use.
            </li>
            <li>
              <strong>Built for both of you</strong>
              — easier routines for you, more comfort and joy for them.
            </li>
            <li>
              <strong>Shop with confidence</strong>
              — secure checkout, clear policies, and support when you need it.
            </li>
          </ul>
          <NuxtLink to="/about" class="why__link">Read our story</NuxtLink>
        </div>
      </div>
    </section>

    <!-- 6. Reviews — trust + emotion -->
    <section class="testimonials" aria-labelledby="testimonials-heading">
      <div class="container">
        <div v-reveal class="section-intro">
          <p class="section-intro__eyebrow">From pet parents</p>
          <h2 id="testimonials-heading">Loved in real homes</h2>
          <p class="section-intro__lead">
            The kind of care that shows up in quieter nights, cleaner floors, and happier pets.
          </p>
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
            <p class="testimonial-card__meta">{{ review.meta }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- 7. Newsletter — conversion + relationship -->
    <section
      id="newsletter"
      v-reveal
      class="newsletter"
      aria-labelledby="newsletter-heading"
    >
      <div class="container newsletter__inner">
        <div class="newsletter__copy">
          <p class="newsletter__eyebrow">Stay close</p>
          <h2 id="newsletter-heading">Get pet care tips and 10% off your first order</h2>
          <p class="newsletter__lead">
            Practical advice and early product picks—rarely in your inbox, never noise.
          </p>
        </div>

        <form class="newsletter__form" @submit.prevent="subscribe">
          <label class="sr-only" for="newsletter-email">Email address</label>
          <input
            id="newsletter-email"
            v-model="newsletterEmail"
            type="email"
            name="email"
            autocomplete="email"
            required
            placeholder="you@email.com"
            class="newsletter__input"
            :disabled="newsletterStatus === 'loading' || newsletterStatus === 'success'"
          />
          <button
            type="submit"
            class="btn btn--primary newsletter__btn"
            :disabled="newsletterStatus === 'loading' || newsletterStatus === 'success'"
          >
            {{
              newsletterStatus === 'loading'
                ? 'Joining…'
                : newsletterStatus === 'success'
                  ? 'You’re in'
                  : 'Join the list'
            }}
          </button>
          <p v-if="newsletterStatus === 'success'" class="newsletter__feedback is-success" role="status">
            Welcome—glad you’re here.
          </p>
          <p v-else-if="newsletterError" class="newsletter__feedback is-error" role="alert">
            {{ newsletterError }}
          </p>
        </form>
      </div>
    </section>

    <!-- 8. FAQ — trust + simplicity -->
    <section class="home-faq" aria-labelledby="home-faq-heading">
      <div class="container">
        <div v-reveal class="section-intro">
          <p class="section-intro__eyebrow">Before you buy</p>
          <h2 id="home-faq-heading">Questions pet parents ask</h2>
          <p class="section-intro__lead">
            Clear answers on shipping, returns, and orders—so you can shop with confidence.
          </p>
        </div>

        <div v-reveal class="home-faq__body">
          <FaqAccordion :items="topFaqs" />
          <p class="home-faq__footer">
            <NuxtLink to="/faq" class="home-faq__link">View all FAQs →</NuxtLink>
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

// Local lifestyle hero — owner with dog and cat outdoors
const heroImage = '/images/hero-lifestyle.png'

// Lifestyle: owner and dog outdoors together
const whyImage =
  'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1200&q=80'

const benefitByCategory = {
  bedding: 'Encourages deeper, more restful sleep.',
  toys: 'Burns energy and eases boredom.',
  grooming: 'Helps reduce anxiety during grooming.',
  food: 'Supports healthier digestion.',
  'feeding-enrichment': 'Keeps mealtimes cleaner and calmer.',
}

function benefitForProduct(product) {
  const slug =
    product?.category?.slug ||
    product?.categorySlug ||
    (typeof product?.category === 'string' ? product.category : '') ||
    ''
  if (benefitByCategory[slug]) return benefitByCategory[slug]

  const name = String(product?.name || '').toLowerCase()
  if (/bed|mat|blanket|crate/.test(name)) return 'Encourages deeper, more restful sleep.'
  if (/toy|chew|ball|rope|teaser|puzzle/.test(name)) return 'Burns energy and eases boredom.'
  if (/brush|shampoo|groom|wipe|clipper/.test(name))
    return 'Helps reduce anxiety during grooming.'
  if (/food|treat|kibble|meal|digest/.test(name)) return 'Supports healthier digestion.'
  if (/bowl|feeder|mat|lick/.test(name)) return 'Keeps muddy paws and mess off clean floors.'
  return 'Thoughtfully chosen for everyday pet care.'
}

const testimonials = [
  {
    name: 'Ayesha R.',
    meta: 'Dog parent',
    quote:
      'My dog’s new bed arrived quickly and he claimed it the same night. Feels like shopping from people who actually get pets.',
  },
  {
    name: 'Daniel K.',
    meta: 'Busy household of two',
    quote:
      'The rope toy survived our tug-of-war champion. Quality was solid and checkout was simple — already planning a reorder.',
  },
  {
    name: 'Maya L.',
    meta: 'Cat parent',
    quote:
      'Finally a store that feels warm, not overwhelming. The cat teaser is her favorite thing in the apartment now.',
  },
]

const problemCatalog = [
  {
    title: 'Messy mealtimes',
    description: 'Cleaner feeding setups that reduce spill, stress, and cleanup.',
    slug: 'feeding-enrichment',
    icon: 'bowl',
  },
  {
    title: 'Restless nights',
    description: 'Comfort that helps pets settle—and you sleep better too.',
    slug: 'bedding',
    icon: 'moon',
  },
  {
    title: 'Zoomies & boredom',
    description: 'Toys that burn energy and keep curious minds busy.',
    slug: 'toys',
    icon: 'toy',
  },
  {
    title: 'Shedding & baths',
    description: 'Grooming that feels gentler on skin, coats, and your schedule.',
    slug: 'grooming',
    icon: 'brush',
  },
  {
    title: 'Picky appetites',
    description: 'Nourishing options chosen to support happier, steadier eating.',
    slug: 'food',
    icon: 'leaf',
  },
]

usePageSeo({
  title: "Petsitively — Because They're Family",
  description:
    'Thoughtfully selected pet products that make everyday life easier, cleaner and happier—for pets and the people who love them.',
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

const problemLinks = computed(() =>
  problemCatalog.map((item) => {
    const match = categories.value.find((cat) => cat.slug === item.slug)
    return {
      title: item.title,
      description: item.description,
      icon: item.icon,
      to: match ? `/categories/${match.slug}` : '/#best-sellers',
    }
  })
)

const { data, pending, error } = await useFetch(`${config.public.apiBase}/api/products`, {
  key: 'home-products',
  query: { sort: 'newest' },
})

const products = computed(() => data.value?.data ?? [])

const bestSellers = computed(() => {
  const list = products.value
  const featured = list.filter((p) => p.featured)
  return (featured.length ? featured : list).slice(0, 4)
})

const newsletterEmail = ref('')
const newsletterStatus = ref('idle')
const newsletterError = ref('')

async function subscribe() {
  newsletterError.value = ''
  const email = String(newsletterEmail.value || '').trim()
  if (!email) {
    newsletterError.value = 'Please enter a valid email.'
    return
  }

  newsletterStatus.value = 'loading'
  try {
    await $fetch(`${config.public.apiBase}/api/contact`, {
      method: 'POST',
      body: {
        name: 'Newsletter',
        email,
        message: 'Newsletter signup from homepage.',
      },
    })
    newsletterStatus.value = 'success'
    newsletterEmail.value = ''
  } catch {
    newsletterStatus.value = 'idle'
    newsletterError.value = 'Something went wrong. Please try again in a moment.'
  }
}
</script>
