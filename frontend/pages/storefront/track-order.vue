<template>
  <div class="container content-page track-order">
    <section class="page-hero">
      <p class="content-page__eyebrow">Orders</p>
      <h1>Track your order</h1>
      <p>Enter the email used at checkout and your order ID to see live status.</p>
    </section>

    <form class="content-card track-order__form" novalidate @submit.prevent="onSubmit">
      <UiField
        label="Email"
        required
        :error="errors.email"
        :disabled="emailLocked"
        :hint="emailLocked ? 'Using your signed-in account email' : ''"
      >
        <UiInput
          v-model="form.email"
          type="email"
          name="email"
          autocomplete="email"
          required
          :disabled="emailLocked || submitting"
          :readonly="emailLocked"
        />
      </UiField>

      <UiField label="Order ID" required :error="errors.orderId" hint="Full ID or the short code from your confirmation">
        <UiInput
          v-model="form.orderId"
          type="text"
          name="orderId"
          autocomplete="off"
          required
          :disabled="submitting"
        />
      </UiField>

      <p v-if="submitError" class="ui-field__error" role="alert">{{ submitError }}</p>

      <button class="btn btn--primary" type="submit" :disabled="submitting">
        <UiSpinner v-if="submitting" size="sm" light />
        <span>{{ submitting ? 'Looking up…' : 'Track order' }}</span>
      </button>
    </form>

    <section v-if="order" class="track-order__result" aria-live="polite">
      <div class="content-card track-order__status-card">
        <div class="track-order__meta">
          <div>
            <p class="track-order__id">Order #{{ shortId }}</p>
            <p class="track-order__date">Placed {{ formatDate(order.createdAt) }}</p>
          </div>
          <span
            v-if="order.orderStatus === 'cancelled'"
            class="track-order__cancelled"
          >
            Cancelled
          </span>
        </div>

        <ol
          v-if="order.orderStatus !== 'cancelled'"
          class="track-stepper"
          :aria-label="`Order status: ${currentStepLabel}`"
        >
          <li
            v-for="(step, index) in steps"
            :key="step.key"
            class="track-stepper__step"
            :class="{
              'is-complete':
                index < currentStepIndex ||
                (index === currentStepIndex && step.key === 'delivered'),
              'is-current': index === currentStepIndex,
              'is-upcoming': index > currentStepIndex,
            }"
          >
            <div class="track-stepper__marker" aria-hidden="true">
              <svg
                v-if="
                  index < currentStepIndex ||
                  (index === currentStepIndex && step.key === 'delivered')
                "
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
              >
                <path
                  d="M5 12.5 9.5 17 19 7.5"
                  stroke="currentColor"
                  stroke-width="2.4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span v-else class="track-stepper__dot" />
            </div>
            <p class="track-stepper__label">{{ step.label }}</p>
            <div
              v-if="index < steps.length - 1"
              class="track-stepper__line"
              :class="{ 'is-filled': index < currentStepIndex }"
              aria-hidden="true"
            />
          </li>
        </ol>

        <p v-else class="track-order__cancelled-note">
          This order was cancelled. Contact support if you need help.
        </p>

        <div class="track-order__cancel-row">
          <button
            v-if="order.orderStatus === 'pending'"
            type="button"
            class="btn btn--ghost btn--sm btn--danger"
            :disabled="cancelling"
            @click="cancelOpen = true"
          >
            <UiSpinner v-if="cancelling" size="sm" />
            <span>{{ cancelling ? 'Cancelling…' : 'Cancel Order' }}</span>
          </button>
          <p
            v-else-if="order.orderStatus !== 'cancelled'"
            class="track-order__processing-note"
          >
            Already processing —
            <NuxtLink to="/contact">contact us</NuxtLink>
            to request a refund
          </p>
        </div>
      </div>

      <div class="content-card track-order__summary">
        <div class="track-order__summary-head">
          <h2>Order details</h2>
          <p v-if="order.shippingAddress">
            <strong>Ship to:</strong> {{ order.shippingAddress }}
          </p>
        </div>

        <ul class="track-order__items">
          <li v-for="(item, index) in order.items" :key="`${order._id}-${index}`">
            <span>{{ item.name }} × {{ item.quantity }}</span>
            <strong>${{ (Number(item.price) * Number(item.quantity)).toFixed(2) }}</strong>
          </li>
        </ul>

        <div class="track-order__total">
          <span>Total</span>
          <strong>${{ Number(order.totalAmount).toFixed(2) }}</strong>
        </div>
      </div>
    </section>

    <UiModal v-model="cancelOpen" title="Cancel order">
      <p>Are you sure you want to cancel this order?</p>
      <template #footer>
        <button type="button" class="btn btn--ghost" :disabled="cancelling" @click="cancelOpen = false">
          Keep order
        </button>
        <button
          type="button"
          class="btn btn--primary"
          :disabled="cancelling"
          @click="confirmCancel"
        >
          <UiSpinner v-if="cancelling" size="sm" light />
          <span>{{ cancelling ? 'Cancelling…' : 'Yes, cancel' }}</span>
        </button>
      </template>
    </UiModal>
  </div>
