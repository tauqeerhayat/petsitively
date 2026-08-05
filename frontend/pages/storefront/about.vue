<template>
  <div class="container content-page">
    <section v-reveal class="page-hero">
      <p class="content-page__eyebrow">Our story</p>
      <h1>About Petsitively</h1>
      <p>Thoughtful pet care, without the clutter.</p>
    </section>

    <article v-reveal class="content-card prose">
      <p>
        Petsitively started with a simple belief: pets deserve products chosen with the same care
        we give the people we love. We curate everyday essentials — food, toys, comfort, and care —
        so shopping feels calm, clear, and genuinely helpful.
      </p>
      <p>
        Every item we feature is picked for quality, usefulness, and the quiet joy of a happier
        companion at home. No gimmicks. No endless aisles. Just a focused collection that puts
        animal wellbeing first.
      </p>
      <p>
        Whether you are welcoming a new kitten, spoiling a senior dog, or restocking the basics,
        Petsitively is here to make caring for your pets feel a little more positive — every day.
      </p>
      <NuxtLink to="/" class="btn btn--primary">Shop the collection</NuxtLink>
    </article>
  </div>
</template>

<script setup>
usePageSeo({
  title: 'About Petsitively — Our story',
  description:
    'Learn how Petsitively curates thoughtful pet products — food, toys, comfort, and care — chosen for quality and happier companions.',
  path: '/about',
})
</script>
