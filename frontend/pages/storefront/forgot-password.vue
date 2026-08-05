<template>
  <div class="container content-page account-auth">
    <section class="page-hero">
      <p class="content-page__eyebrow">Account</p>
      <h1>Forgot password</h1>
      <p>Enter your email and we’ll send a reset link if an account exists.</p>
    </section>

    <div v-if="sent" class="content-card account-auth__sent">
      <p class="contact-form__success">Check your email</p>
      <p>
        If an account with that address exists, we’ve sent a password reset link. It expires in
        one hour.
      </p>
      <NuxtLink to="/account/login" class="btn btn--primary">Back to sign in</NuxtLink>
    </div>

    <form v-else class="content-card account-auth__form" novalidate @submit.prevent="onSubmit">
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

      <p v-if="submitError" class="ui-field__error" role="alert">{{ submitError }}</p>

      <button class="btn btn--primary" type="submit" :disabled="submitting">
        <UiSpinner v-if="submitting" size="sm" light />
        <span>{{ submitting ? 'Sending…' : 'Send reset link' }}</span>
      </button>

      <p class="account-auth__switch">
        Remembered it?
        <NuxtLink to="/account/login">Sign in</NuxtLink>
      </p>
    </form>
  </div>
</template>

<script setup>
usePageSeo({
  title: 'Forgot password — Petsitively',
  description: 'Reset your Petsitively account password.',
  path: '/forgot-password',
  robots: 'noindex, nofollow',
})

const config = useRuntimeConfig()

const form = reactive({
  email: '',
})

const errors = reactive({
  email: '',
})

const submitting = ref(false)
const submitError = ref('')
const sent = ref(false)

async function onSubmit() {
  submitError.value = ''
  errors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ? ''
    : 'Enter a valid email'

  if (errors.email) return

  submitting.value = true

  try {
    await $fetch(`${config.public.apiBase}/api/customers/forgot-password`, {
      method: 'POST',
      body: {
        email: form.email.trim(),
      },
    })
    sent.value = true
  } catch (error) {
    submitError.value =
      error?.data?.message || error?.message || 'Could not send reset email. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>
