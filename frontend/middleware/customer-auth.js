export default defineNuxtRouteMiddleware((to) => {
  if (!to.path.startsWith('/account')) {
    return
  }

  const token = useCookie('customer_token')
  const isAuthPage = to.path === '/account/login' || to.path === '/account/register'

  if (!token.value && !isAuthPage) {
    return navigateTo('/account/login')
  }

  if (token.value && isAuthPage) {
    return navigateTo('/account/orders')
  }
})
