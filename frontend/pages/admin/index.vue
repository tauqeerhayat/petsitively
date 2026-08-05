<template>
  <div class="admin-dashboard">
    <div class="admin-dashboard__filters admin-panel">
      <div class="admin-dashboard__presets" role="group" aria-label="Date range">
        <button
          v-for="preset in presets"
          :key="preset.key"
          type="button"
          class="admin-dashboard__preset"
          :class="{ 'is-active': activePreset === preset.key }"
          @click="applyPreset(preset.key)"
        >
          {{ preset.label }}
        </button>
      </div>

      <div v-if="activePreset === 'custom'" class="admin-dashboard__custom">
        <label class="admin-dashboard__date-field">
          <span>From</span>
          <input v-model="customStart" type="date" :max="customEnd || undefined" />
        </label>
        <label class="admin-dashboard__date-field">
          <span>To</span>
          <input v-model="customEnd" type="date" :min="customStart || undefined" :max="todayKey" />
        </label>
        <button
          type="button"
          class="btn btn--primary btn--sm"
          :disabled="!customStart || !customEnd || loading"
          @click="applyCustomRange"
        >
          Apply
        </button>
      </div>
    </div>

    <div v-if="loadError" class="admin-panel admin-panel--error" role="alert">
      {{ loadError }}
    </div>

    <div v-else-if="loading && !stats" class="admin-panel">
      <div class="ui-loading">
        <UiSpinner size="lg" />
        <p class="ui-loading__text">Loading dashboard…</p>
      </div>
    </div>

    <template v-else-if="stats">
      <div class="admin-dashboard__cards" :class="{ 'is-refreshing': loading }">
        <article class="admin-stat-card">
          <p class="admin-stat-card__label">Total Orders</p>
          <p class="admin-stat-card__value">{{ stats.totalOrders }}</p>
        </article>

        <article class="admin-stat-card">
          <p class="admin-stat-card__label">Total Revenue</p>
          <p class="admin-stat-card__value">{{ formatMoney(stats.totalRevenue) }}</p>
        </article>

        <article class="admin-stat-card">
          <p class="admin-stat-card__label">Total Profit</p>
          <p class="admin-stat-card__value">{{ formatMoney(stats.totalProfit) }}</p>
        </article>

        <article class="admin-stat-card">
          <p class="admin-stat-card__label">Profit Margin %</p>
          <p class="admin-stat-card__value">{{ formatPercent(stats.profitMarginPercent) }}</p>
        </article>

        <article class="admin-stat-card">
          <p class="admin-stat-card__label">Average Order Value</p>
          <p class="admin-stat-card__value">{{ formatMoney(stats.averageOrderValue) }}</p>
        </article>

        <NuxtLink to="/admin/refunds" class="admin-stat-card admin-stat-card--link">
          <p class="admin-stat-card__label">Pending Refunds</p>
          <p class="admin-stat-card__value">{{ stats.pendingRefundsCount }}</p>
        </NuxtLink>

        <NuxtLink to="/admin/messages" class="admin-stat-card admin-stat-card--link admin-stat-card--messages">
          <p class="admin-stat-card__label">Messages</p>
          <p class="admin-stat-card__value">Inbox</p>
          <span
            v-if="stats.unreadMessagesCount > 0"
            class="admin-stat-card__badge"
          >
            {{ stats.unreadMessagesCount }} unread
          </span>
        </NuxtLink>
      </div>

      <div class="admin-dashboard__charts">
        <section class="admin-panel admin-dashboard__chart">
          <div class="admin-dashboard__chart-head">
            <h2>Revenue by day</h2>
            <p>{{ rangeLabel }}</p>
          </div>
          <ClientOnly>
            <apexchart
              type="area"
              height="320"
              :options="revenueChartOptions"
              :series="revenueSeries"
            />
            <template #fallback>
              <div class="ui-loading">
                <UiSpinner size="md" />
              </div>
            </template>
          </ClientOnly>
        </section>

        <section class="admin-panel admin-dashboard__chart">
          <div class="admin-dashboard__chart-head">
            <h2>Orders by status</h2>
            <p>{{ totalStatusOrders }} orders</p>
          </div>
          <ClientOnly>
            <apexchart
              type="donut"
              height="320"
              :options="statusChartOptions"
              :series="statusSeries"
            />
            <template #fallback>
              <div class="ui-loading">
                <UiSpinner size="md" />
              </div>
            </template>
          </ClientOnly>
        </section>
      </div>

      <section class="admin-panel admin-dashboard__top-products">
        <div class="admin-dashboard__chart-head">
          <h2>Top 5 products</h2>
          <p>By units sold in selected range</p>
        </div>

        <UiTable
          :columns="productColumns"
          :rows="stats.topProducts || []"
          empty-text="No product sales in this range."
          row-key-name="productId"
        />
      </section>
    </template>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
  title: 'Dashboard',
  pageTransition: false,
})

