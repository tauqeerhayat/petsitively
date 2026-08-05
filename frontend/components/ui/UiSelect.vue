<template>
  <select
    class="ui-input ui-input--select"
    :value="modelValue"
    :disabled="disabled"
    v-bind="attrs"
    @change="emit('update:modelValue', $event.target.value)"
  >
    <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
    <option
      v-for="option in normalizedOptions"
      :key="String(option.value)"
      :value="option.value"
    >
      {{ option.label }}
    </option>
  </select>
</template>

<script setup>
defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
  placeholder: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])
const attrs = useAttrs()

const normalizedOptions = computed(() =>
  (props.options || []).map((option) => {
    if (option && typeof option === 'object') {
      return {
        value: option.value ?? option.id ?? '',
        label: option.label ?? option.name ?? String(option.value ?? ''),
      }
    }
    return { value: option, label: String(option) }
  })
)
</script>
