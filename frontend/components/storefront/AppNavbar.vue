<template>
  <header class="navbar">
    <div class="container navbar__inner">
      <NuxtLink to="/" class="navbar__logo" aria-label="Petsitively home">
        <span class="navbar__mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
            <path
              d="M16 28c-1.2-1.1-6.8-5.3-9.4-9.4C4.2 14.7 4 11.2 6.1 9.2c1.7-1.6 4.3-1.5 6.1.3L16 13l3.8-3.5c1.8-1.8 4.4-1.9 6.1-.3 2.1 2 1.9 5.5-.5 9.4C22.8 22.7 17.2 26.9 16 28Z"
              fill="currentColor"
            />
            <circle cx="8.2" cy="7.2" r="2.4" fill="currentColor" />
            <circle cx="23.8" cy="7.2" r="2.4" fill="currentColor" />
            <circle cx="5.6" cy="13.2" r="2.1" fill="currentColor" />
            <circle cx="26.4" cy="13.2" r="2.1" fill="currentColor" />
          </svg>
        </span>
        <span class="navbar__wordmark">Petsitively</span>
      </NuxtLink>

      <nav
        id="primary-nav"
        class="navbar__links"
        :class="{ 'is-open': menuOpen }"
        aria-label="Primary"
      >
        <NuxtLink to="/" @click="closeMenu">Home</NuxtLink>
        <NuxtLink to="/about" @click="closeMenu">About</NuxtLink>
        <NuxtLink to="/faq" @click="closeMenu">FAQ</NuxtLink>
        <NuxtLink to="/contact" @click="closeMenu">Contact</NuxtLink>
        <NuxtLink to="/track-order" @click="closeMenu">Track Order</NuxtLink>
      </nav>

      <div class="navbar__actions">
        <NuxtLink
          to="/cart"
          class="navbar__cart"
          data-cart-target
          :aria-label="`Cart, ${cart.cartCount} items`"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
            <path
              d="M3 5h2l1.2 9.2a2 2 0 0 0 2 1.8h8.5a2 2 0 0 0 2-1.6L20 8H7"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <circle cx="10" cy="20" r="1.4" fill="currentColor" />
            <circle cx="17" cy="20" r="1.4" fill="currentColor" />
          </svg>
          <span v-if="cart.cartCount > 0" class="navbar__cart-count">{{ cart.cartCount }}</span>
        </NuxtLink>

        <div v-if="isLoggedIn" ref="accountMenuRef" class="navbar__account-wrap">
          <button
            type="button"
            class="navbar__account"
            :class="{ 'is-open': accountMenuOpen }"
            :aria-label="accountLabel"
            :title="accountLabel"
            :aria-expanded="accountMenuOpen"
            aria-haspopup="menu"
            aria-controls="account-menu"
            @click="accountMenuOpen = !accountMenuOpen"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
              <circle cx="12" cy="8" r="3.25" stroke="currentColor" stroke-width="1.8" />
              <path
                d="M5.5 19.25c1.6-3.1 4-4.75 6.5-4.75s4.9 1.65 6.5 4.75"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
            </svg>
          </button>

          <div
            v-show="accountMenuOpen"
            id="account-menu"
            class="navbar__dropdown"
            role="menu"
            aria-label="Account menu"
          >
            <NuxtLink to="/account/profile" role="menuitem" @click="closeAccountMenu">
              Profile
            </NuxtLink>
            <NuxtLink to="/account/orders" role="menuitem" @click="closeAccountMenu">
              Order History
            </NuxtLink>
            <button type="button" role="menuitem" class="navbar__dropdown-logout" @click="onLogout">
              Logout
            </button>
          </div>
        </div>

        <NuxtLink v-else to="/account/login" class="navbar__login btn btn--ghost btn--sm">
          Log in
        </NuxtLink>

        <button
          class="navbar__toggle"
          type="button"
          :aria-expanded="menuOpen"
          aria-controls="primary-nav"
          aria-label="Toggle menu"
          @click="menuOpen = !menuOpen"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
const cart = useCartStore()
const { token, profile, logout } = useCustomerApi()
const menuOpen = ref(false)
const accountMenuOpen = ref(false)
const accountMenuRef = ref(null)
const route = useRoute()

const isLoggedIn = computed(() => Boolean(token.value))
const accountLabel = computed(() => {
  const name = profile.value?.name
  return name ? `Account — ${name}` : 'Your account'
})

function closeMenu() {
  menuOpen.value = false
}

function closeAccountMenu() {
  accountMenuOpen.value = false
}

async function onLogout() {
  closeAccountMenu()
  closeMenu()
  await logout()
}

function onDocumentClick(event) {
  if (!accountMenuOpen.value || !accountMenuRef.value) return
  if (!accountMenuRef.value.contains(event.target)) {
    accountMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
})

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false
    accountMenuOpen.value = false
  }
)
</script>
