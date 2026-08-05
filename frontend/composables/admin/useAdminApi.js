/**
 * Authenticated $fetch wrapper for admin API calls.
 * Attaches Bearer token from the admin_token cookie automatically.
 */
export function useAdminApi() {
  const config = useRuntimeConfig()
  const token = useCookie('admin_token', {
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
  })

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
        navigateTo('/admin/login')
      }
    },
  })

  function logout() {
    token.value = null
    return navigateTo('/admin/login')
  }

  return { api, token, logout }
}
