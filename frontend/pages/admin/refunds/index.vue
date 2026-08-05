<template>
  <div class="admin-refunds">
    <div class="admin-toolbar">
      <p class="admin-toolbar__meta">
        {{
          initialLoading
            ? 'Loading…'
            : `${refunds.length} refund${refunds.length === 1 ? '' : 's'}`
        }}
      </p>
      <button type="button" class="btn btn--primary" @click="openCreate">
        New Refund Entry
      </button>
    </div>

    <div v-if="loadError" class="admin-panel admin-panel--error" role="alert">
      {{ loadError }}
    </div>

    <UiTable
      v-else
      :columns="columns"
      :rows="refunds"
      :loading="initialLoading"
      loading-text="Loading refunds…"
      empty-text="No refunds yet."
    >
      <template #cell-orderId="{ row }">
        <span class="admin-refunds__id" :title="orderRefId(row)">
          {{ shortId(orderRefId(row)) }}
        </span>
      </template>

      <template #cell-customerName="{ row }">
        <span class="ui-table__name" :title="row.customerName">{{ row.customerName }}</span>
      </template>

      <template #cell-reason="{ row }">
        <span class="admin-refunds__reason" :title="row.reason">{{ row.reason }}</span>
      </template>

      <template #cell-status="{ row }">
        <span class="admin-refunds__badge" :data-status="row.status">
          {{ row.status }}
        </span>
      </template>

      <template #cell-manage="{ row }">
        <div class="admin-refunds__manage" @click.stop>
          <UiSelect
            class="admin-refunds__select"
            :model-value="row.status"
            :options="statusOptions"
            :disabled="updatingId === row._id"
            @update:model-value="(value) => updateRefund(row, { status: value })"
          />
          <UiInput
            class="admin-refunds__notes"
            :model-value="row.adminNotes || ''"
            placeholder="Notes"
            :disabled="updatingId === row._id"
            @update:model-value="(value) => (row.adminNotes = value)"
            @blur="saveNotes(row)"
            @keydown.enter.prevent="saveNotes(row)"
          />
        </div>
      </template>
    </UiTable>

    <UiModal
      v-model="formOpen"
      title="New refund entry"
      :persist="saving"
    >
      <form id="admin-refund-form" class="admin-refund-form" novalidate @submit.prevent="createRefund">
        <UiField
          label="Order"
          required
          hint="Search by order ID or customer email"
          :disabled="saving"
          :error="formErrors.order"
        >
          <div class="admin-order-search">
            <UiInput
              v-model="orderQuery"
              placeholder="Type order ID or email…"
              :disabled="saving || ordersLoading"
              autocomplete="off"
              @focus="showOrderResults = true"
            />
            <div v-if="selectedOrder" class="admin-order-search__selected">
              <span>
                #{{ shortId(selectedOrder._id) }} · {{ selectedOrder.customerName }} ·
                ${{ Number(selectedOrder.totalAmount).toFixed(2) }}
              </span>
              <button type="button" class="admin-order-search__clear" :disabled="saving" @click="clearOrder">
                Clear
              </button>
            </div>
            <ul
              v-else-if="showOrderResults && orderQuery.trim()"
              class="admin-order-search__list"
            >
              <li v-if="ordersLoading" class="admin-order-search__empty">Loading orders…</li>
              <li v-else-if="filteredOrders.length === 0" class="admin-order-search__empty">
                No matching orders
              </li>
              <li v-for="order in filteredOrders" :key="order._id">
                <button type="button" @click="selectOrder(order)">
                  <strong>#{{ shortId(order._id) }}</strong>
                  <span>{{ order.customerName }} · {{ order.email }}</span>
                  <span>${{ Number(order.totalAmount).toFixed(2) }}</span>
                </button>
              </li>
            </ul>
          </div>
        </UiField>

        <UiField label="Reason" required :disabled="saving" :error="formErrors.reason">
          <UiTextarea v-model="form.reason" :rows="3" required :disabled="saving" />
        </UiField>

        <UiField label="Amount" required :disabled="saving" :error="formErrors.amount">
          <UiInput
            v-model="form.amount"
            type="number"
            min="0"
            step="0.01"
            required
            :disabled="saving"
          />
        </UiField>
      </form>

      <template #footer>
        <button type="button" class="btn btn--ghost" :disabled="saving" @click="closeCreate">
          Cancel
        </button>
        <button type="submit" form="admin-refund-form" class="btn btn--primary" :disabled="saving">
          {{ saving ? 'Creating…' : 'Create refund' }}
        </button>
      </template>
    </UiModal>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
  title: 'Refunds',
  pageTransition: false,
})

