<template>
  <div class="container content-page account-auth">
    <section class="page-hero">
      <p class="content-page__eyebrow">Account</p>
      <h1>Sign in</h1>
      <p>Access your order history with your Petsitively account.</p>
    </section>

    <form class="content-card account-auth__form" novalidate @submit.prevent="onSubmit">
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
          autocomplete="current-password"
          required
          :disabled="submitting"
        />
      </UiField>

      <p class="account-auth__forgot">
        <NuxtLink to="/forgot-password">Forgot password?</NuxtLink>
      </p>

      <p v-if="submitError" class="ui-field__error" role="alert">{{ submitError }}</p>

      <button class="btn btn--primary" type="submit" :disabled="submitting">
        <UiSpinner v-if="submitting" size="sm" light />
        <span>{{ submitting ? 'Signing in…' : 'Sign in' }}</span>
      </button>

      <p class="account-auth__switch">
        New here?
        <NuxtLink to="/account/register">Create an account</NuxtLink>
      </p>
    </form>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'customer-auth',
})

usePageSeo({
  title: 'Sign in — Petsitively',
  description: 'Sign in to your Petsitively account to track orders and manage your profile.',
  path: '/account/login',
  robots: 'noindex, nofollow',
})

const config = useRuntimeConfig()
const { setSession } = useCustomerApi()

const form = reactive({
  email: '',
  password: '',
})

const errors = reactive({
  email: '',
  password: '',
})

const submitting = ref(false)
const submitError = ref('')

async function onSubmit() {
  submitError.value = ''
  errors.email = form.email.trim() ? '' : 'Email is required'
  errors.password = form.password ? '' : 'Password is required'

  if (Object.values(errors).some(Boolean)) return

  submitting.value = true

  try {
    const response = await $fetch(`${config.public.apiBase}/api/customers/login`, {
      method: 'POST',
      body: {
        email: form.email.trim(),
        password: form.password,
      },
    })

    setSession(response.token, response.data)
    await navigateTo('/account/orders')
  } catch (error) {
    submitError.value =
      error?.data?.message || error?.message || 'Could not sign in. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>
