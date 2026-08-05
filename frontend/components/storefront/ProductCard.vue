<template>
  <article class="product-card">
    <div class="product-card__media">
      <span
        v-if="discountPercent != null"
        class="product-card__badge product-card__badge--sale"
      >
        -{{ discountPercent }}% OFF
      </span>
      <span
        v-if="product.featured"
        class="product-card__badge product-card__badge--featured"
        :class="{ 'is-offset': discountPercent != null }"
      >
        Best Seller
      </span>

      <NuxtLink :to="`/products/${product._id}`" class="product-card__image-link" tabindex="-1">
        <NuxtImg
          v-if="showImage"
          :src="imageSrc"
          :alt="product.name"
          class="product-card__image"
          width="600"
          height="600"
          fit="cover"
          loading="lazy"
          format="webp"
          sizes="(max-width: 768px) 50vw, 300px"
          @error="onImageError"
        />
        <div
          v-else
          class="product-card__image product-card__image--placeholder"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" width="40" height="40" fill="none">
            <rect
              x="3"
              y="5"
              width="18"
              height="14"
              rx="2"
              stroke="currentColor"
              stroke-width="1.6"
            />
            <circle cx="9" cy="10" r="1.5" fill="currentColor" />
            <path
              d="M4.5 16.5 9 12l3 3 3.5-4.5 4 5.5"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>No image</span>
        </div>
      </NuxtLink>

      <button
        type="button"
        class="product-card__quick-add"
        :disabled="product.stock < 1 || justAdded"
        @click="quickAdd"
      >
        {{ justAdded ? 'Added!' : product.stock < 1 ? 'Out of stock' : 'Quick Add to Cart' }}
      </button>
    </div>

    <NuxtLink :to="`/products/${product._id}`" class="product-card__body">
      <h2 class="product-card__name">{{ product.name }}</h2>
      <p v-if="benefit" class="product-card__benefit">{{ benefit }}</p>
      <p class="product-card__price">
        <template v-if="onSale">
          <span class="product-card__price-current">{{ formatMoney(chargePrice) }}</span>
          <span class="product-card__price-compare">{{ formatMoney(sellingPrice) }}</span>
        </template>
        <template v-else>
          {{ formatMoney(chargePrice) }}
        </template>
      </p>
    </NuxtLink>
  </article>
</template>

<script setup>
import {
  formatMoney,
  getChargePrice,
  getDiscountPercent,
  getSellingPrice,
  hasActiveDiscount,
} from '~/utils/pricing'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  benefit: {
    type: String,
    default: '',
  },
})

const cart = useCartStore()
const { flyToCart } = useFlyToCart()
const justAdded = ref(false)
const imageFailed = ref(false)
let addedTimer

const imageSrc = computed(() => {
  const src = props.product?.images?.[0]
  return typeof src === 'string' ? src.trim() : ''
})

const showImage = computed(() => Boolean(imageSrc.value) && !imageFailed.value)

const onSale = computed(() => hasActiveDiscount(props.product))
const chargePrice = computed(() => getChargePrice(props.product))
const sellingPrice = computed(() => getSellingPrice(props.product))
const discountPercent = computed(() => getDiscountPercent(props.product))

watch(imageSrc, () => {
  imageFailed.value = false
})

function onImageError() {
  imageFailed.value = true
}

async function quickAdd(event) {
  if (!props.product || props.product.stock < 1) return

  const card = event.currentTarget?.closest?.('.product-card')
  const fromEl =
    card?.querySelector?.('.product-card__image') || event.currentTarget

  cart.addToCart(props.product)
  justAdded.value = true
  clearTimeout(addedTimer)
  addedTimer = setTimeout(() => {
    justAdded.value = false
  }, 1200)

  await flyToCart({
    fromEl,
    imageUrl: showImage.value ? imageSrc.value : '',
  })
}

onBeforeUnmount(() => {
  clearTimeout(addedTimer)
})
</script>
