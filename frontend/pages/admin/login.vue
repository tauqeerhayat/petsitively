<template>
  <div class="admin-login">
    <form class="admin-login__card" novalidate @submit.prevent="onSubmit">
      <p class="admin-login__eyebrow">Petsitively</p>
      <h1>Admin sign in</h1>
      <p class="admin-login__lede">Use your admin email and password to continue.</p>

      <UiField label="Email" required>
        <UiInput
          v-model="form.email"
          type="email"
          name="email"
          autocomplete="username"
          required
          :disabled="submitting"
        />
      </UiField>

      <UiField label="Password" required>
        <UiInput
          v-model="form.password"
          type="password"
          name="password"
          autocomplete="current-password"
          required
          :disabled="submitting"
        />
      </UiField>

      <p v-if="errorMessage" class="ui-field__error" role="alert">
        {{ errorMessage }}
      </p>

      <button class="btn btn--primary admin-login__submit" type="submit" :disabled="submitting">
        {{ submitting ? 'Signing in…' : 'Sign in' }}
      </button>
    </form>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'blank',
  middleware: 'admin-auth',
  pageTransition: false,
})

useHead({
  title: 'Admin login — Petsitively',
})

const config = useRuntimeConfig()
const { token } = useAdminApi()

const form = reactive({
  email: '',
  password: '',
})

const submitting = ref(false)
const errorMessage = ref('')

async function onSubmit() {
  errorMessage.value = ''

  const email = form.email.trim()
  const password = form.password

  if (!email || !password) {
    errorMessage.value = 'Email and password are required'
    return
  }

  submitting.value = true

  try {
    const response = await $fetch(`${config.public.apiBase}/api/admin/login`, {
      method: 'POST',
      body: { email, password },
    })

    token.value = response.token
    await navigateTo('/admin/products')
  } catch (error) {
    errorMessage.value =
      error?.data?.message || error?.message || 'Could not sign in. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>