useHead({ title: 'Refunds — Admin' })

const { api } = useAdminApi()
const { $toast } = useNuxtApp()

const refunds = ref([])
const orders = ref([])
const initialLoading = ref(true)
const ordersLoading = ref(false)
const loadError = ref('')
const updatingId = ref(null)

const formOpen = ref(false)
const saving = ref(false)
const orderQuery = ref('')
const showOrderResults = ref(false)
const selectedOrder = ref(null)
const notesDraft = ref({})

const form = reactive({
  reason: '',
  amount: '',
})

const formErrors = reactive({
  order: '',
  reason: '',
  amount: '',
})

const statusOptions = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Rejected', label: 'Rejected' },
]

const columns = [
  { key: 'orderId', label: 'Order ID', width: '100px' },
  { key: 'customerName', label: 'Customer', width: '150px' },
  {
    key: 'amount',
    label: 'Amount',
    width: '100px',
    format: (value) => `$${Number(value).toFixed(2)}`,
  },
  { key: 'reason', label: 'Reason' },
  { key: 'status', label: 'Status', width: '110px' },
  {
    key: 'requestedAt',
    label: 'Requested',
    width: '120px',
    format: (value) => formatDate(value),
  },
  { key: 'manage', label: 'Update', width: '220px' },
]

const filteredOrders = computed(() => {
  const q = orderQuery.value.trim().toLowerCase()
  if (!q) return []

  return orders.value
    .filter((order) => {
      const id = String(order._id || '').toLowerCase()
      const email = String(order.email || '').toLowerCase()
      const name = String(order.customerName || '').toLowerCase()
      return id.includes(q) || email.includes(q) || name.includes(q)
    })
    .slice(0, 8)
})

function shortId(id) {
  const value = String(id || '')
  return value ? value.slice(-8).toUpperCase() : '—'
}

