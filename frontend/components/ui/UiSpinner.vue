<template>
  <span
    class="ui-spinner"
    :class="[`ui-spinner--${size}`, { 'ui-spinner--light': light }]"
    role="status"
    :aria-label="label"
  >
    <span class="ui-spinner__ring" aria-hidden="true" />
    <span v-if="label && showLabel" class="ui-spinner__label">{{ label }}</span>
  </span>
</template>

<script setup>
defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value),
  },
  light: { type: Boolean, default: false },
  label: { type: String, default: 'Loading' },
  showLabel: { type: Boolean, default: false },
})
</script>
