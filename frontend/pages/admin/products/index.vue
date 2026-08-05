<template>
  <div class="admin-products">
    <div class="admin-toolbar">
      <p class="admin-toolbar__meta">
        {{ initialLoading ? 'Loading…' : `${products.length} product${products.length === 1 ? '' : 's'}` }}
      </p>
      <button type="button" class="btn btn--primary" @click="openCreate">
        Add New Product
      </button>
    </div>

    <div v-if="loadError" class="admin-panel admin-panel--error" role="alert">
      {{ loadError }}
    </div>

    <UiTable
      v-else
      :columns="columns"
      :rows="products"
      :loading="initialLoading"
      loading-text="Loading products…"
      empty-text="No products yet. Add your first product."
    >
      <template #cell-image="{ row }">
        <UiThumb :src="row.images?.[0] || ''" :alt="row.name" :size="48" />
      </template>

      <template #cell-name="{ row }">
        <span class="ui-table__name" :title="row.name">{{ row.name }}</span>
      </template>

      <template #cell-sellingPrice="{ row }">
        <div class="admin-products__price">
          <template v-if="hasActiveDiscount(row)">
            <span class="admin-products__sale-price">
              ${{ Number(row.discountedPrice).toFixed(2) }}
            </span>
            <span class="admin-products__list-price">
              ${{ Number(row.sellingPrice).toFixed(2) }}
            </span>
            <span class="admin-products__sale-badge">SALE</span>
          </template>
          <template v-else>
            ${{ Number(row.sellingPrice ?? row.price).toFixed(2) }}
          </template>
        </div>
      </template>

      <template #cell-category="{ row }">
        {{ categoryLabel(row.category) }}
      </template>

      <template #cell-actions="{ row }">
        <div class="ui-table__actions">
          <button
            type="button"
            class="btn btn--ghost btn--sm btn--icon"
            title="Edit product"
            :aria-label="`Edit ${row.name}`"
            @click="openEdit(row)"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
              <path
                d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linejoin="round"
              />
              <path
                d="M13.5 6.5l3 3"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
            </svg>
          </button>
          <button
            type="button"
            class="btn btn--ghost btn--sm btn--danger btn--icon"
            :disabled="deletingId === row._id"
            title="Delete product"
            :aria-label="`Delete ${row.name}`"
            @click="confirmDelete(row)"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
              <path
                d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M10 11v6M14 11v6M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
      </template>
    </UiTable>

    <AdminProductForm
      v-model="formOpen"
      :product="editingProduct"
      :saving="saving"
      @save="saveProduct"
    />
  </div>
</template>

<script setup>
import { hasActiveDiscount } from '~/utils/pricing'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
  title: 'Products',
  pageTransition: false,
})

useHead({ title: 'Products — Admin' })

const { api } = useAdminApi()
const { $toast } = useNuxtApp()

const products = ref([])
const initialLoading = ref(true)
const loadError = ref('')
const formOpen = ref(false)
const editingProduct = ref(null)
const saving = ref(false)
const deletingId = ref(null)

const columns = [
  { key: 'image', label: 'Image', width: '76px' },
  { key: 'name', label: 'Name' },
  {
    key: 'sellingPrice',
    label: 'Price',
    width: '180px',
  },
  { key: 'stock', label: 'Stock', width: '90px' },
  { key: 'category', label: 'Category', width: '160px' },
  { key: 'actions', label: 'Actions', width: '110px' },
]

function categoryLabel(category) {
  if (!category) return '—'
  if (typeof category === 'object') return category.name || '—'
  return String(category)
}

async function fetchProducts({ silent = false } = {}) {
  if (!silent) {
    initialLoading.value = true
  }
  loadError.value = ''

  try {
    const response = await api('/api/products')
    products.value = response?.data || []
  } catch (error) {
    loadError.value =
      error?.data?.message || error?.message || 'Could not load products'
    if (!silent) {
      products.value = []
    }
  } finally {
    initialLoading.value = false
  }
}

function openCreate() {
  editingProduct.value = null
  formOpen.value = true
}

function openEdit(product) {
  editingProduct.value = { ...product }
  formOpen.value = true
}

async function saveProduct(payload) {
  saving.value = true

  try {
    // Ensure discountedPrice is always sent (including null to clear a promo)
    const body = {
      ...payload,
      discountedPrice:
        payload.discountedPrice === undefined || payload.discountedPrice === ''
          ? null
          : Number(payload.discountedPrice),
    }

    if (editingProduct.value?._id) {
      await api(`/api/products/${editingProduct.value._id}`, {
        method: 'PUT',
        body,
      })
      $toast?.success('Product updated')
    } else {
      await api('/api/products', {
        method: 'POST',
        body,
      })
      $toast?.success('Product created')
    }

    formOpen.value = false
    editingProduct.value = null
    await fetchProducts({ silent: true })
  } catch (error) {
    $toast?.error(error?.data?.message || error?.message || 'Could not save product')
  } finally {
    saving.value = false
  }
}

async function confirmDelete(product) {
  const ok = window.confirm(`Delete “${product.name}”? This cannot be undone.`)
  if (!ok) return

  deletingId.value = product._id

  try {
    await api(`/api/products/${product._id}`, { method: 'DELETE' })
    $toast?.success('Product deleted')
    await fetchProducts({ silent: true })
  } catch (error) {
    $toast?.error(error?.data?.message || error?.message || 'Could not delete product')
  } finally {
    deletingId.value = null
  }
}

await fetchProducts()
</script>

<style scoped lang="scss">
.admin-products__price {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem 0.45rem;
  font-weight: 700;
  color: var(--color-ink);
}

.admin-products__sale-price {
  color: var(--color-brand);
}

.admin-products__list-price {
  color: var(--color-muted);
  font-weight: 600;
  text-decoration: line-through;
  font-size: 0.85rem;
}

.admin-products__sale-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.12rem 0.4rem;
  border-radius: 999px;
  background: var(--color-accent);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.04em;
}
</style>
