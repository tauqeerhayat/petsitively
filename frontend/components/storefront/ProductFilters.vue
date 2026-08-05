<template>
  <div class="product-filters">
    <div class="product-filters__row product-filters__row--search">
      <label class="product-filters__field product-filters__field--grow">
        <span class="product-filters__label">Search</span>
        <UiInput
          v-model="search"
          type="search"
          placeholder="Search products…"
          autocomplete="off"
          aria-label="Search products"
        />
      </label>
    </div>

    <div class="product-filters__row">
      <label class="product-filters__field">
        <span class="product-filters__label">Category</span>
        <UiSelect
          v-model="category"
          :options="categoryOptions"
          aria-label="Filter by category"
        />
      </label>

      <label class="product-filters__field">
        <span class="product-filters__label">Sort</span>
        <UiSelect
          v-model="sort"
          :options="sortOptions"
          aria-label="Sort products"
        />
      </label>

      <div class="product-filters__price">
        <span class="product-filters__label">Price range</span>
        <div class="product-filters__price-inputs">
          <UiInput
            v-model="minPriceDraft"
            type="number"
            min="0"
            step="0.01"
            placeholder="Min"
            aria-label="Minimum price"
          />
          <span class="product-filters__price-sep" aria-hidden="true">–</span>
          <UiInput
            v-model="maxPriceDraft"
            type="number"
            min="0"
            step="0.01"
            placeholder="Max"
            aria-label="Maximum price"
          />
          <button type="button" class="btn btn--primary btn--sm" @click="applyPrice">
            Apply
          </button>
        </div>
      </div>

      <div v-if="hasActiveFilters" class="product-filters__clear">
        <button type="button" class="btn btn--ghost btn--sm" @click="clearFilters">
          Clear Filters
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  categories: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue', 'clear'])

const search = computed({
  get: () => props.modelValue.search ?? '',
  set: (value) => emit('update:modelValue', { ...props.modelValue, search: value }),
})

const category = computed({
  get: () => props.modelValue.category ?? '',
  set: (value) => emit('update:modelValue', { ...props.modelValue, category: value }),
})

const sort = computed({
  get: () => props.modelValue.sort ?? 'newest',
  set: (value) => emit('update:modelValue', { ...props.modelValue, sort: value }),
})

const minPriceDraft = ref(
  props.modelValue.minPrice === undefined || props.modelValue.minPrice === null
    ? ''
    : props.modelValue.minPrice
)
const maxPriceDraft = ref(
  props.modelValue.maxPrice === undefined || props.modelValue.maxPrice === null
    ? ''
    : props.modelValue.maxPrice
)

watch(
  () => [props.modelValue.minPrice, props.modelValue.maxPrice],
  ([min, max]) => {
    minPriceDraft.value = min === undefined || min === null ? '' : min
    maxPriceDraft.value = max === undefined || max === null ? '' : max
  }
)

const categoryOptions = computed(() => [
  { value: '', label: 'All categories' },
  ...(props.categories || []).map((item) => ({
    value: item._id,
    label: item.name,
  })),
])

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
]

const hasActiveFilters = computed(() => {
  const f = props.modelValue
  return Boolean(
    String(f.search || '').trim() ||
      f.category ||
      (f.minPrice !== '' && f.minPrice != null) ||
      (f.maxPrice !== '' && f.maxPrice != null) ||
      (f.sort && f.sort !== 'newest')
  )
})

function applyPrice() {
  emit('update:modelValue', {
    ...props.modelValue,
    minPrice: minPriceDraft.value === '' || minPriceDraft.value == null ? '' : Number(minPriceDraft.value),
    maxPrice: maxPriceDraft.value === '' || maxPriceDraft.value == null ? '' : Number(maxPriceDraft.value),
  })
}

function clearFilters() {
  minPriceDraft.value = ''
  maxPriceDraft.value = ''
  emit('clear')
}
</script>
