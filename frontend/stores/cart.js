import { defineStore } from 'pinia'
import { getChargePrice } from '~/utils/pricing'

function notifyToast(type, message) {
  if (!import.meta.client) return
  const { $toast } = useNuxtApp()
  if (!$toast?.[type]) return
  $toast[type](message)
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
  }),

  getters: {
    cartCount: (state) =>
      state.items.reduce((sum, item) => sum + item.quantity, 0),

    cartTotal: (state) =>
      state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  },

  actions: {
    addToCart(product, quantity = 1) {
      if (!product?._id) return

      const existing = this.items.find((item) => item._id === product._id)
      const chargePrice = getChargePrice(product)

      if (existing) {
        existing.quantity += quantity
        // Refresh unit price in case promo changed since last add
        existing.price = chargePrice
      } else {
        this.items.push({
          _id: product._id,
          name: product.name,
          price: chargePrice,
          image: Array.isArray(product.images) ? product.images[0] || '' : '',
          quantity,
        })
      }

      notifyToast('success', 'Added to cart! 🐾')
    },

    removeFromCart(productId) {
      const existed = this.items.some((item) => item._id === productId)
      this.items = this.items.filter((item) => item._id !== productId)
      if (existed) {
        notifyToast('info', 'Item removed')
      }
    },

    updateQuantity(productId, quantity) {
      const item = this.items.find((entry) => entry._id === productId)
      if (!item) return

      if (quantity < 1) {
        this.removeFromCart(productId)
        return
      }

      item.quantity = quantity
    },

    incrementQuantity(productId) {
      const item = this.items.find((entry) => entry._id === productId)
      if (!item) return
      item.quantity += 1
    },

    decrementQuantity(productId) {
      const item = this.items.find((entry) => entry._id === productId)
      if (!item) return

      if (item.quantity <= 1) {
        this.removeFromCart(productId)
        return
      }

      item.quantity -= 1
    },

    clearCart() {
      this.items = []
    },
  },

  persist: {
    key: 'petsitively_cart',
    storage: piniaPluginPersistedstate.localStorage(),
    pick: ['items'],
  },
})
