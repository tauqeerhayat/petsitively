<template>
  <div class="container content-page">
    <section v-reveal class="page-hero">
      <p class="content-page__eyebrow">Say hello</p>
      <h1>Contact us</h1>
      <p>Questions about an order, a product, or our policies? Send a note — we read every message.</p>
    </section>

    <form v-reveal class="content-card contact-form" novalidate @submit.prevent="submitForm">
      <label class="field">
        <span class="field__label">Name</span>
        <input
          v-model.trim="form.name"
          type="text"
          name="name"
          autocomplete="name"
          required
          :disabled="submitting"
        />
        <span v-if="errors.name" class="field__error">{{ errors.name }}</span>
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

      <label class="field">
        <span class="field__label">Message</span>
        <textarea
          v-model.trim="form.message"
          name="message"
          rows="5"
          required
          :disabled="submitting"
        />
        <span v-if="errors.message" class="field__error">{{ errors.message }}</span>
      </label>

      <p v-if="successMessage" class="contact-form__success" role="status">
        {{ successMessage }}
      </p>

      <p v-if="submitError" class="field__error" role="alert">
        {{ submitError }}
      </p>

      <button class="btn btn--primary" type="submit" :disabled="submitting">
        <UiSpinner v-if="submitting" size="sm" light />
        <span>{{ submitting ? 'Sending…' : 'Send message' }}</span>
      </button>
    </form>
  </div>
</template>

<script setup>
usePageSeo({
  title: 'Contact Petsitively',
  description:
    'Contact Petsitively for order and product support. We read every message about shipping, returns, and pet product questions.',
  path: '/contact',
})

const config = useRuntimeConfig()
const { $toast } = useNuxtApp()

const form = reactive({
  name: '',
  email: '',
  message: '',
})

const errors = reactive({
  name: '',
  email: '',
  message: '',
})

const submitting = ref(false)
const successMessage = ref('')
const submitError = ref('')

function validate() {
  errors.name = form.name ? '' : 'Name is required'
  errors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? '' : 'Enter a valid email'
  errors.message = form.message.length >= 10 ? '' : 'Please write at least 10 characters'
  return !Object.values(errors).some(Boolean)
}

async function submitForm() {
  successMessage.value = ''
  submitError.value = ''
  if (!validate()) return

  submitting.value = true

  try {
    await $fetch(`${config.public.apiBase}/api/contact`, {
      method: 'POST',
      body: {
        name: form.name,
        email: form.email,
        message: form.message,
      },
    })

    successMessage.value = 'Thanks! Your message was sent successfully.'
    $toast?.success('Message sent successfully!')
    form.name = ''
    form.email = ''
    form.message = ''
  } catch (error) {
    submitError.value =
      error?.data?.message ||
      error?.message ||
      'Could not send your message. Please try again.'
    $toast?.error('Something went wrong, please try again')
  } finally {
    submitting.value = false
  }
}
</script>