function orderRefId(row) {
  if (!row?.orderId) return ''
  return typeof row.orderId === 'object' ? row.orderId._id : row.orderId
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

async function fetchRefunds({ silent = false } = {}) {
  if (!silent) initialLoading.value = true
  loadError.value = ''

  try {
    const response = await api('/api/refunds')
    refunds.value = response?.data || []
    notesDraft.value = Object.fromEntries(
      (refunds.value || []).map((item) => [item._id, item.adminNotes || ''])
    )
  } catch (error) {
    loadError.value = error?.data?.message || error?.message || 'Could not load refunds'
    if (!silent) refunds.value = []
  } finally {
    initialLoading.value = false
  }
}

async function ensureOrdersLoaded() {
  if (orders.value.length || ordersLoading.value) return
  ordersLoading.value = true
  try {
    const response = await api('/api/orders')
    orders.value = response?.data || []
  } catch (error) {
    $toast?.error(error?.data?.message || error?.message || 'Could not load orders')
  } finally {
    ordersLoading.value = false
  }
}

function openCreate() {
  form.reason = ''
  form.amount = ''
  formErrors.order = ''
  formErrors.reason = ''
  formErrors.amount = ''
  orderQuery.value = ''
  selectedOrder.value = null
  showOrderResults.value = true
  formOpen.value = true
  ensureOrdersLoaded()
}

function closeCreate() {
  if (saving.value) return
  formOpen.value = false
}

function selectOrder(order) {
  selectedOrder.value = order
  orderQuery.value = `${shortId(order._id)} · ${order.email}`
  form.amount = Number(order.totalAmount)
  showOrderResults.value = false
  formErrors.order = ''
}

function clearOrder() {
  selectedOrder.value = null
  orderQuery.value = ''
  form.amount = ''
  showOrderResults.value = true
}

async function createRefund() {
  formErrors.order = selectedOrder.value ? '' : 'Select an order'
  formErrors.reason = String(form.reason).trim() ? '' : 'Reason is required'
  formErrors.amount =
    form.amount === '' || Number(form.amount) < 0 || Number.isNaN(Number(form.amount))
      ? 'Enter a valid amount'
      : ''

  if (Object.values(formErrors).some(Boolean)) return

  saving.value = true

  try {
    await api('/api/refunds', {
      method: 'POST',
      body: {
        orderId: selectedOrder.value._id,
        customerName: selectedOrder.value.customerName,
        email: selectedOrder.value.email,
        reason: String(form.reason).trim(),
        amount: Number(form.amount),
      },
    })

    $toast?.success('Refund created')
    formOpen.value = false
    await fetchRefunds({ silent: true })
  } catch (error) {
    $toast?.error(error?.data?.message || error?.message || 'Could not create refund')
  } finally {
    saving.value = false
  }
}

async function updateRefund(row, patch) {
  if (!row?._id) return

  const previous = {
    status: row.status,
    adminNotes: row.adminNotes,
  }

  if (patch.status !== undefined) row.status = patch.status
  if (patch.adminNotes !== undefined) row.adminNotes = patch.adminNotes

  updatingId.value = row._id

  try {
    const response = await api(`/api/refunds/${row._id}`, {
      method: 'PUT',
      body: {
        status: row.status,
        adminNotes: row.adminNotes || '',
      },
    })

    if (response?.data) {
      Object.assign(row, response.data)
      notesDraft.value[row._id] = row.adminNotes || ''
    }

    $toast?.success('Refund updated')
  } catch (error) {
    row.status = previous.status
    row.adminNotes = previous.adminNotes
    $toast?.error(error?.data?.message || error?.message || 'Could not update refund')
  } finally {
    updatingId.value = null
  }
}

async function saveNotes(row) {
  const current = row.adminNotes || ''
  const previous = notesDraft.value[row._id] ?? ''
  if (current === previous) return
  await updateRefund(row, { adminNotes: current })
}

await fetchRefunds()
</script>

<style scoped lang="scss">
.admin-refunds__id {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.admin-refunds__reason {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  line-height: 1.4;
}

.admin-refunds__badge {
  display: inline-flex;
  align-items: center;
  padding: 0.22rem 0.55rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  border: 1px solid transparent;

  &[data-status='Pending'] {
    background: #fff7e8;
    color: #9a6700;
    border-color: #f0d7a0;
  }

  &[data-status='Approved'] {
    background: #e8f1ff;
    color: #1d4f91;
    border-color: #b7cff5;
  }

  &[data-status='Completed'] {
    background: #e5f0e9;
    color: var(--color-brand-dark);
    border-color: #b7d4c4;
  }

  &[data-status='Rejected'] {
    background: var(--color-danger-bg);
    color: var(--color-danger);
    border-color: var(--color-danger-border);
  }
}

.admin-refunds__manage {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.admin-refunds__select,
.admin-refunds__notes {
  width: 100%;
  padding: 0.4rem 0.65rem;
  font-size: 0.85rem;
}

.admin-refunds__select {
  padding-right: 1.75rem;
}

.admin-refund-form {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.admin-order-search {
  position: relative;
}

.admin-order-search__selected {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 0.5rem;
  padding: 0.65rem 0.75rem;
  background: var(--color-bg-accent);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  font-size: 0.9rem;
}

.admin-order-search__clear {
  border: none;
  background: none;
  color: var(--color-brand);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.admin-order-search__list {
  position: absolute;
  z-index: 5;
  left: 0;
  right: 0;
  top: calc(100% + 4px);
  margin: 0;
  padding: 0.35rem;
  list-style: none;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  box-shadow: var(--shadow-soft);
  max-height: 240px;
  overflow: auto;
}

.admin-order-search__empty {
  padding: 0.7rem 0.75rem;
  color: var(--color-muted);
  font-size: 0.9rem;
}

.admin-order-search__list button {
  width: 100%;
  display: grid;
  gap: 0.15rem;
  text-align: left;
  border: none;
  background: transparent;
  padding: 0.65rem 0.7rem;
  border-radius: 8px;
  cursor: pointer;
  font: inherit;
  color: var(--color-ink);

  &:hover,
  &:focus-visible {
    background: var(--color-bg-accent);
  }

  span {
    color: var(--color-muted);
    font-size: 0.85rem;
  }
}
</style>
