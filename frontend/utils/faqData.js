/**
 * Local FAQ knowledge for Petsi chat + FAQ pages — no backend calls.
 * Each entry: question, category, keywords, answer.
 */
export const FAQ_CATEGORIES = [
  'Shipping',
  'Returns & Refunds',
  'Payment',
  'Orders',
]

export const faqData = [
  {
    id: 'shipping-time',
    category: 'Shipping',
    question: 'How long does shipping take?',
    keywords: ['shipping', 'delivery', 'kab', 'time', 'arrive', 'days', 'ship', 'kitni', 'dera'],
    answer:
      'Orders typically arrive in 7–15 business days, depending on destination and stock location. Allow 1–3 business days for processing before dispatch. You can also check our Shipping & Returns page for full details.',
  },
  {
    id: 'returns-policy',
    category: 'Returns & Refunds',
    question: 'What is your return and refund policy?',
    keywords: ['return', 'returns', 'refund', 'refunds', 'exchange', 'wapas', 'policy'],
    answer:
      'You may request a return within 30 days of delivery for unused items in original condition and packaging. Once confirmed with our supplier, refunds go to your original payment method within a few business days. Damaged or incorrect items? Contact us with photos within 7 days of delivery.',
  },
  {
    id: 'payment-methods',
    category: 'Payment',
    question: 'What payment methods do you accept?',
    keywords: ['payment', 'pay', 'card', 'methods', 'paid', 'checkout', 'billing'],
    answer:
      'You can place an order through our secure checkout. Payment status is confirmed on your order confirmation email. If a charge looks wrong or payment is stuck on pending, leave us a message via Contact and we’ll sort it out.',
  },
  {
    id: 'cancel-order',
    category: 'Orders',
    question: 'How can I cancel an order?',
    keywords: ['cancel', 'cancellation', 'cancelled', 'band', 'rok', 'stop order'],
    answer:
      'You can cancel an order while it’s still pending/processing from the Track Order page (or your account orders). Once it’s shipped, cancellation isn’t available — you can request a return after delivery instead. Need help? Use Contact Support.',
  },
  {
    id: 'contact-support',
    category: 'Orders',
    question: 'How do I contact support?',
    keywords: ['contact', 'support', 'help', 'email', 'phone', 'reach', 'team', 'message'],
    answer:
      'You can reach our team anytime through the Contact page — we read every message. Share your order ID if it’s about an existing order so we can help faster.',
  },
  {
    id: 'track-order',
    category: 'Orders',
    question: 'How do I track my order?',
    keywords: ['track', 'tracking', 'status', 'where', 'order', 'parcel', 'shipment'],
    answer:
      'Use the Track Order page with the email from checkout and your order ID (or short confirmation code) to see live status. You can also ask Petsi in the chat widget — tap “Track My Order” and follow the prompts.',
  },
  {
    id: 'order-processing',
    category: 'Shipping',
    question: 'How long does order processing take?',
    keywords: ['processing', 'dispatch', 'dispatched', 'packed', 'supplier'],
    answer:
      'After you place an order, allow 1–3 business days for the supplier to confirm and dispatch your items. When a tracking number is available, we share it by email.',
  },
  {
    id: 'damaged-item',
    category: 'Returns & Refunds',
    question: 'What if my item arrives damaged or incorrect?',
    keywords: ['damaged', 'wrong', 'incorrect', 'broken', 'missing', 'defect'],
    answer:
      'Sorry about that! Contact us with photos within 7 days of delivery and we’ll prioritize a replacement or refund. Include your order ID so we can act quickly.',
  },
]

/** Top entries for the homepage FAQ preview. */
export function getTopFaqs(limit = 4) {
  return faqData.slice(0, limit)
}

/**
 * Filter FAQs by free-text query against question, answer, and keywords.
 */
export function filterFaqs(query) {
  const text = String(query || '')
    .toLowerCase()
    .trim()
  if (!text) return faqData

  return faqData.filter((entry) => {
    if (entry.question.toLowerCase().includes(text)) return true
    if (entry.answer.toLowerCase().includes(text)) return true
    return entry.keywords.some((keyword) => keyword.toLowerCase().includes(text) || text.includes(keyword.toLowerCase()))
  })
}

/**
 * Group FAQ entries by category, preserving FAQ_CATEGORIES order.
 * Empty categories are omitted.
 */
export function groupFaqsByCategory(entries = faqData) {
  return FAQ_CATEGORIES.map((category) => ({
    category,
    items: entries.filter((entry) => entry.category === category),
  })).filter((group) => group.items.length > 0)
}

/**
 * Lowercases input and returns the best-matching FAQ answer, or null.
 * Score = number of distinct keywords found in the message.
 */
export function matchIntent(userMessage) {
  const text = String(userMessage || '')
    .toLowerCase()
    .trim()

  if (!text) return null

  let bestAnswer = null
  let bestScore = 0

  for (const entry of faqData) {
    let score = 0
    for (const keyword of entry.keywords) {
      if (text.includes(keyword.toLowerCase())) score += 1
    }
    if (score > bestScore) {
      bestScore = score
      bestAnswer = entry.answer
    }
  }

  return bestScore > 0 ? bestAnswer : null
}

const ORDER_TRACK_PHRASES = [
  'track my order',
  'track order',
  'order status',
  'where is my order',
  "where's my order",
  'order id',
]

/** True when the message looks like an order-tracking request. */
export function isOrderTrackIntent(userMessage) {
  const text = String(userMessage || '')
    .toLowerCase()
    .trim()
  if (!text) return false

  if (ORDER_TRACK_PHRASES.some((phrase) => text.includes(phrase))) return true

  const wantsTrack =
    text.includes('track') ||
    text.includes('tracking') ||
    (text.includes('order') && text.includes('status'))

  if (!wantsTrack) return false

  // Avoid treating return/refund questions as order tracking
  if (text.includes('return') || text.includes('refund')) return false

  return true
}
