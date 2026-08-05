<template>
  <label class="ui-field" :class="{ 'ui-field--disabled': disabled }">
    <span v-if="label" class="ui-field__label">
      {{ label }}
      <span v-if="required" class="ui-field__req" aria-hidden="true">*</span>
    </span>
    <slot />
    <span v-if="hint" class="ui-field__hint">{{ hint }}</span>
    <span v-if="error" class="ui-field__error" role="alert">{{ error }}</span>
  </label>
</template>

<script setup>
defineProps({
  label: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})
</script>
