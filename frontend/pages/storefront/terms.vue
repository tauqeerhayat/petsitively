<template>
  <div class="container content-page">
    <section v-reveal class="page-hero">
      <p class="content-page__eyebrow">Legal</p>
      <h1>Terms of Use</h1>
      <p>Clear ground rules for shopping and using Petsitively.</p>
    </section>

    <article v-reveal class="content-card prose">
      <p>
        By using Petsitively, you agree to provide accurate order information, use the site for
        lawful purposes, and respect product availability and pricing shown at checkout.
      </p>
      <p>
        Returns and shipping are covered in our
        <NuxtLink to="/shipping-returns">Shipping & returns</NuxtLink>
        policy. Product descriptions are carefully written; if something arrives differently than
        expected, contact support and we’ll put it right where we can.
      </p>
      <p>
        These terms may be updated as the shop grows. Continued use of the site means you accept
        the latest version.
      </p>
      <NuxtLink to="/" class="btn btn--primary">Continue shopping</NuxtLink>
    </article>
  </div>
</template>

<script setup>
usePageSeo({
  title: 'Terms of Use — Petsitively',
  description:
    'Terms of use for Petsitively — shopping, accounts, and site policies in plain language.',
  path: '/terms',
})
</script>
