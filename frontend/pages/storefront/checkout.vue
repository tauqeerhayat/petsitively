<template>
  <div class="container checkout-page">
    <NuxtLink to="/cart" class="back-link">← Back to cart</NuxtLink>

    <section class="page-hero">
      <h1>Checkout</h1>
      <p>Enter your details and place your order.</p>
    </section>

    <div v-if="!cart.items.length" class="state-box">
      Your cart is empty.
      <div class="checkout-page__empty-action">
        <NuxtLink to="/" class="btn btn--primary">Browse products</NuxtLink>
      </div>
    </div>

    <div v-else class="checkout-layout">
      <div class="checkout-main">
        <div v-if="!isLoggedIn" class="checkout-account-banner" role="note">
          Have an account?
          <NuxtLink to="/account/login">Log in</NuxtLink>
          to save your order history. Continue as guest remains available — no login
          required to complete checkout.
        </div>

        <form class="checkout-form" novalidate @submit.prevent="placeOrder">
        <fieldset class="checkout-form__section">
          <legend>Contact</legend>

          <label class="field">
            <span class="field__label">Full name</span>
            <input
              v-model.trim="form.customerName"
              type="text"
              name="customerName"
              autocomplete="name"
              required
              :disabled="submitting"
            />
            <span v-if="errors.customerName" class="field__error">{{ errors.customerName }}</span>
          </label>

          <label class="field">
            <span class="field__label">Email</span>
            <input
              v-model.trim="form.email"
              type="email"
              name="email"
              autocomplete="email"
              required
              :disabled="submitting"
            />
            <span v-if="errors.email" class="field__error">{{ errors.email }}</span>
          </label>
        </fieldset>

        <fieldset class="checkout-form__section">
          <legend>Shipping address</legend>

          <label class="field">
            <span class="field__label">Street</span>
            <input
              v-model.trim="form.street"
              type="text"
              name="street"
              autocomplete="street-address"
              required
              :disabled="submitting"
            />
            <span v-if="errors.street" class="field__error">{{ errors.street }}</span>
          </label>

          <div class="checkout-form__row">
            <label class="field">
              <span class="field__label">City</span>
              <input
                v-model.trim="form.city"
                type="text"
                name="city"
                autocomplete="address-level2"
                required
                :disabled="submitting"
              />
              <span v-if="errors.city" class="field__error">{{ errors.city }}</span>
            </label>

            <label class="field">
              <span class="field__label">Postal code</span>
              <input
                v-model.trim="form.postalCode"
                type="text"
                name="postalCode"
                autocomplete="postal-code"
                required
                :disabled="submitting"
              />
              <span v-if="errors.postalCode" class="field__error">{{ errors.postalCode }}</span>
            </label>
          </div>
        </fieldset>

        <p v-if="submitError" class="checkout-form__error" role="alert">
          {{ submitError }}
        </p>

        <button class="btn btn--primary checkout-form__submit" type="submit" :disabled="submitting">
          <UiSpinner v-if="submitting" size="sm" light />
          <span>{{ submitting ? 'Placing order…' : `Place order · $${cart.cartTotal.toFixed(2)}` }}</span>
        </button>
        </form>
      </div>

      <aside class="checkout-summary" aria-label="Order summary">
        <div
          v-if="submitting"
          class="checkout-summary__overlay"
          role="status"
          aria-live="polite"
        >
          <UiSpinner size="lg" label="Placing your order" show-label />
        </div>
        <h2>Order summary</h2>
        <ul class="checkout-summary__list">
          <li v-for="item in cart.items" :key="item._id" class="checkout-summary__item">
            <span>{{ item.name }} × {{ item.quantity }}</span>
            <strong>${{ (item.price * item.quantity).toFixed(2) }}</strong>
          </li>
        </ul>
        <div class="checkout-summary__total">
          <span>Total</span>
          <strong>${{ cart.cartTotal.toFixed(2) }}</strong>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()
const cart = useCartStore()
const router = useRouter()
const { api, token, profile } = useCustomerApi()

usePageSeo({
  title: 'Checkout — Petsitively',
  description: 'Complete your Petsitively order with secure checkout for thoughtful pet products.',
  path: '/checkout',
  robots: 'noindex, nofollow',
})

const isLoggedIn = computed(() => Boolean(token.value))

const form = reactive({
  customerName: '',
  email: '',
  street: '',
  city: '',
  postalCode: '',
})

const errors = reactive({
  customerName: '',
  email: '',
  street: '',
  city: '',
  postalCode: '',
})

const submitting = ref(false)
const submitError = ref('')

function applyCustomerDefaults(data) {
  if (!data) return
  if (data.name) form.customerName = data.name
  if (data.email) form.email = data.email
  if (data.shippingAddress) form.street = data.shippingAddress
  if (data.city) form.city = data.city
  if (data.zipcode) form.postalCode = data.zipcode
}

if (token.value && profile.value) {
  applyCustomerDefaults(profile.value)
} else if (token.value) {
  try {
    const payload = JSON.parse(atob(String(token.value).split('.')[1] || ''))
    form.email = payload?.email || ''
  } catch {
    // ignore malformed token — guest checkout still works
  }
}

if (token.value) {
  try {
    const response = await api('/api/customers/profile')
    applyCustomerDefaults(response?.data)
  } catch {
    // Keep cookie/JWT defaults if profile fetch fails
  }
}

function validate() {
  errors.customerName = form.customerName ? '' : 'Name is required'
  errors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    ? ''
    : 'Enter a valid email'
  errors.street = form.street ? '' : 'Street is required'
  errors.city = form.city ? '' : 'City is required'
  errors.postalCode = form.postalCode ? '' : 'Postal code is required'

  return !Object.values(errors).some(Boolean)
}

async function placeOrder() {
  const { $toast } = useNuxtApp()
  submitError.value = ''
  if (!cart.items.length) {
    submitError.value = 'Your cart is empty.'
    return
  }
  if (!validate()) return

  submitting.value = true

  const shippingAddress = `${form.street}, ${form.city}, ${form.postalCode}`
  const payload = {
    customerName: form.customerName,
    email: form.email,
    shippingAddress,
    totalAmount: cart.cartTotal,
    items: cart.items.map((item) => ({
      product: item._id,
      quantity: item.quantity,
    })),
  }

  const headers = {}
  if (token.value) {
    headers.Authorization = `Bearer ${token.value}`
  }

  try {
    const response = await $fetch(`${config.public.apiBase}/api/orders`, {
      method: 'POST',
      body: payload,
      headers,
    })

    const orderId = response?.data?._id
    if (!orderId) {
      throw new Error('Order was created but no order ID was returned.')
    }

    $toast?.success('Order placed successfully!')
    cart.clearCart()
    await router.push({
      path: '/order-confirmation',
      query: { id: orderId },
    })
  } catch (error) {
    submitError.value =
      error?.data?.message ||
      error?.message ||
      'Could not place your order. Please try again.'
    $toast?.error('Something went wrong, please try again')
  } finally {
    submitting.value = false
  }
}
</script>
