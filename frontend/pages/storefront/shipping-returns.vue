<template>
  <div class="container content-page">
    <section v-reveal class="page-hero">
      <p class="content-page__eyebrow">Policies</p>
      <h1>Shipping & returns</h1>
      <p>Clear timelines for a dropshipping store — so you know what to expect before you order.</p>
    </section>

    <div class="content-stack">
      <article v-reveal class="content-card prose">
        <h2>Shipping</h2>
        <p>
          Petsitively fulfills orders through trusted dropshipping partners. After you place an
          order, items are packed and shipped directly from our suppliers.
        </p>
        <ul>
          <li>
            <strong>Delivery window:</strong> most orders arrive within
            <strong>7–15 business days</strong>, depending on destination and stock location.
          </li>
          <li>
            <strong>Order processing:</strong> allow 1–3 business days for the supplier to confirm
            and dispatch your items.
          </li>
          <li>
            <strong>Tracking:</strong> when a tracking number is available, we share it by email so
            you can follow the shipment.
          </li>
        </ul>
        <p>
          Delivery times can vary during peak seasons, holidays, or customs delays for international
          routes. If your order is outside the expected window, contact us and we’ll help look into it.
        </p>
      </article>

      <article id="returns" v-reveal class="content-card prose">
        <h2>Returns & refunds</h2>
        <p>
          We want you to feel confident shopping with us. You may request a return within
          <strong>30 days</strong> of delivery for unused items in their original condition and packaging.
        </p>
        <ul>
          <li>
            <strong>Return window:</strong> <strong>30 days</strong> from the delivery date.
          </li>
          <li>
            <strong>Eligible items:</strong> unused, undamaged products with tags/packaging intact
            (opened consumables such as food may be excluded for hygiene reasons).
          </li>
          <li>
            <strong>Refunds:</strong> once we confirm the return with our supplier, refunds are
            typically processed to your original payment method within a few business days.
          </li>
          <li>
            <strong>Damaged or incorrect items:</strong> contact us with photos within 7 days of
            delivery and we’ll prioritize a replacement or refund.
          </li>
        </ul>
        <p>
          To start a return, reach out via our
          <NuxtLink to="/contact">contact form</NuxtLink> with your order ID and reason. We’ll guide
          you through the next steps.
        </p>
        <NuxtLink to="/contact" class="btn btn--primary">Contact support</NuxtLink>
      </article>
    </div>
  </div>
</template>

<script setup>
usePageSeo({
  title: 'Shipping & Returns — Petsitively',
  description:
    'Petsitively shipping times (7–15 days) and 30-day return policy for our pet product store.',
  path: '/shipping-returns',
})
</script>
