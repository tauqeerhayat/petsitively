<template>
  <div class="container content-page faq-page">
    <section v-reveal class="page-hero">
      <p class="content-page__eyebrow">Help center</p>
      <h1>Frequently Asked Questions</h1>
      <p>Find answers about shipping, returns, payments, and managing your orders.</p>
    </section>

    <div v-reveal class="faq-page__search">
      <label class="faq-page__search-label" for="faq-search">Search FAQs</label>
      <input
        id="faq-search"
        v-model="searchQuery"
        type="search"
        class="faq-page__search-input"
        placeholder="Search by keyword…"
        autocomplete="off"
      />
    </div>

    <div v-if="groupedFaqs.length" class="faq-page__groups">
      <section
        v-for="group in groupedFaqs"
        :key="group.category"
        v-reveal
        class="faq-page__group"
        :aria-labelledby="`faq-cat-${slugify(group.category)}`"
      >
        <h2 :id="`faq-cat-${slugify(group.category)}`" class="faq-page__group-title">
          {{ group.category }}
        </h2>
        <FaqAccordion :items="group.items" />
      </section>
    </div>

    <p v-else v-reveal class="faq-page__empty" role="status">
      No FAQs match “{{ searchQuery.trim() }}”. Try another keyword, or
      <NuxtLink to="/contact">contact support</NuxtLink>.
    </p>
  </div>
</template>

<script setup>
import { filterFaqs, groupFaqsByCategory } from '~/utils/faqData'

usePageSeo({
  title: 'FAQ — Petsitively',
  description:
    'Frequently asked questions about Petsitively shipping, returns, payments, and orders.',
  path: '/faq',
})

const searchQuery = ref('')

const filteredFaqs = computed(() => filterFaqs(searchQuery.value))
const groupedFaqs = computed(() => groupFaqsByCategory(filteredFaqs.value))

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
</script>
