<template>
  <div class="home">
    <section class="hero-section" aria-label="Petsitively hero">
      <div class="hero-main">
        <div class="hero-content">
          <div class="hero-content__logo" aria-label="Petsitively">
            <span class="hero-content__logo-mark" aria-hidden="true">
              <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
                <path
                  d="M16 28c-1.2-1.1-6.8-5.3-9.4-9.4C4.2 14.7 4 11.2 6.1 9.2c1.7-1.6 4.3-1.5 6.1.3L16 13l3.8-3.5c1.8-1.8 4.4-1.9 6.1-.3 2.1 2 1.9 5.5-.5 9.4C22.8 22.7 17.2 26.9 16 28Z"
                  fill="currentColor"
                />
                <circle cx="8.2" cy="7.2" r="2.4" fill="currentColor" />
                <circle cx="23.8" cy="7.2" r="2.4" fill="currentColor" />
                <circle cx="5.6" cy="13.2" r="2.1" fill="currentColor" />
                <circle cx="26.4" cy="13.2" r="2.1" fill="currentColor" />
              </svg>
            </span>
            <span class="hero-content__logo-wordmark">Petsitively</span>
          </div>

          <h1 class="hero-content__title">Because They're Family.</h1>
          <p class="hero-content__lead">
            Thoughtfully selected products that make everyday life easier, cleaner and
            happier—for both pets and the people who love them.
          </p>

          <div class="hero-content__actions">
            <a href="#best-sellers" class="btn btn--primary hero-content__btn-primary">
              Shop Best Sellers
            </a>
            <NuxtLink to="/about" class="btn hero-content__btn-secondary">Our Story</NuxtLink>
          </div>
        </div>

        <ul class="trust-badges" aria-label="Why shop with Petsitively">
          <li class="trust-badges__item">
            <span class="trust-badges__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M12 15.2 9.9 13.3a1.55 1.55 0 0 1 0-2.25 1.7 1.7 0 0 1 2.35 0l.15.14.15-.14a1.7 1.7 0 0 1 2.35 0 1.55 1.55 0 0 1 0 2.25L12 15.2Z"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
            <span class="trust-badges__text">Pet Parent Approved</span>
          </li>
          <li class="trust-badges__item">
            <span class="trust-badges__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M15 18H9M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.36A1 1 0 0 0 17.52 8H14"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <circle cx="17" cy="18" r="2" stroke="currentColor" stroke-width="1.6" />
                <circle cx="7" cy="18" r="2" stroke="currentColor" stroke-width="1.6" />
              </svg>
            </span>
            <span class="trust-badges__text">Free Shipping over $49</span>
          </li>
          <li class="trust-badges__item">
            <span class="trust-badges__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <rect
                  x="3.5"
                  y="5"
                  width="17"
                  height="15"
                  rx="2"
                  stroke="currentColor"
                  stroke-width="1.6"
                />
                <path
                  d="M8 3.25v3.5M16 3.25v3.5M3.5 10h17"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                />
                <path
                  d="M14.25 14.25v3.5M12.5 16h3.5"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                />
              </svg>
            </span>
            <span class="trust-badges__text">30-Day Happiness Guarantee</span>
          </li>
          <li class="trust-badges__item">
            <span class="trust-badges__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <rect
                  x="5"
                  y="11"
                  width="14"
                  height="10"
                  rx="2"
                  stroke="currentColor"
                  stroke-width="1.6"
                />
                <path
                  d="M8 11V7.5a4 4 0 0 1 8 0V11"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                />
              </svg>
            </span>
            <span class="trust-badges__text">Secure Checkout</span>
          </li>
        </ul>
      </div>

      <nav
        id="shop-by-problem"
        class="problem-solver-bar"
        aria-label="Shop by the problem you want solved"
      >
        <NuxtLink
          v-for="item in problemLinks"
          :key="item.title"
          :to="item.to"
          class="problem-solver-bar__card"
        >
          <span class="problem-solver-bar__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
              <path
                v-if="item.icon === 'bowl'"
                d="M4.5 12h15v.8A6 6 0 0 1 13.6 18.5h-3.2A6 6 0 0 1 4.5 12.8V12ZM7 12V10a5 5 0 0 1 10 0v2M9 5.2c.3-.7.6-1.2 1-1.2s.7.5 1 1.2M13 5.2c.3-.7.6-1.2 1-1.2s.7.5 1 1.2"
                stroke="currentColor"
                stroke-width="1.55"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                v-else-if="item.icon === 'moon'"
                d="M14.2 4.5A7.2 7.2 0 1 0 19.5 14 5.8 5.8 0 1 1 14.2 4.5ZM17.2 5.8c.2-.5.4-.9.7-.9s.5.4.7.9"
                stroke="currentColor"
                stroke-width="1.55"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                v-else-if="item.icon === 'sparkle'"
                d="M12 3.5 13.4 9l5.6 1.4-5.6 1.4L12 17l-1.4-5.2L5 10.4l5.6-1.4L12 3.5ZM18.5 15.5 19 17l1.5.5L19 18l-.5 1.5-.5-1.5L16.5 17l1.5-.5.5-1.5Z"
                stroke="currentColor"
                stroke-width="1.45"
                stroke-linejoin="round"
              />
              <path
                v-else-if="item.icon === 'bath'"
                d="M4.5 14.5h15v2.2a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-2.2ZM6 14.5V11a3.5 3.5 0 0 1 3.5-3.5H12M12.5 4.5v3M11 6h3"
                stroke="currentColor"
                stroke-width="1.55"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                v-else
                d="M7.5 10.5c0-2.4 1.9-4 4.5-4s4.5 1.6 4.5 4c0 2.8-2.1 4.2-4.5 6.3-2.4-2.1-4.5-3.5-4.5-6.3ZM5.5 13c1.2.3 2 .2 2.8-.4M18.5 13c-1.2.3-2 .2-2.8-.4"
                stroke="currentColor"
                stroke-width="1.55"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
          <span class="problem-solver-bar__title">{{ item.title }}</span>
          <span class="problem-solver-bar__desc">{{ item.description }}</span>
        </NuxtLink>
      </nav>
    </section>

    <!-- Best Sellers — conversion -->
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

// Full-bleed lifestyle hero — owner with dog and cat outdoors
const heroImage = '/images/hero-bg.jpg'

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
    icon: 'sparkle',
  },
  {
    title: 'Shedding & baths',
    description: 'Grooming that feels gentler on skin, coats, and your schedule.',
    slug: 'grooming',
    icon: 'bath',
  },
  {
    title: 'Picky appetites',
    description: 'Nourishing options chosen to support happier, steadier eating.',
    slug: 'food',
    icon: 'treat',
  },
]

usePageSeo({
  title: "Petsitively — Because They're Family",
  description:
    'Thoughtfully selected pet products that make everyday life easier, cleaner and happier—for pets and the people who love them.',
  ogImage: heroImage,
  path: '/',
})

async function fetchList(path, query) {
  try {
    return await $fetch(`${config.public.apiBase}${path}`, {
      timeout: 3500,
      query,
    })
  } catch {
    // Backend offline must not block the page
    return { data: [] }
  }
}

// Run in parallel so a slow API still paints the hero quickly
const [{ data: categoriesData }, { data, pending, error }] = await Promise.all([
  useAsyncData('home-categories', () => fetchList('/api/categories'), {
    default: () => ({ data: [] }),
  }),
  useAsyncData(
    'home-products',
    () => fetchList('/api/products', { sort: 'newest' }),
    { default: () => ({ data: [] }) }
  ),
])

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
