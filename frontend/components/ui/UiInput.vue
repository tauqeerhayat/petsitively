<template>
  <input
    class="ui-input"
    :type="type"
    :value="modelValue"
    :disabled="disabled"
    :placeholder="placeholder"
    v-bind="attrs"
    @input="onInput"
  />
</template>

<script setup>
defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' },
  disabled: { type: Boolean, default: false },
  placeholder: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])
const attrs = useAttrs()

function onInput(event) {
  const value = event.target.value
  if (props.type === 'number') {
    emit('update:modelValue', value === '' ? '' : Number(value))
    return
  }
  emit('update:modelValue', value)
}
</script>
