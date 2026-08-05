<template>
  <textarea
    class="ui-input ui-input--textarea"
    :value="modelValue"
    :disabled="disabled"
    :placeholder="placeholder"
    :rows="rows"
    v-bind="attrs"
    @input="emit('update:modelValue', $event.target.value)"
  />
</template>

<script setup>
defineOptions({ inheritAttrs: false })

defineProps({
  modelValue: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  placeholder: { type: String, default: '' },
  rows: { type: [Number, String], default: 3 },
})

const emit = defineEmits(['update:modelValue'])
const attrs = useAttrs()
</script>
