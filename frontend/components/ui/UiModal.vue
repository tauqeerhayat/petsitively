<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="ui-modal"
      role="dialog"
      aria-modal="true"
      :aria-label="title || 'Dialog'"
      @keydown.esc.prevent="onEsc"
    >
      <div class="ui-modal__backdrop" @click="closeOnBackdrop && close()" />
      <div
        class="ui-modal__panel"
        :class="[panelClass, sizeClass]"
        role="document"
      >
        <header v-if="title || $slots.header" class="ui-modal__header">
          <slot name="header">
            <h2>{{ title }}</h2>
          </slot>
          <button
            v-if="showClose"
            type="button"
            class="ui-modal__close"
            aria-label="Close"
            :disabled="persist"
            @click="close"
          >
            ×
          </button>
        </header>

        <div class="ui-modal__body">
          <slot />
        </div>

        <footer v-if="$slots.footer" class="ui-modal__footer">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  showClose: { type: Boolean, default: true },
  closeOnBackdrop: { type: Boolean, default: true },
  persist: { type: Boolean, default: false },
  panelClass: { type: String, default: '' },
  /** Default is 60% viewport width. Use `sm` for compact dialogs. */
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value),
  },
})

const emit = defineEmits(['update:modelValue'])

const sizeClass = computed(() => `ui-modal__panel--${props.size}`)

let scrollY = 0

function lockBody() {
  if (!import.meta.client) return
  scrollY = window.scrollY || 0
  const scrollbar = window.innerWidth - document.documentElement.clientWidth
  document.documentElement.style.setProperty('--ui-scrollbar-comp', `${scrollbar}px`)
  document.documentElement.classList.add('ui-modal-open')
  document.body.style.top = `-${scrollY}px`
}

function unlockBody() {
  if (!import.meta.client) return
  document.documentElement.classList.remove('ui-modal-open')
  document.documentElement.style.removeProperty('--ui-scrollbar-comp')
  document.body.style.top = ''
  window.scrollTo(0, scrollY)
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) lockBody()
    else unlockBody()
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (props.modelValue) unlockBody()
})

function close() {
  if (props.persist) return
  emit('update:modelValue', false)
}

function onEsc() {
  close()
}
</script>

<style scoped lang="scss">
.ui-modal {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: grid;
  place-items: center;
  padding: 1rem;
}

.ui-modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(28, 43, 34, 0.45);
}

.ui-modal__panel {
  position: relative;
  z-index: 1;
  width: 60%;
  max-width: 60%;
  max-height: min(92vh, 900px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-surface);
  border-radius: var(--radius);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-lift);

  &--sm {
    width: min(100%, 420px);
    max-width: min(100%, 420px);
  }

  &--lg {
    width: min(100%, 80%);
    max-width: 80%;
  }

  @media (max-width: $bp-md) {
    width: 100%;
    max-width: 100%;

    &--sm,
    &--lg {
      width: 100%;
      max-width: 100%;
    }
  }
}

.ui-modal__header,
.ui-modal__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  flex-shrink: 0;
}

.ui-modal__header {
  border-bottom: 1px solid var(--color-border);
}

.ui-modal__footer {
  border-top: 1px solid var(--color-border);
  justify-content: flex-end;
}

.ui-modal__header h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.35rem;
}

.ui-modal__close {
  border: none;
  background: transparent;
  font-size: 1.6rem;
  line-height: 1;
  color: var(--color-muted);
  cursor: pointer;
  padding: 0.15rem 0.4rem;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.ui-modal__body {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1.15rem 1.25rem;
  overflow: auto;
}
</style>
