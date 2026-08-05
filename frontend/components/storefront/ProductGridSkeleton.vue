<template>
  <div
    class="product-grid product-grid--skeleton"
    aria-busy="true"
    aria-live="polite"
    :aria-label="label"
  >
    <div
      v-for="n in count"
      :key="n"
      class="product-skeleton"
    >
      <div class="product-skeleton__image shimmer" />
      <div class="product-skeleton__body">
        <div class="product-skeleton__line shimmer" />
        <div class="product-skeleton__line product-skeleton__line--short shimmer" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  count: {
    type: Number,
    default: 8,
  },
  label: {
    type: String,
    default: 'Loading products',
  },
})
</script>
