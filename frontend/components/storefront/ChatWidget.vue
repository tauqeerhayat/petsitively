<template>
  <div class="chat-widget" :class="{ 'is-open': isOpen }">
    <Transition name="chat-panel">
      <div
        v-if="isOpen"
        class="chat-widget__panel"
        role="dialog"
        aria-label="Petsi chat support"
        aria-modal="false"
      >
        <header class="chat-widget__header">
          <div class="chat-widget__identity">
            <span class="chat-widget__avatar" aria-hidden="true">🐾</span>
            <div>
              <p class="chat-widget__name">Petsi</p>
              <p class="chat-widget__status">Here to help</p>
            </div>
          </div>
          <button
            type="button"
            class="chat-widget__icon-btn"
            aria-label="Close chat"
            @click="close"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6 6 18"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </header>

        <div ref="threadEl" class="chat-widget__thread" aria-live="polite">
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="chat-widget__row"
            :class="msg.role === 'user' ? 'is-user' : 'is-bot'"
          >
            <div class="chat-widget__bubble">
              <p class="chat-widget__text">{{ msg.text }}</p>

              <div v-if="msg.quickReplies?.length" class="chat-widget__quick">
                <button
                  v-for="reply in msg.quickReplies"
                  :key="reply"
                  type="button"
                  class="chat-widget__chip"
                  :disabled="busy"
                  @click="onQuickReply(reply)"
                >
                  {{ reply }}
                </button>
              </div>

              <div v-if="msg.link" class="chat-widget__actions">
                <NuxtLink
                  :to="msg.link.to"
                  class="chat-widget__link-btn"
                  @click="close"
                >
                  {{ msg.link.label }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <form class="chat-widget__composer" @submit.prevent="onSubmit">
          <input
            ref="inputEl"
            v-model="draft"
            type="text"
            class="chat-widget__input"
            :placeholder="inputPlaceholder"
            :disabled="busy"
            autocomplete="off"
            aria-label="Type a message"
          />
          <button
            type="submit"
            class="chat-widget__send"
            :disabled="busy || !draft.trim()"
            aria-label="Send message"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
              <path
                d="M4.5 12h11M12.5 7.5 17 12l-4.5 4.5"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </form>
      </div>
    </Transition>

    <button
      type="button"
      class="chat-widget__fab"
      :aria-label="isOpen ? 'Close chat' : 'Open chat with Petsi'"
      :aria-expanded="isOpen"
      @click="toggle"
    >
      <svg
        v-if="!isOpen"
        viewBox="0 0 24 24"
        width="26"
        height="26"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M5 6.8A2.8 2.8 0 0 1 7.8 4h8.4A2.8 2.8 0 0 1 19 6.8v5.4a2.8 2.8 0 0 1-2.8 2.8H11l-3.6 3.2V15H7.8A2.8 2.8 0 0 1 5 12.2V6.8Z"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linejoin="round"
        />
        <circle cx="9" cy="9.5" r="1" fill="currentColor" />
        <circle cx="12" cy="9.5" r="1" fill="currentColor" />
        <circle cx="15" cy="9.5" r="1" fill="currentColor" />
      </svg>
      <svg v-else viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
        <path
          d="M6 6l12 12M18 6 6 18"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
        />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { matchIntent, isOrderTrackIntent } from '~/utils/faqData'

const WELCOME = "Hi! I'm Petsi 🐾 How can I help?"
const QUICK_REPLIES = [
  'Track My Order',
  'Shipping Info',
  'Return Policy',
  'Contact Support',
]
const FALLBACK_TEXT =
  "Sorry, I didn't quite get that 🐾 Would you like to leave a message for our team?"

const config = useRuntimeConfig()
const { api } = useCustomerApi()
const customerToken = useCookie('customer_token')

const isOpen = ref(false)
const draft = ref('')
const busy = ref(false)
const messages = ref([])
const threadEl = ref(null)
const inputEl = ref(null)

/** null | 'orderId' | 'email' */
const awaiting = ref(null)
const pendingOrderId = ref('')

let msgSeq = 0

const inputPlaceholder = computed(() => {
  if (awaiting.value === 'orderId') return 'Enter your Order ID…'
  if (awaiting.value === 'email') return 'Enter your email…'
  return 'Type a message…'
})

function nextId() {
  msgSeq += 1
  return `m-${msgSeq}`
}

function pushBot(text, extras = {}) {
  messages.value.push({
    id: nextId(),
    role: 'bot',
    text,
    ...extras,
  })
}

function pushUser(text) {
  messages.value.push({
    id: nextId(),
    role: 'user',
    text,
  })
}

function seedWelcome() {
  messages.value = []
  awaiting.value = null
  pendingOrderId.value = ''
  pushBot(WELCOME, { quickReplies: [...QUICK_REPLIES] })
}

async function scrollToBottom() {
  await nextTick()
  const el = threadEl.value
  if (el) el.scrollTop = el.scrollHeight
}

watch(
  () => messages.value.length,
  () => {
    scrollToBottom()
  }
)

function toggle() {
  if (isOpen.value) {
    close()
  } else {
    open()
  }
}

function open() {
  isOpen.value = true
  if (messages.value.length === 0) seedWelcome()
  nextTick(() => inputEl.value?.focus())
}

function close() {
  isOpen.value = false
}

function startOrderTrack() {
  awaiting.value = 'orderId'
  pendingOrderId.value = ''
  pushBot('Sure! Please share your Order ID (full ID or the short code from your confirmation).')
}

function formatStatus(status) {
  if (!status) return 'Pending'
  return String(status).charAt(0).toUpperCase() + String(status).slice(1)
}

async function lookupOrder(orderId, email) {
  busy.value = true
  pushBot('Looking up your order…')

  try {
    const response = customerToken.value
      ? await api('/api/orders/track', { query: { email, orderId } })
      : await $fetch(`${config.public.apiBase}/api/orders/track`, {
          query: { email, orderId },
        })

    const order = response?.data
    if (!order) {
      pushBot(
        "I couldn't find that order. Double-check the Order ID and email, or try the Track Order page.",
        { link: { to: '/track-order', label: 'Open Track Order' } }
      )
      return
    }

    const shortId = String(order._id || '').slice(-8).toUpperCase() || '—'
    const status = formatStatus(order.orderStatus)
    pushBot(
      `Found it! Order #${shortId} is currently: ${status}. Want the full timeline and details?`,
      { link: { to: '/track-order', label: 'View full order details' } }
    )
  } catch (error) {
    pushBot(
      error?.data?.message ||
        error?.message ||
        "I couldn't find that order. Check your details and try again — or open the Track Order page.",
      { link: { to: '/track-order', label: 'Open Track Order' } }
    )
  } finally {
    busy.value = false
    awaiting.value = null
    pendingOrderId.value = ''
  }
}

function pushFallback() {
  pushBot(FALLBACK_TEXT, {
    link: { to: '/contact', label: 'Contact Support' },
  })
}

async function handleUserText(raw) {
  const text = String(raw || '').trim()
  if (!text || busy.value) return

  pushUser(text)
  draft.value = ''

  // Sequential order-track prompts
  if (awaiting.value === 'orderId') {
    const orderId = text.replace(/^#/, '').trim()
    if (!orderId) {
      pushBot('Please enter a valid Order ID.')
      return
    }
    pendingOrderId.value = orderId
    awaiting.value = 'email'
    pushBot('Thanks! Now what’s the email you used at checkout?')
    return
  }

  if (awaiting.value === 'email') {
    const email = text.toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      pushBot('That doesn’t look like a valid email. Please try again.')
      return
    }
    await lookupOrder(pendingOrderId.value, email)
    return
  }

  // Quick-reply / typed order tracking
  if (
    text.toLowerCase() === 'track my order' ||
    isOrderTrackIntent(text)
  ) {
    startOrderTrack()
    return
  }

  const answer = matchIntent(text)
  if (answer) {
    pushBot(answer)
    return
  }

  pushFallback()
}

function onQuickReply(label) {
  if (busy.value) return

  if (label === 'Track My Order') {
    pushUser(label)
    startOrderTrack()
    return
  }

  const intentHints = {
    'Shipping Info': 'shipping delivery time',
    'Return Policy': 'return refund policy',
    'Contact Support': 'contact support help',
  }

  const hint = intentHints[label]
  if (hint) {
    pushUser(label)
    const answer = matchIntent(hint)
    if (answer) {
      pushBot(
        answer,
        label === 'Contact Support'
          ? { link: { to: '/contact', label: 'Go to Contact' } }
          : {}
      )
    } else {
      pushFallback()
    }
    return
  }

  handleUserText(label)
}

function onSubmit() {
  handleUserText(draft.value)
}
</script>
