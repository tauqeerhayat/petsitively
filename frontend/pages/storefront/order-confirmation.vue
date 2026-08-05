<template>
  <div class="container confirmation-page">
    <div v-if="!orderId" class="state-box">
      No order ID provided.
      <div class="confirmation-page__actions">
        <NuxtLink to="/" class="btn btn--primary">Back to shop</NuxtLink>
      </div>
    </div>

    <div v-else-if="pending" class="state-box">
      <div class="ui-loading">
        <UiSpinner size="lg" />
        <p class="ui-loading__text">Loading your order…</p>
      </div>
    </div>

    <div v-else-if="error || !order" class="state-box">
      We couldn’t load this order.
      <div class="confirmation-page__actions">
        <NuxtLink to="/" class="btn btn--primary">Back to shop</NuxtLink>
      </div>
    </div>

    <section v-else v-reveal class="confirmation">
      <p class="confirmation__eyebrow">Order confirmed</p>
      <h1>Thank you, {{ order.customerName }}</h1>
      <p class="confirmation__lead">
        We’ve received your order
        <strong>#{{ shortId }}</strong>. A confirmation will go to
        <strong>{{ order.email }}</strong>.
      </p>

      <div class="confirmation__card">
        <div class="confirmation__row">
          <span>Status</span>
          <strong class="confirmation__status">{{ order.paymentStatus }}</strong>
        </div>
        <div class="confirmation__row">
          <span>Shipping</span>
          <strong>{{ order.shippingAddress }}</strong>
        </div>
        <div class="confirmation__row">
          <span>Total</span>
          <strong>${{ Number(order.totalAmount).toFixed(2) }}</strong>
        </div>
      </div>

      <h2 class="confirmation__items-title">Items</h2>
      <ul class="confirmation__items">
        <li v-for="(item, index) in order.items" :key="index">
          <span>{{ item.name }} × {{ item.quantity }}</span>
          <strong>${{ (item.price * item.quantity).toFixed(2) }}</strong>
        </li>
      </ul>

      <div class="confirmation-page__actions">
        <NuxtLink to="/" class="btn btn--primary">Continue shopping</NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup>
const route = useRoute()
const config = useRuntimeConfig()

usePageSeo({
  title: 'Order confirmation — Petsitively',
  description: 'Your Petsitively order confirmation details.',
  path: '/order-confirmation',
  robots: 'noindex, nofollow',
})

const orderId = computed(() => {
  const id = route.query.id
  return typeof id === 'string' ? id : Array.isArray(id) ? id[0] : ''
})

const { data, pending, error } = await useFetch(
  () => `${config.public.apiBase}/api/orders/${orderId.value}`,
  {
    key: () => `order-${orderId.value}`,
    immediate: !!orderId.value,
    watch: [orderId],
  }
)

const order = computed(() => data.value?.data ?? null)
const shortId = computed(() =>
  order.value?._id ? String(order.value._id).slice(-8).toUpperCase() : ''
)
</script>
