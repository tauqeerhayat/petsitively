<template>
  <div class="container content-page">
    <section v-reveal class="page-hero">
      <p class="content-page__eyebrow">Journal</p>
      <h1>Blog</h1>
      <p>Quiet notes on pet care, everyday routines, and products we stand behind.</p>
    </section>

    <article v-reveal class="content-card prose">
      <p>
        New stories are on the way. Until then, explore our
        <NuxtLink to="/pet-care-guide">Pet Care Guide</NuxtLink>
        for practical tips, or
        <NuxtLink to="/#best-sellers">shop best sellers</NuxtLink>
        chosen for real homes.
      </p>
      <NuxtLink to="/" class="btn btn--primary">Back to shop</NuxtLink>
    </article>
  </div>
</template>

<script setup>
usePageSeo({
  title: 'Blog — Petsitively',
  description:
    'Pet care tips and product notes from Petsitively — thoughtful guidance for happier pets and calmer days.',
  path: '/blog',
})
</script>
