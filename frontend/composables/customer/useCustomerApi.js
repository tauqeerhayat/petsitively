/**
 * Authenticated $fetch wrapper for customer API calls.
 * Attaches Bearer token from the customer_token cookie automatically.
 */
export function useCustomerApi() {
  const config = useRuntimeConfig()
  const cookieOptions = {
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
  }

  const token = useCookie('customer_token', cookieOptions)
  const profile = useCookie('customer_profile', cookieOptions)

  const api = $fetch.create({
    baseURL: config.public.apiBase,
    onRequest({ options }) {
      const headers = new Headers(options.headers || {})
      if (token.value) {
        headers.set('Authorization', `Bearer ${token.value}`)
      }
      if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json')
      }
      options.headers = headers
    },
    onResponseError({ response }) {
      if (response?.status === 401) {
        token.value = null
        profile.value = null
        navigateTo('/account/login')
      }
    },
  })

  function setSession(authToken, customer) {
    token.value = authToken
      profile.value = customer
      ? {
          id: customer.id || customer._id || null,
          name: customer.name || '',
          email: customer.email || '',
          shippingAddress: customer.shippingAddress || '',
          city: customer.city || '',
          zipcode: customer.zipcode || '',
        }
      : null
  }

  function logout() {
    token.value = null
    profile.value = null
    return navigateTo('/')
  }

  return { api, token, profile, setSession, logout }
}
