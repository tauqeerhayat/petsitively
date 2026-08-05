<template>
  <div class="container content-page account-profile">
    <section class="page-hero">
      <p class="content-page__eyebrow">Account</p>
      <h1>Your profile</h1>
      <p>Update your name and shipping details. Email can’t be changed.</p>
    </section>

    <div v-if="pending" class="content-card account-orders__state">
      <div class="ui-loading">
        <UiSpinner size="lg" />
        <p class="ui-loading__text">Loading your profile…</p>
      </div>
    </div>

    <div v-else-if="loadError" class="content-card account-orders__state account-orders__state--error">
      {{ loadError }}
    </div>

    <form
      v-else
      class="content-card account-profile__form"
      novalidate
      @submit.prevent="onSubmit"
    >
      <UiField label="Name" required :error="errors.name">
        <UiInput
          v-model="form.name"
          type="text"
          name="name"
          autocomplete="name"
          required
          :disabled="submitting"
        />
      </UiField>

      <UiField label="Email" hint="Email cannot be changed" disabled>
        <UiInput
          v-model="form.email"
          type="email"
          name="email"
          autocomplete="email"
          disabled
          readonly
        />
      </UiField>

      <UiField label="Shipping address" :error="errors.shippingAddress">
        <UiInput
          v-model="form.shippingAddress"
          type="text"
          name="shippingAddress"
          autocomplete="street-address"
          :disabled="submitting"
        />
      </UiField>

      <div class="account-profile__row">
        <UiField label="City" :error="errors.city">
          <UiInput
            v-model="form.city"
            type="text"
            name="city"
            autocomplete="address-level2"
            :disabled="submitting"
          />
        </UiField>

        <UiField label="Zip code" :error="errors.zipcode">
          <UiInput
            v-model="form.zipcode"
            type="text"
            name="zipcode"
            autocomplete="postal-code"
            :disabled="submitting"
          />
        </UiField>
      </div>

      <p v-if="submitError" class="ui-field__error" role="alert">{{ submitError }}</p>

      <button class="btn btn--primary" type="submit" :disabled="submitting">
        <UiSpinner v-if="submitting" size="sm" light />
        <span>{{ submitting ? 'Saving…' : 'Save' }}</span>
      </button>
    </form>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'customer-auth',
})

usePageSeo({
  title: 'Your profile — Petsitively',
  description: 'Manage your Petsitively account profile and contact details.',
  path: '/account/profile',
  robots: 'noindex, nofollow',
})

const { api, token, profile, setSession } = useCustomerApi()
const { $toast } = useNuxtApp()

const form = reactive({
  name: '',
  email: '',
  shippingAddress: '',
  city: '',
  zipcode: '',
})

const errors = reactive({
  name: '',
  shippingAddress: '',
  city: '',
  zipcode: '',
})

const pending = ref(true)
const loadError = ref('')
const submitting = ref(false)
const submitError = ref('')

function applyProfile(data) {
  form.name = data?.name || ''
  form.email = data?.email || ''
  form.shippingAddress = data?.shippingAddress || ''
  form.city = data?.city || ''
  form.zipcode = data?.zipcode || ''
}

async function fetchProfile() {
  pending.value = true
  loadError.value = ''

  try {
    const response = await api('/api/customers/profile')
    applyProfile(response?.data)
  } catch (error) {
    loadError.value =
      error?.data?.message || error?.message || 'Could not load your profile'
  } finally {
    pending.value = false
  }
}

async function onSubmit() {
  submitError.value = ''
  errors.name = form.name.trim() ? '' : 'Name is required'

  if (errors.name) return

  submitting.value = true

  try {
    const response = await api('/api/customers/profile', {
      method: 'PUT',
      body: {
        name: form.name.trim(),
        shippingAddress: form.shippingAddress.trim(),
        city: form.city.trim(),
        zipcode: form.zipcode.trim(),
      },
    })

    applyProfile(response?.data)
    setSession(token.value, response?.data || { ...form, ...profile.value })
    $toast?.success('Profile updated')
  } catch (error) {
    submitError.value =
      error?.data?.message || error?.message || 'Could not save your profile'
    $toast?.error(submitError.value)
  } finally {
    submitting.value = false
  }
}

await fetchProfile()
</script>