</template>

<script setup>
usePageSeo({
  title: 'Track order — Petsitively',
  description: 'Track your Petsitively order status with your order ID and email.',
  path: '/track-order',
})

const config = useRuntimeConfig()
const { api, token, profile } = useCustomerApi()

const steps = [
  { key: 'pending', label: 'Order Placed' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
]

const isLoggedIn = computed(() => Boolean(token.value))
const emailLocked = computed(() => isLoggedIn.value && Boolean(profile.value?.email))

const form = reactive({
  email: '',
  orderId: '',
})

const errors = reactive({
  email: '',
  orderId: '',
})

const submitting = ref(false)
const submitError = ref('')
const order = ref(null)
const cancelOpen = ref(false)
const cancelling = ref(false)
const { $toast } = useNuxtApp()

watch(
  [isLoggedIn, () => profile.value?.email],
  () => {
    if (emailLocked.value) {
      form.email = profile.value.email
    }
  },
  { immediate: true }
)

const shortId = computed(() => {
  const id = String(order.value?._id || '')
  return id ? id.slice(-8).toUpperCase() : '—'
})

const currentStepIndex = computed(() => {
  const status = order.value?.orderStatus || 'pending'
  const index = steps.findIndex((step) => step.key === status)
  return index >= 0 ? index : 0
})

const currentStepLabel = computed(() => steps[currentStepIndex.value]?.label || 'Order Placed')

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

async function confirmCancel() {
  if (!order.value?._id) return

  cancelling.value = true

  try {
    const body = { email: form.email.trim().toLowerCase() || order.value.email }
    const response = isLoggedIn.value
      ? await api(`/api/orders/${order.value._id}/cancel`, { method: 'PUT', body })
      : await $fetch(`${config.public.apiBase}/api/orders/${order.value._id}/cancel`, {
          method: 'PUT',
          body,
        })

    const updated = response?.data?.order
    order.value = {
      ...order.value,
      ...(updated || {}),
      orderStatus: updated?.orderStatus || 'cancelled',
    }

    cancelOpen.value = false
    $toast?.success('Order cancelled')
  } catch (error) {
    $toast?.error(
      error?.data?.message || error?.message || 'Could not cancel this order'
    )
  } finally {
    cancelling.value = false
  }
}

async function onSubmit() {
  submitError.value = ''
  errors.orderId = ''
  order.value = null

  const email = form.email.trim().toLowerCase()
  const orderId = form.orderId.trim().replace(/^#/, '')

  errors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'Enter a valid email'
  errors.orderId = orderId ? '' : 'Order ID is required'

  if (errors.email || errors.orderId) return

  submitting.value = true

  try {
    // Use authenticated client when logged in so short codes also match by customerId
    const response = isLoggedIn.value
      ? await api('/api/orders/track', { query: { email, orderId } })
      : await $fetch(`${config.public.apiBase}/api/orders/track`, {
          query: { email, orderId },
        })
    order.value = response?.data || null
  } catch (error) {
    submitError.value =
      error?.data?.message ||
      error?.message ||
      'Could not find that order. Check your details and try again.'
  } finally {
    submitting.value = false
  }
}
</script>
