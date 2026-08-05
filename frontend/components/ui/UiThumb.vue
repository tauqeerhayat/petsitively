<template>
  <div class="ui-thumb" :class="{ 'ui-thumb--broken': !showImage }" :style="sizeStyle">
    <NuxtImg
      v-if="showImage"
      :src="src"
      :alt="alt"
      class="ui-thumb__img"
      width="96"
      height="96"
      fit="cover"
      loading="lazy"
      format="webp"
      @error="onError"
    />
    <span v-else class="ui-thumb__placeholder" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="2"
          stroke="currentColor"
          stroke-width="1.7"
        />
        <circle cx="9" cy="10" r="1.6" fill="currentColor" />
        <path
          d="M4.5 16.5 9 12l3 3 3.5-4.5 4 5.5"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>
  </div>
</template>

<script setup>
const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  size: { type: [Number, String], default: 48 },
})

const failed = ref(false)

const showImage = computed(() => Boolean(props.src) && !failed.value)

const sizeStyle = computed(() => {
  const size = typeof props.size === 'number' ? `${props.size}px` : props.size
  return { width: size, height: size }
})

watch(
  () => props.src,
  () => {
    failed.value = false
  }
)

function onError() {
  failed.value = true
}
</script>
