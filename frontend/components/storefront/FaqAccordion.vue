<template>
  <div class="faq-accordion" role="list">
    <div
      v-for="item in items"
      :key="item.id"
      class="faq-accordion__item"
      role="listitem"
      :class="{ 'is-open': openIds.has(item.id) }"
    >
      <h3 class="faq-accordion__heading">
        <button
          type="button"
          class="faq-accordion__trigger"
          :aria-expanded="openIds.has(item.id)"
          :aria-controls="`faq-panel-${item.id}`"
          :id="`faq-trigger-${item.id}`"
          @click="toggle(item.id)"
        >
          <span class="faq-accordion__question">{{ item.question }}</span>
          <span class="faq-accordion__icon" aria-hidden="true" />
        </button>
      </h3>
      <div
        :id="`faq-panel-${item.id}`"
        class="faq-accordion__panel"
        role="region"
        :aria-labelledby="`faq-trigger-${item.id}`"
        :hidden="!openIds.has(item.id)"
      >
        <p class="faq-accordion__answer">{{ item.answer }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})

const openIds = ref(new Set())

function toggle(id) {
  const next = new Set(openIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  openIds.value = next
}

watch(
  () => props.items.map((item) => item.id).join(','),
  () => {
    openIds.value = new Set()
  }
)
</script>
