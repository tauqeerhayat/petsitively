<template>
  <div class="container content-page account-auth">
    <section class="page-hero">
      <p class="content-page__eyebrow">Account</p>
      <h1>Reset password</h1>
      <p>Choose a new password for your Petsitively account.</p>
    </section>

    <form class="content-card account-auth__form" novalidate @submit.prevent="onSubmit">
      <UiField label="New password" required :error="errors.password">
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
        <span>{{ submitting ? 'Updating…' : 'Reset password' }}</span>
      </button>

      <p class="account-auth__switch">
        <NuxtLink to="/account/login">Back to sign in</NuxtLink>
      </p>
    </form>
  </div>
</template>

<script setup>
const route = useRoute()
const config = useRuntimeConfig()
const { $toast } = useNuxtApp()

usePageSeo({
  title: 'Reset password — Petsitively',
  description: 'Choose a new password for your Petsitively account.',
  path: '/reset-password',
  robots: 'noindex, nofollow',
})

const form = reactive({
  password: '',
})

const errors = reactive({
  password: '',
})

const submitting = ref(false)
const submitError = ref('')

async function onSubmit() {
  submitError.value = ''
  errors.password =
    form.password.length >= 6 ? '' : 'Password must be at least 6 characters'

  if (errors.password) return

  const token = String(route.params.token || '')
  if (!token) {
    submitError.value = 'Invalid or missing reset token'
    return
  }

  submitting.value = true

  try {
    await $fetch(`${config.public.apiBase}/api/customers/reset-password/${token}`, {
      method: 'POST',
      body: {
        password: form.password,
      },
    })

    $toast?.success('Password reset successfully. You can sign in now.')
    await navigateTo('/account/login')
  } catch (error) {
    submitError.value =
      error?.data?.message || error?.message || 'Could not reset password. The link may have expired.'
  } finally {
    submitting.value = false
  }
}
</script>
