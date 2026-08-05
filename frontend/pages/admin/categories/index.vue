<template>
  <div class="admin-categories">
    <form class="admin-panel admin-categories__form" @submit.prevent="createCategory">
      <UiField label="New category" required :disabled="creating" :error="createError">
        <div class="admin-categories__form-row">
          <UiInput
            v-model="newName"
            required
            :disabled="creating"
            placeholder="e.g. Grooming"
          />
          <button type="submit" class="btn btn--primary" :disabled="creating">
            {{ creating ? 'Adding…' : 'Add category' }}
          </button>
        </div>
      </UiField>
    </form>

    <div class="admin-toolbar">
      <p class="admin-toolbar__meta">
        {{
          initialLoading
            ? 'Loading…'
            : `${categories.length} categor${categories.length === 1 ? 'y' : 'ies'}`
        }}
      </p>
    </div>

    <div v-if="loadError" class="admin-panel admin-panel--error" role="alert">
      {{ loadError }}
    </div>

    <UiTable
      v-else
      :columns="columns"
      :rows="categories"
      :loading="initialLoading"
      loading-text="Loading categories…"
      empty-text="No categories yet. Add one above."
    >
      <template #cell-name="{ row }">
        <span class="ui-table__name" :title="row.name">{{ row.name }}</span>
      </template>

      <template #cell-productCount="{ row }">
        {{ row.productCount ?? 0 }}
      </template>

      <template #cell-actions="{ row }">
        <button
          type="button"
          class="btn btn--ghost btn--sm btn--danger btn--icon"
          :disabled="deletingId === row._id"
          :title="
            (row.productCount ?? 0) > 0
              ? `Delete and move ${row.productCount} product${
                  row.productCount === 1 ? '' : 's'
                }`
              : 'Delete category'
          "
          :aria-label="`Delete ${row.name}`"
          @click="openDelete(row)"
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
      </template>
    </UiTable>

    <UiModal
      v-model="deleteOpen"
      :title="deleteTarget ? `Delete “${deleteTarget.name}”` : 'Delete category'"
      :persist="deleting"
    >
      <template v-if="deleteTarget">
        <p v-if="(deleteTarget.productCount ?? 0) === 0" class="admin-categories__lede">
          This category has no products. Delete it permanently?
        </p>
        <template v-else>
          <p class="admin-categories__lede">
            {{ deleteTarget.productCount }} product{{
              deleteTarget.productCount === 1 ? '' : 's'
            }}
            use this category. Choose another category to move them to before deleting.
          </p>
          <UiField
            label="Move products to"
            required
            :disabled="deleting"
            :error="reassignError"
          >
            <UiSelect
              v-model="reassignTo"
              required
              :disabled="deleting || reassignOptions.length === 0"
              :options="reassignOptions"
              :placeholder="
                reassignOptions.length === 0
                  ? 'Create another category first'
                  : 'Select a category'
              "
            />
          </UiField>
        </template>
      </template>

      <template #footer>
        <button type="button" class="btn btn--ghost" :disabled="deleting" @click="closeDelete">
          Cancel
        </button>
        <button
          type="button"
          class="btn btn--primary"
          :disabled="deleting || !canConfirmDelete"
          @click="confirmDelete"
        >
          {{ deleting ? 'Deleting…' : 'Delete category' }}
        </button>
      </template>
    </UiModal>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
  title: 'Categories',
  pageTransition: false,
})

useHead({ title: 'Categories — Admin' })

const { api } = useAdminApi()
const { $toast } = useNuxtApp()

const categories = ref([])
const initialLoading = ref(true)
const loadError = ref('')
const newName = ref('')
const createError = ref('')
const creating = ref(false)

const deleteOpen = ref(false)
const deleteTarget = ref(null)
const reassignTo = ref('')
const reassignError = ref('')
const deleting = ref(false)
const deletingId = ref(null)

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'productCount', label: 'Products', width: '120px' },
  { key: 'actions', label: 'Actions', width: '90px' },
]

const reassignOptions = computed(() =>
  categories.value
    .filter((category) => category._id !== deleteTarget.value?._id)
    .map((category) => ({
      value: category._id,
      label: category.name,
    }))
)

const canConfirmDelete = computed(() => {
  if (!deleteTarget.value) return false
  if ((deleteTarget.value.productCount ?? 0) === 0) return true
  return Boolean(reassignTo.value)
})

async function fetchCategories({ silent = false } = {}) {
  if (!silent) {
    initialLoading.value = true
  }
  loadError.value = ''

  try {
    const response = await api('/api/categories')
    categories.value = response?.data || []
  } catch (error) {
    loadError.value =
      error?.data?.message || error?.message || 'Could not load categories'
    if (!silent) {
      categories.value = []
    }
  } finally {
    initialLoading.value = false
  }
}

async function createCategory() {
  createError.value = ''
  const name = String(newName.value).trim()

  if (!name) {
    createError.value = 'Name is required'
    return
  }

  creating.value = true

  try {
    await api('/api/categories', {
      method: 'POST',
      body: { name },
    })
    $toast?.success('Category added')
    newName.value = ''
    await fetchCategories({ silent: true })
  } catch (error) {
    const message = error?.data?.message || error?.message || 'Could not add category'
    createError.value = message
    $toast?.error(message)
  } finally {
    creating.value = false
  }
}

function openDelete(category) {
  deleteTarget.value = category
  reassignTo.value = ''
  reassignError.value = ''
  deleteOpen.value = true
}

function closeDelete() {
  if (deleting.value) return
  deleteOpen.value = false
  deleteTarget.value = null
  reassignTo.value = ''
  reassignError.value = ''
}

async function confirmDelete() {
  if (!deleteTarget.value || !canConfirmDelete.value) return

  const needsReassign = (deleteTarget.value.productCount ?? 0) > 0
  if (needsReassign && !reassignTo.value) {
    reassignError.value = 'Select a category to move products to'
    return
  }

  reassignError.value = ''
  deleting.value = true
  deletingId.value = deleteTarget.value._id

  try {
    const body = needsReassign ? { reassignTo: reassignTo.value } : undefined
    const response = await api(`/api/categories/${deleteTarget.value._id}`, {
      method: 'DELETE',
      body,
    })
    $toast?.success(response?.message || 'Category deleted')
    deleteOpen.value = false
    deleteTarget.value = null
    reassignTo.value = ''
    await fetchCategories({ silent: true })
  } catch (error) {
    const message = error?.data?.message || error?.message || 'Could not delete category'
    if (needsReassign) {
      reassignError.value = message
    }
    $toast?.error(message)
  } finally {
    deleting.value = false
    deletingId.value = null
  }
}

await fetchCategories()
</script>

<style scoped lang="scss">
.admin-categories__form {
  margin-bottom: 1.25rem;
}

.admin-categories__form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: stretch;

  .ui-input {
    flex: 1 1 220px;
  }

  .btn {
    flex: 0 0 auto;
  }
}

.admin-categories__lede {
  margin: 0 0 1rem;
  color: var(--color-muted);
  line-height: 1.45;
}
</style>
