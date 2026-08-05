export default defineNuxtRouteMiddleware((to) => {
  if (!to.path.startsWith('/admin')) {
    return
  }

  const token = useCookie('admin_token')
  const isLogin = to.path === '/admin/login'

  if (!token.value && !isLogin) {
    return navigateTo('/admin/login')
  }

  if (token.value && isLogin) {
    return navigateTo('/admin/products')
  }
})
