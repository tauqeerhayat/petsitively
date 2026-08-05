<template>
  <UiModal
    :model-value="modelValue"
    :title="isEdit ? 'Edit product' : 'Add new product'"
    :persist="saving"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <form id="admin-product-form" class="admin-product-form" novalidate @submit.prevent="onSubmit">
      <UiField label="Name" required :disabled="saving" :error="errors.name">
        <UiInput v-model="form.name" required :disabled="saving" />
      </UiField>

      <UiField label="Description" required :disabled="saving" :error="errors.description">
        <UiTextarea v-model="form.description" :rows="4" required :disabled="saving" />
      </UiField>

      <div class="admin-product-form__row">
        <UiField label="Cost Price" required :disabled="saving" :error="errors.costPrice">
          <UiInput
            v-model="form.costPrice"
            type="number"
            min="0"
            step="0.01"
            required
            :disabled="saving"
          />
        </UiField>

        <UiField label="Selling Price" required :disabled="saving" :error="errors.sellingPrice">
          <UiInput
            v-model="form.sellingPrice"
            type="number"
            min="0"
            step="0.01"
            required
            :disabled="saving"
          />
        </UiField>
      </div>

      <div class="admin-product-form__row">
        <UiField
          label="Discounted Price"
          hint="Leave blank if no promotion is active."
          :disabled="saving"
          :error="errors.discountedPrice"
        >
          <UiInput
            v-model="form.discountedPrice"
            type="number"
            min="0"
            step="0.01"
            placeholder="Optional"
            :disabled="saving"
          />
        </UiField>

        <UiField label="Stock" required :disabled="saving" :error="errors.stock">
          <UiInput
            v-model="form.stock"
            type="number"
            min="0"
            step="1"
            required
            :disabled="saving"
          />
        </UiField>
      </div>

      <UiField label="Category" required :disabled="saving" :error="errors.category">
        <UiSelect
          v-model="form.category"
          required
          :disabled="saving || categoriesLoading"
          :options="categoryOptions"
          :placeholder="categoriesLoading ? 'Loading categories…' : 'Select a category'"
        />
      </UiField>

      <UiField
        label="Images"
        hint="Paste full image URLs, one per line."
        :disabled="saving"
      >
        <UiTextarea
          v-model="form.imagesText"
          :rows="3"
          placeholder="One image URL per line"
          :disabled="saving"
        />
      </UiField>

      <p v-if="localError" class="ui-field__error" role="alert">{{ localError }}</p>
    </form>

    <template #footer>
      <button type="button" class="btn btn--ghost" :disabled="saving" @click="close">
        Cancel
      </button>
      <button type="submit" form="admin-product-form" class="btn btn--primary" :disabled="saving">
        {{ saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create product' }}
      </button>
    </template>
  </UiModal>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  product: {
    type: Object,
    default: null,
  },
  saving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'save'])

const { api } = useAdminApi()

const isEdit = computed(() => Boolean(props.product?._id))

const categories = ref([])
const categoriesLoading = ref(false)

const categoryOptions = computed(() =>
  categories.value.map((category) => ({
    value: category._id,
    label: category.name,
  }))
)

const form = reactive({
  name: '',
  description: '',
  costPrice: 0,
  sellingPrice: 0,
  discountedPrice: '',
  stock: 0,
  category: '',
  imagesText: '',
})

const errors = reactive({
  name: '',
  description: '',
  costPrice: '',
  sellingPrice: '',
  discountedPrice: '',
  stock: '',
  category: '',
})

const localError = ref('')

function isValidMoney(value) {
  return value !== '' && !Number.isNaN(Number(value)) && Number(value) >= 0
}

function categoryIdFromProduct(product) {
  const category = product?.category
  if (!category) return ''
  if (typeof category === 'object') return category._id || ''
  return String(category)
}

async function fetchCategories() {
  categoriesLoading.value = true
  try {
    const response = await api('/api/categories')
    categories.value = response?.data || []
  } catch {
    categories.value = []
  } finally {
    categoriesLoading.value = false
  }
}

watch(
  () => [props.modelValue, props.product],
  async () => {
    if (!props.modelValue) return
    localError.value = ''
    Object.keys(errors).forEach((key) => {
      errors[key] = ''
    })
    await fetchCategories()
    const p = props.product
    form.name = p?.name || ''
    form.description = p?.description || ''
    form.costPrice = p?.costPrice ?? 0
    form.sellingPrice = p?.sellingPrice ?? p?.price ?? 0
    form.discountedPrice =
      p?.discountedPrice === null || p?.discountedPrice === undefined
        ? ''
        : p.discountedPrice
    form.stock = p?.stock ?? 0
    form.category = categoryIdFromProduct(p)
    form.imagesText = Array.isArray(p?.images) ? p.images.join('\n') : ''
  },
  { immediate: true }
)

function close() {
  if (props.saving) return
  emit('update:modelValue', false)
}

function onSubmit() {
  localError.value = ''
  errors.name = String(form.name).trim() ? '' : 'Name is required'
  errors.description = String(form.description).trim() ? '' : 'Description is required'
  errors.category = String(form.category).trim() ? '' : 'Category is required'
  errors.costPrice = isValidMoney(form.costPrice) ? '' : 'Enter a valid cost price'
  errors.sellingPrice = isValidMoney(form.sellingPrice) ? '' : 'Enter a valid selling price'
  errors.stock =
    form.stock === '' || Number(form.stock) < 0 || Number.isNaN(Number(form.stock))
      ? 'Enter a valid stock quantity'
      : ''

  const discountBlank =
    form.discountedPrice === '' ||
    form.discountedPrice === null ||
    form.discountedPrice === undefined

  if (discountBlank) {
    errors.discountedPrice = ''
  } else if (!isValidMoney(form.discountedPrice)) {
    errors.discountedPrice = 'Enter a valid discounted price or leave blank'
  } else if (Number(form.discountedPrice) >= Number(form.sellingPrice)) {
    errors.discountedPrice = 'Discounted price must be less than selling price'
  } else {
    errors.discountedPrice = ''
  }

  if (Object.values(errors).some(Boolean)) {
    localError.value = 'Please fix the highlighted fields'
    return
  }

  const images = form.imagesText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  emit('save', {
    name: String(form.name).trim(),
    description: String(form.description).trim(),
    costPrice: Number(form.costPrice),
    sellingPrice: Number(form.sellingPrice),
    discountedPrice: discountBlank ? null : Number(form.discountedPrice),
    stock: Number(form.stock),
    category: String(form.category).trim(),
    images,
  })
}
</script>

<style scoped lang="scss">
.admin-product-form {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.admin-product-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;

  @media (max-width: $bp-sm) {
    grid-template-columns: 1fr;
  }
}
</style>
