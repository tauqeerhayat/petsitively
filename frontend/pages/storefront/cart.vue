<template>
  <div class="container cart-page">
    <NuxtLink to="/" class="back-link">← Continue shopping</NuxtLink>

    <section class="page-hero">
      <h1>Your cart</h1>
      <p>Review items, adjust quantities, then head to checkout.</p>
    </section>

    <div v-if="!cart.items.length" class="state-box">
      Your cart is empty.
      <div style="margin-top: 1rem">
        <NuxtLink to="/" class="btn btn--primary">Browse products</NuxtLink>
      </div>
    </div>

    <template v-else>
      <ul class="cart-list">
        <li v-for="item in cart.items" :key="item._id" class="cart-item">
          <div class="cart-item__media">
            <NuxtImg
              v-if="item.image && !brokenImages[item._id]"
              :src="item.image"
              :alt="item.name"
              class="cart-item__image"
              width="96"
              height="96"
              fit="cover"
              loading="lazy"
              format="webp"
              @error="markBroken(item._id)"
            />
            <div v-else class="cart-item__image cart-item__image--placeholder" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
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
            </div>
          </div>

          <div class="cart-item__info">
            <NuxtLink :to="`/products/${item._id}`" class="cart-item__name">
              {{ item.name }}
            </NuxtLink>
            <p class="cart-item__price">${{ Number(item.price).toFixed(2) }} each</p>
          </div>

          <div class="cart-item__qty" aria-label="Quantity controls">
            <button
              type="button"
              class="qty-btn"
              :aria-label="`Decrease quantity of ${item.name}`"
              @click="cart.decrementQuantity(item._id)"
            >
              −
            </button>
            <span class="qty-value">{{ item.quantity }}</span>
            <button
              type="button"
              class="qty-btn"
              :aria-label="`Increase quantity of ${item.name}`"
              @click="cart.incrementQuantity(item._id)"
            >
              +
            </button>
          </div>

          <p class="cart-item__line-total">
            ${{ (item.price * item.quantity).toFixed(2) }}
          </p>

          <button
            type="button"
            class="btn btn--ghost btn--icon cart-item__remove"
            :aria-label="`Remove ${item.name} from cart`"
            title="Remove from cart"
            @click="cart.removeFromCart(item._id)"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
              <path
                d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M10 11v6M14 11v6M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </li>
      </ul>

      <div class="cart-summary">
        <div class="cart-summary__row">
          <span>Total</span>
          <strong>${{ cart.cartTotal.toFixed(2) }}</strong>
        </div>
        <NuxtLink to="/checkout" class="btn btn--primary cart-summary__checkout">
          Proceed to Checkout
        </NuxtLink>
      </div>
    </template>
  </div>
</template>

<script setup>
const cart = useCartStore()
const brokenImages = reactive({})

usePageSeo({
  title: 'Your cart — Petsitively',
  description: 'Review items in your Petsitively cart, adjust quantities, and proceed to checkout.',
  path: '/cart',
  robots: 'noindex, nofollow',
})

function markBroken(id) {
  brokenImages[id] = true
}
</script>
