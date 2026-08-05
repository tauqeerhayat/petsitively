<template>
  <div class="container content-page account-auth">
    <section class="page-hero">
      <p class="content-page__eyebrow">Account</p>
      <h1>Create account</h1>
      <p>Save your details and track orders after checkout.</p>
    </section>

    <form class="content-card account-auth__form" novalidate @submit.prevent="onSubmit">
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

      <UiField label="Email" required :error="errors.email">
        <UiInput
          v-model="form.email"
          type="email"
          name="email"
          autocomplete="email"
          required
          :disabled="submitting"
        />
      </UiField>

      <UiField label="Password" required :error="errors.password">
        <UiInput
          v-model="form.password"
          type="password"
          name="password"
          autocomplete="new-password"
          required
          :disabled="submitting"
        />
      </UiField>

      <p v-if="submitError" class="ui-field__error" role="alert">{{ submitError }}</p>

      <button class="btn btn--primary" type="submit" :disabled="submitting">
        <UiSpinner v-if="submitting" size="sm" light />
        <span>{{ submitting ? 'Creating…' : 'Create account' }}</span>
      </button>

      <p class="account-auth__switch">
        Already have an account?
        <NuxtLink to="/account/login">Sign in</NuxtLink>
      </p>
    </form>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'customer-auth',
})

usePageSeo({
  title: 'Create account — Petsitively',
  description: 'Create a Petsitively account to save order history and shop for your pets faster.',
  path: '/account/register',
  robots: 'noindex, nofollow',
})

const config = useRuntimeConfig()
const { setSession } = useCustomerApi()

const form = reactive({
  name: '',
  email: '',
  password: '',
})

const errors = reactive({
  name: '',
  email: '',
  password: '',
})

const submitting = ref(false)
const submitError = ref('')

async function onSubmit() {
  submitError.value = ''
  errors.name = form.name.trim() ? '' : 'Name is required'
  errors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ? ''
    : 'Enter a valid email'
  errors.password = form.password.length >= 6 ? '' : 'Password must be at least 6 characters'

  if (Object.values(errors).some(Boolean)) return

  submitting.value = true

  try {
    const response = await $fetch(`${config.public.apiBase}/api/customers/register`, {
      method: 'POST',
      body: {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      },
    })

    setSession(response.token, response.data)
    await navigateTo('/account/orders')
  } catch (error) {
    submitError.value =
      error?.data?.message || error?.message || 'Could not create your account'
  } finally {
    submitting.value = false
  }
}
</script>
