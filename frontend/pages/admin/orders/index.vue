<template>
  <div class="admin-orders">
    <div class="admin-toolbar">
      <p class="admin-toolbar__meta">
        {{
          initialLoading
            ? 'Loading…'
            : `${filteredOrders.length} order${filteredOrders.length === 1 ? '' : 's'}${
                statusFilter !== 'all' ? ` · ${labelFilter(statusFilter)}` : ''
              }`
        }}
      </p>
      <div class="admin-orders__toolbar-right">
        <label class="admin-orders__filter">
          <span class="admin-orders__filter-label">Status</span>
          <UiSelect
            v-model="statusFilter"
            class="admin-orders__filter-select"
            :options="filterOptions"
          />
        </label>
        <p class="admin-toolbar__hint">Click a row to view items & shipping details</p>
      </div>
    </div>

    <div v-if="loadError" class="admin-panel admin-panel--error" role="alert">
      {{ loadError }}
    </div>

    <UiTable
      v-else
      expandable
      :columns="columns"
      :rows="filteredOrders"
      :loading="initialLoading"
      :row-class="orderRowClass"
      loading-text="Loading orders…"
      :empty-text="
        statusFilter === 'all' ? 'No orders yet.' : `No ${labelFilter(statusFilter).toLowerCase()} orders.`
      "
    >
      <template #cell-id="{ row }">
        <span class="admin-orders__id" :title="row._id">{{ shortId(row._id) }}</span>
      </template>

      <template #cell-customerName="{ row }">
        <span class="ui-table__name" :title="row.customerName">{{ row.customerName }}</span>
      </template>

      <template #cell-email="{ row }">
        <span class="admin-orders__email" :title="row.email">{{ row.email }}</span>
      </template>

      <template #cell-orderStatus="{ row }">
        <div class="admin-orders__status-cell">
          <UiSelect
            class="admin-orders__select"
            :model-value="row.orderStatus || 'pending'"
            :options="orderStatusOptions"
            :disabled="updatingId === row._id"
            @update:model-value="(value) => updateStatus(row, 'orderStatus', value)"
          />
          <span
            v-if="isCustomerCancelled(row)"
            class="admin-orders__customer-cancel-badge"
            title="This order was cancelled by the customer"
          >
            ⚠️ Cancelled by Customer
          </span>
        </div>
      </template>

      <template #cell-paymentStatus="{ row }">
        <UiSelect
          class="admin-orders__select"
          :model-value="row.paymentStatus || 'pending'"
          :options="paymentStatusOptions"
          :disabled="updatingId === row._id"
          @update:model-value="(value) => updateStatus(row, 'paymentStatus', value)"
        />
      </template>

      <template #expand="{ row }">
        <div class="admin-order-detail">
          <div class="admin-order-detail__block">
            <h3>Shipping address</h3>
            <p>{{ row.shippingAddress || '—' }}</p>
          </div>

          <div class="admin-order-detail__block">
            <h3>Items</h3>
            <ul v-if="row.items?.length" class="admin-order-detail__items">
              <li v-for="(item, i) in row.items" :key="`${row._id}-${i}`">
                <span class="admin-order-detail__item-name">{{ item.name }}</span>
                <span class="admin-order-detail__item-meta">
                  ×{{ item.quantity }} · ${{ Number(item.price).toFixed(2) }}
                  <span class="admin-order-detail__item-total">
                    = ${{ (Number(item.price) * Number(item.quantity)).toFixed(2) }}
                  </span>
                </span>
              </li>
            </ul>
            <p v-else>—</p>
          </div>
        </div>
      </template>
    </UiTable>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
  title: 'Orders',
  pageTransition: false,
})

useHead({ title: 'Orders — Admin' })

const { api } = useAdminApi()
const { $toast } = useNuxtApp()

const orders = ref([])
const initialLoading = ref(true)
const loadError = ref('')
const updatingId = ref(null)
const statusFilter = ref('all')

const filterOptions = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

const orderStatusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

const paymentStatusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'refunded', label: 'Refunded' },
]

