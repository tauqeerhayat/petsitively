<template>
  <div class="container content-page">
    <section v-reveal class="page-hero">
      <p class="content-page__eyebrow">Care</p>
      <h1>Pet Care Guide</h1>
      <p>Simple practices that support healthier days for pets and less stress for you.</p>
    </section>

    <article v-reveal class="content-card prose">
      <h2>Start with the everyday</h2>
      <p>
        Consistent feeding, clean water, rest, and play do more for most pets than one-off
        gadgets. Choose tools that make those routines easier—not harder.
      </p>
      <h2>When shopping, ask why</h2>
      <p>
        Prefer products that solve a clear problem: calmer nights, cleaner floors, gentler
        grooming, or more productive play. If it only claims to look cute, skip it.
      </p>
      <h2>Need a product shortcut?</h2>
      <p>
        Browse
        <NuxtLink to="/#shop-by-problem">shop by problem</NuxtLink>
        or our
        <NuxtLink to="/#best-sellers">best sellers</NuxtLink>
        —each pick is chosen for everyday use, not shelf filler.
      </p>
      <NuxtLink to="/contact" class="btn btn--primary">Ask a care question</NuxtLink>
    </article>
  </div>
</template>

<script setup>
usePageSeo({
  title: 'Pet Care Guide — Petsitively',
  description:
    'Straightforward pet care guidance from Petsitively — routines, product choices, and calm everyday care for pets and owners.',
  path: '/pet-care-guide',
})
</script>