useHead({ title: 'Dashboard — Admin' })

const { api } = useAdminApi()
const { $toast } = useNuxtApp()

const CHART_COLORS = ['#1f6b4a', '#e08a3c', '#7a9e88', '#155238', '#c4785a']
const STATUS_ORDER = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

const presets = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'year', label: 'This Year' },
  { key: 'custom', label: 'Custom' },
]

const activePreset = ref('month')
const customStart = ref('')
const customEnd = ref('')
const rangeStart = ref('')
const rangeEnd = ref('')
const stats = ref(null)
const loading = ref(false)
const loadError = ref('')

const todayKey = computed(() => formatDateKey(new Date()))

const rangeLabel = computed(() => {
  if (!rangeStart.value || !rangeEnd.value) return ''
  if (rangeStart.value === rangeEnd.value) return formatDisplayDate(rangeStart.value)
  return `${formatDisplayDate(rangeStart.value)} – ${formatDisplayDate(rangeEnd.value)}`
})

const totalStatusOrders = computed(() =>
  Object.values(stats.value?.ordersByStatus || {}).reduce((sum, count) => sum + Number(count || 0), 0)
)

const productColumns = [
  { key: 'name', label: 'Product' },
  {
    key: 'totalQuantity',
    label: 'Units sold',
    width: '120px',
    format: (value) => Number(value || 0),
  },
  {
    key: 'totalRevenue',
    label: 'Revenue',
    width: '120px',
    format: (value) => formatMoney(value),
  },
]

const revenueSeries = computed(() => [
  {
    name: 'Revenue',
    data: (stats.value?.revenueByDay || []).map((day) => Number(day.revenue || 0)),
  },
])

const revenueChartOptions = computed(() => ({
  chart: {
    toolbar: { show: false },
    zoom: { enabled: false },
    fontFamily: 'Nunito, system-ui, sans-serif',
  },
  colors: ['#1f6b4a'],
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2.5 },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.35,
      opacityTo: 0.05,
      stops: [0, 90, 100],
    },
  },
  grid: {
    borderColor: '#d5e2da',
    strokeDashArray: 4,
  },
  xaxis: {
    categories: (stats.value?.revenueByDay || []).map((day) => day.date),
    labels: {
      rotate: -45,
      rotateAlways: (stats.value?.revenueByDay || []).length > 14,
      style: { colors: '#5a6b61', fontSize: '11px' },
      formatter: (value) => formatShortDate(value),
    },
    axisBorder: { color: '#d5e2da' },
    axisTicks: { color: '#d5e2da' },
  },
  yaxis: {
    labels: {
      style: { colors: '#5a6b61' },
      formatter: (value) => `$${Number(value).toFixed(0)}`,
    },
  },
  tooltip: {
    y: {
      formatter: (value) => formatMoney(value),
    },
  },
}))

const statusSeries = computed(() =>
  STATUS_ORDER.map((label) => Number(stats.value?.ordersByStatus?.[label] || 0))
)

const statusChartOptions = computed(() => ({
  chart: {
    toolbar: { show: false },
    fontFamily: 'Nunito, system-ui, sans-serif',
  },
  labels: STATUS_ORDER,
  colors: CHART_COLORS,
  legend: {
    position: 'bottom',
    fontFamily: 'Nunito, system-ui, sans-serif',
    markers: { radius: 10 },
  },
  dataLabels: {
    enabled: true,
    formatter: (value) => `${Math.round(value)}%`,
  },
  plotOptions: {
    pie: {
      donut: {
        size: '68%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Orders',
            formatter: () => String(totalStatusOrders.value),
          },
        },
      },
    },
  },
  stroke: { width: 2, colors: ['#fff'] },
  tooltip: {
    y: {
      formatter: (value) => `${value} order${value === 1 ? '' : 's'}`,
    },
  },
}))

function pad(value) {
  return String(value).padStart(2, '0')
}

function formatDateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function startOfWeek(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const day = d.getDay()
  const daysFromMonday = day === 0 ? 6 : day - 1
  d.setDate(d.getDate() - daysFromMonday)
  return d
}