const columns = [
  { key: 'id', label: 'Order ID', width: '100px' },
  { key: 'customerName', label: 'Customer' },
  { key: 'email', label: 'Email' },
  {
    key: 'totalAmount',
    label: 'Total',
    width: '100px',
    format: (value) => `$${Number(value).toFixed(2)}`,
  },
  { key: 'orderStatus', label: 'Order status', width: '210px' },
  { key: 'paymentStatus', label: 'Payment', width: '130px' },
  {
    key: 'createdAt',
    label: 'Date',
    width: '120px',
    format: (value) => formatDate(value),
  },
]

const filteredOrders = computed(() => {
  if (statusFilter.value === 'all') return orders.value
  return orders.value.filter((order) => (order.orderStatus || 'pending') === statusFilter.value)
})

function isCustomerCancelled(order) {
  return order?.orderStatus === 'cancelled' && order?.cancelledBy === 'customer'
}

function orderRowClass(row) {
  return isCustomerCancelled(row) ? 'admin-orders__row--customer-cancel' : ''
}

function labelFilter(value) {
  return filterOptions.find((option) => option.value === value)?.label || value
}

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

async function fetchOrders({ silent = false } = {}) {
  if (!silent) initialLoading.value = true
  loadError.value = ''

  try {
    const response = await api('/api/orders')
    orders.value = response?.data || []
  } catch (error) {
    loadError.value = error?.data?.message || error?.message || 'Could not load orders'
    if (!silent) orders.value = []
  } finally {
    initialLoading.value = false
  }
}

async function updateStatus(order, field, value) {
  if (!order?._id || order[field] === value) return

  const previous = order[field]
  const previousCancelledBy = order.cancelledBy
  order[field] = value
  updatingId.value = order._id

  try {
    const response = await api(`/api/orders/${order._id}`, {
      method: 'PUT',
      body: { [field]: value },
    })

    if (response?.data) {
      Object.assign(order, response.data)
    }

    $toast?.success(
      field === 'orderStatus' ? 'Order status updated' : 'Payment status updated'
    )
  } catch (error) {
    order[field] = previous
    order.cancelledBy = previousCancelledBy
    $toast?.error(error?.data?.message || error?.message || 'Could not update order')
  } finally {
    updatingId.value = null
  }
}

await fetchOrders()
</script>

<style scoped lang="scss">
.admin-toolbar__hint {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.88rem;
}

.admin-orders__toolbar-right {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1rem;
}

.admin-orders__filter {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.admin-orders__filter-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.admin-orders__filter-select {
  min-width: 9.5rem;
  padding: 0.45rem 1.75rem 0.45rem 0.65rem;
  font-size: 0.88rem;
}

.admin-orders__id {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.admin-orders__email {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-muted);
}

.admin-orders__status-cell {
  display: grid;
  gap: 0.4rem;
}

.admin-orders__select {
  min-width: 0;
  width: 100%;
  padding: 0.45rem 1.75rem 0.45rem 0.6rem;
  font-size: 0.85rem;
}

.admin-orders__customer-cancel-badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  max-width: 100%;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  line-height: 1.3;
  color: #9a3412;
  background: #ffedd5;
  border: 1px solid #fdba74;
}

:deep(.admin-orders__row--customer-cancel) {
  background: #fff7ed;

  td {
    background: #fff7ed;
  }

  &.is-expanded td,
  &:hover td {
    background: #ffedd5;
  }
}

:deep(tr.admin-orders__row--customer-cancel + .ui-table__expand-row) td {
  background: #fff7ed;
}

.admin-order-detail {
  display: grid;
  gap: 1rem;

  @media (min-width: $bp-md) {
    grid-template-columns: 1fr 1.4fr;
  }
}

.admin-order-detail__block {
  h3 {
    margin: 0 0 0.45rem;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--color-muted);
  }

  p {
    margin: 0;
    color: var(--color-ink);
    line-height: 1.5;
    white-space: pre-wrap;
  }
}

.admin-order-detail__items {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.admin-order-detail__items li {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.35rem 1rem;
  padding: 0.55rem 0.7rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 10px;
}

.admin-order-detail__item-name {
  font-weight: 700;
}

.admin-order-detail__item-meta {
  color: var(--color-muted);
  font-size: 0.9rem;
}

.admin-order-detail__item-total {
  color: var(--color-ink);
  font-weight: 700;
}
</style>
