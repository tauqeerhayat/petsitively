<template>
  <div class="container content-page">
    <section v-reveal class="page-hero">
      <p class="content-page__eyebrow">Legal</p>
      <h1>Privacy Policy</h1>
      <p>How Petsitively collects, uses, and protects your information.</p>
    </section>

    <article v-reveal class="content-card prose">
      <p>
        We collect only what we need to run the shop—account details you provide, order
        information, and basic site analytics that help us improve the experience. We do not sell
        your personal data.
      </p>
      <p>
        Payment details are processed by secure third-party providers. You can request access or
        deletion of your account information by contacting support.
      </p>
      <p>
        Questions about privacy?
        <NuxtLink to="/contact">Contact us</NuxtLink>
        and we’ll help promptly.
      </p>
      <NuxtLink to="/" class="btn btn--primary">Return home</NuxtLink>
    </article>
  </div>
</template>

<script setup>
usePageSeo({
  title: 'Privacy Policy — Petsitively',
  description:
    'Petsitively privacy policy — how we handle account, order, and site data with care and transparency.',
  path: '/privacy',
})
</script>
