<template>
  <footer class="footer">
    <div class="container footer__inner">
      <div class="footer__brand">
        <NuxtLink to="/" class="footer__logo">
          <span class="footer__mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="24" height="24" fill="none">
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
          Petsitively
        </NuxtLink>
        <p>Thoughtful products for happier companions.</p>
      </div>

      <div class="footer__col">
        <h2>Company</h2>
        <NuxtLink to="/about">Our Story</NuxtLink>
        <NuxtLink to="/blog">Blog</NuxtLink>
        <NuxtLink to="/pet-care-guide">Pet Care Guide</NuxtLink>
      </div>

      <div class="footer__col">
        <h2>Help</h2>
        <NuxtLink to="/track-order">Track Order</NuxtLink>
        <NuxtLink to="/faq">FAQ</NuxtLink>
        <NuxtLink to="/shipping-returns">Shipping & returns</NuxtLink>
        <NuxtLink to="/contact">Contact support</NuxtLink>
      </div>

      <div class="footer__col">
        <h2>Legal</h2>
        <NuxtLink to="/privacy">Privacy Policy</NuxtLink>
        <NuxtLink to="/terms">Terms</NuxtLink>
      </div>

      <div class="footer__col footer__social-col">
        <h2>Follow</h2>
        <div class="footer__social" aria-label="Social media">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="5"
                stroke="currentColor"
                stroke-width="1.8"
              />
              <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.8" />
              <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
            </svg>
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
              <path
                d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.6l.4-3H13v-1.2c0-.4.4-.8.8-.8Z"
              />
            </svg>
          </a>
          <a
            href="https://tiktok.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
              <path
                d="M16.5 4c.4 2.2 1.8 3.8 4 4.2v2.5c-1.5-.1-2.9-.6-4-1.5v5.6c0 3.2-2.5 5.7-5.7 5.7S5 17.9 5 14.7s2.5-5.7 5.7-5.7c.3 0 .6 0 .9.1v2.6a3.1 3.1 0 0 0-.9-.1 3.1 3.1 0 1 0 3.1 3.1V4h2.7Z"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>

    <div class="container footer__bottom">
      <p>© {{ year }} Petsitively. All rights reserved.</p>
    </div>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear()
</script>
