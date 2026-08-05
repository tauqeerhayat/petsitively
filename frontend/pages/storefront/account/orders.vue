<template>
  <div class="container content-page account-orders">
    <section class="page-hero account-orders__hero">
      <div>
        <p class="content-page__eyebrow">Account</p>
        <h1>Your orders</h1>
        <p>Order history for your Petsitively account.</p>
      </div>
    </section>

    <div v-if="pending" class="content-card account-orders__state">
      <div class="ui-loading">
        <UiSpinner size="lg" />
        <p class="ui-loading__text">Loading your orders…</p>
      </div>
    </div>

    <div v-else-if="loadError" class="content-card account-orders__state account-orders__state--error">
      {{ loadError }}
    </div>

    <div v-else-if="orders.length === 0" class="content-card account-orders__state">
      <p>No orders yet.</p>
      <NuxtLink to="/" class="btn btn--primary">Shop products</NuxtLink>
    </div>

    <ul v-else class="account-orders__list">
      <li v-for="order in orders" :key="order._id" class="content-card account-order">
        <div class="account-order__header">
          <div>
            <p class="account-order__id">Order #{{ shortId(order._id) }}</p>
            <p class="account-order__date">{{ formatDate(order.createdAt) }}</p>
          </div>
          <div class="account-order__meta">
            <span class="account-order__badge" :data-status="order.orderStatus">
              {{ labelStatus(order.orderStatus) }}
            </span>
            <span class="account-order__total">${{ Number(order.totalAmount).toFixed(2) }}</span>
          </div>
        </div>

        <ul class="account-order__items">
          <li v-for="(item, index) in order.items" :key="`${order._id}-${index}`">
            <span>{{ item.name }} × {{ item.quantity }}</span>
            <span>${{ (Number(item.price) * Number(item.quantity)).toFixed(2) }}</span>
          </li>
        </ul>

        <p class="account-order__ship">
          <strong>Ship to:</strong> {{ order.shippingAddress }}
        </p>

        <div class="account-order__actions">
          <button
            v-if="order.orderStatus === 'pending'"
            type="button"
            class="btn btn--ghost btn--sm btn--danger"
            :disabled="cancellingId === order._id"
            @click="openCancel(order)"
          >
            <UiSpinner v-if="cancellingId === order._id" size="sm" />
            <span>{{ cancellingId === order._id ? 'Cancelling…' : 'Cancel Order' }}</span>
          </button>
          <p
            v-else-if="order.orderStatus !== 'cancelled'"
            class="account-order__note"
          >
            Already processing —
            <NuxtLink to="/contact">contact us</NuxtLink>
            to request a refund
          </p>
        </div>
      </li>
    </ul>

    <UiModal v-model="cancelOpen" title="Cancel order">
      <p>Are you sure you want to cancel this order?</p>
      <template #footer>
        <button type="button" class="btn btn--ghost" :disabled="!!cancellingId" @click="cancelOpen = false">
          Keep order
        </button>
        <button
          type="button"
          class="btn btn--primary"
          :disabled="!!cancellingId"
          @click="confirmCancel"
        >
          <UiSpinner v-if="cancellingId" size="sm" light />
          <span>{{ cancellingId ? 'Cancelling…' : 'Yes, cancel' }}</span>
        </button>
      </template>
    </UiModal>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'customer-auth',
})

usePageSeo({
  title: 'Your orders — Petsitively',
  description: 'View and manage your Petsitively order history.',
  path: '/account/orders',
  robots: 'noindex, nofollow',
})

const { api } = useCustomerApi()
const { $toast } = useNuxtApp()

const orders = ref([])
const pending = ref(true)
const loadError = ref('')
const cancelOpen = ref(false)
const orderToCancel = ref(null)
const cancellingId = ref(null)

function shortId(id) {
  const value = String(id || '')
  return value ? value.slice(-8).toUpperCase() : '—'
}

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

function labelStatus(status) {
  if (!status) return 'Pending'
  return String(status).charAt(0).toUpperCase() + String(status).slice(1)
}

function openCancel(order) {
  orderToCancel.value = order
  cancelOpen.value = true
}

async function confirmCancel() {
  const target = orderToCancel.value
  if (!target?._id) return

  cancellingId.value = target._id

  try {
    const response = await api(`/api/orders/${target._id}/cancel`, {
      method: 'PUT',
    })

    const updated = response?.data?.order
    const index = orders.value.findIndex((item) => item._id === target._id)
    if (index !== -1) {
      orders.value[index] = {
        ...orders.value[index],
        ...(updated || {}),
        orderStatus: updated?.orderStatus || 'cancelled',
      }
    }

    cancelOpen.value = false
    orderToCancel.value = null
    $toast?.success('Order cancelled')
  } catch (error) {
    $toast?.error(
      error?.data?.message || error?.message || 'Could not cancel this order'
    )
  } finally {
    cancellingId.value = null
  }
}

async function fetchOrders() {
  pending.value = true
  loadError.value = ''

  try {
    const response = await api('/api/customers/orders')
    orders.value = response?.data || []
  } catch (error) {
    loadError.value =
      error?.data?.message || error?.message || 'Could not load your orders'
    orders.value = []
  } finally {
    pending.value = false
  }
}

await fetchOrders()
</script>

<style scoped lang="scss">
.account-orders__hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.account-orders__state {
  display: grid;
  gap: 1rem;
  justify-items: start;

  &--error {
    color: var(--color-danger);
    border-color: var(--color-danger-border);
    background: var(--color-danger-bg);
  }
}

.account-orders__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 1rem;
}

.account-order__header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 0.85rem;
}

.account-order__id {
  margin: 0;
  font-weight: 700;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.account-order__date {
  margin: 0.2rem 0 0;
  color: var(--color-muted);
  font-size: 0.9rem;
}

.account-order__meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.account-order__total {
  font-weight: 700;
  color: var(--color-brand);
  font-size: 1.1rem;
}

.account-order__badge {
  display: inline-flex;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  background: var(--color-bg-accent);
  color: var(--color-brand-dark);
  border: 1px solid var(--color-border);

  &[data-status='cancelled'] {
    color: var(--color-danger);
    background: var(--color-danger-bg);
    border-color: var(--color-danger-border);
  }
}

.account-order__items {
  list-style: none;
  margin: 0 0 0.85rem;
  padding: 0;
  display: grid;
  gap: 0.4rem;

  li {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    color: var(--color-muted);
    font-size: 0.95rem;
  }
}

.account-order__ship {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.92rem;
  line-height: 1.5;
}

.account-order__actions {
  margin-top: 0.9rem;
  padding-top: 0.85rem;
  border-top: 1px solid var(--color-border);
}

.account-order__note {
  margin: 0;
  font-size: 0.88rem;
  color: var(--color-muted);
  line-height: 1.45;

  a {
    color: var(--color-brand);
    font-weight: 700;
    text-decoration: none;

    &:hover,
    &:focus-visible {
      text-decoration: underline;
    }
  }
}
</style>