function formatDisplayDate(value) {
  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatShortDate(value) {
  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function formatMoney(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

function formatPercent(value) {
  const num = Number(value || 0)
  return `${num.toFixed(1)}%`
}

function getPresetRange(key) {
  const now = new Date()
  const end = formatDateKey(now)

  if (key === 'today') {
    return { start: end, end }
  }

  if (key === 'week') {
    return { start: formatDateKey(startOfWeek(now)), end }
  }

  if (key === 'month') {
    return { start: formatDateKey(new Date(now.getFullYear(), now.getMonth(), 1)), end }
  }

  if (key === 'year') {
    return { start: formatDateKey(new Date(now.getFullYear(), 0, 1)), end }
  }

  return null
}

async function fetchStats() {
  if (!rangeStart.value || !rangeEnd.value) return

  loading.value = true
  loadError.value = ''

  try {
    const response = await api('/api/admin/stats', {
      query: {
        startDate: rangeStart.value,
        endDate: rangeEnd.value,
      },
    })
    stats.value = response?.data || null
  } catch (error) {
    loadError.value = error?.data?.message || error?.message || 'Could not load dashboard stats'
    $toast?.error(loadError.value)
  } finally {
    loading.value = false
  }
}

function applyPreset(key) {
  activePreset.value = key

  if (key === 'custom') {
    if (!customStart.value) customStart.value = rangeStart.value
    if (!customEnd.value) customEnd.value = rangeEnd.value
    return
  }

  const range = getPresetRange(key)
  if (!range) return
  rangeStart.value = range.start
  rangeEnd.value = range.end
  fetchStats()
}

function applyCustomRange() {
  if (!customStart.value || !customEnd.value) return
  if (customStart.value > customEnd.value) {
    $toast?.error('Start date must be before end date')
    return
  }
  rangeStart.value = customStart.value
  rangeEnd.value = customEnd.value
  fetchStats()
}

const initial = getPresetRange('month')
rangeStart.value = initial.start
rangeEnd.value = initial.end
await fetchStats()
</script>

<style scoped lang="scss">
.admin-dashboard {
  display: grid;
  gap: 1.25rem;
}

.admin-dashboard__filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.admin-dashboard__presets {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.admin-dashboard__preset {
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  color: var(--color-muted);
  border-radius: 999px;
  padding: 0.45rem 0.9rem;
  font: inherit;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background $duration-fast $ease-soft,
    color $duration-fast $ease-soft,
    border-color $duration-fast $ease-soft;

  &:hover,
  &:focus-visible {
    color: var(--color-brand);
    border-color: rgba(31, 107, 74, 0.35);
  }

  &.is-active {
    background: var(--color-brand);
    border-color: var(--color-brand);
    color: #fff;
  }
}

.admin-dashboard__custom {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: 0.65rem;
}

.admin-dashboard__date-field {
  display: grid;
  gap: 0.25rem;

  span {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--color-muted);
  }

  input {
    padding: 0.45rem 0.65rem;
    border: 1px solid var(--color-border);
    border-radius: 10px;
    background: #fff;
    color: var(--color-ink);
    font: inherit;
  }
}

.admin-dashboard__cards {
  display: grid;
  gap: 0.85rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  transition: opacity $duration-fast $ease-soft;

  @media (min-width: $bp-md) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (min-width: $bp-lg) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  &.is-refreshing {
    opacity: 0.72;
  }
}

.admin-stat-card {
  @include card-surface;
  padding: 1rem 1.1rem;
  display: grid;
  gap: 0.35rem;
  text-decoration: none;
  color: inherit;
}

.admin-stat-card__label {
  margin: 0;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-muted);
}

.admin-stat-card__value {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.55rem;
  font-weight: 700;
  color: var(--color-brand-dark);
  line-height: 1.15;
}

.admin-stat-card--link {
  transition:
    transform $duration-fast $ease-soft,
    border-color $duration-fast $ease-soft;

  &:hover,
  &:focus-visible {
    transform: translateY(-1px);
    border-color: rgba(31, 107, 74, 0.35);
  }
}

.admin-stat-card--messages {
  position: relative;
  background:
    linear-gradient(160deg, rgba(31, 107, 74, 0.08), transparent 55%),
    var(--color-surface);
}

.admin-stat-card__badge {
  display: inline-flex;
  width: fit-content;
  margin-top: 0.15rem;
  padding: 0.18rem 0.5rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #9a3412;
  background: #ffedd5;
  border: 1px solid #fdba74;
}

.admin-dashboard__charts {
  display: grid;
  gap: 1rem;

  @media (min-width: $bp-lg) {
    grid-template-columns: 1.4fr 1fr;
  }
}

.admin-dashboard__chart-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;

  h2 {
    margin: 0;
    font-family: var(--font-display);
    font-size: 1.15rem;
  }

  p {
    margin: 0;
    color: var(--color-muted);
    font-size: 0.88rem;
  }
}

.admin-dashboard__top-products {
  :deep(.ui-table-wrap) {
    margin-top: 0.35rem;
    box-shadow: none;
    border: 1px solid var(--color-border);
  }
}
</style>
