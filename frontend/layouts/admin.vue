<template>
  <div class="admin-shell">
    <aside class="admin-sidebar">
      <NuxtLink to="/admin" class="admin-sidebar__brand">
        Petsitively
        <span>Admin</span>
      </NuxtLink>

      <nav class="admin-sidebar__nav" aria-label="Admin">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="admin-sidebar__link"
          :class="{ 'is-active': isNavActive(item.to) }"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>
    </aside>

    <div class="admin-main">
      <header class="admin-topbar">
        <h1 class="admin-topbar__title">{{ pageTitle }}</h1>
        <button type="button" class="btn btn--ghost" @click="onLogout">
          Log out
        </button>
      </header>

      <div class="admin-content">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const { logout } = useAdminApi()

const navItems = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Products', to: '/admin/products' },
  { label: 'Categories', to: '/admin/categories' },
  { label: 'Orders', to: '/admin/orders' },
  { label: 'Messages', to: '/admin/messages' },
  { label: 'Refunds', to: '/admin/refunds' },
]

const pageTitle = computed(() => route.meta.title || 'Admin')

function isNavActive(to) {
  if (to === '/admin') {
    return route.path === '/admin' || route.path === '/admin/'
  }
  return route.path === to || route.path.startsWith(`${to}/`)
}

async function onLogout() {
  await logout()
}
</script>
