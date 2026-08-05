/**
 * Animate a product thumbnail flying into the navbar cart icon.
 */
export function useFlyToCart() {
  function flyToCart({ fromEl, imageUrl } = {}) {
    if (!import.meta.client || !fromEl) return Promise.resolve()

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      bumpCart()
      return Promise.resolve()
    }

    const cart = document.querySelector('[data-cart-target]')
    if (!cart) return Promise.resolve()

    const from = fromEl.getBoundingClientRect()
    const to = cart.getBoundingClientRect()
    if (!from.width || !to.width) return Promise.resolve()

    const size = Math.min(72, Math.max(40, from.width * 0.35))
    const startX = from.left + from.width / 2 - size / 2
    const startY = from.top + from.height / 2 - size / 2
    const endX = to.left + to.width / 2 - size / 2
    const endY = to.top + to.height / 2 - size / 2

    const flyer = document.createElement('div')
    flyer.className = 'cart-flyer'
    flyer.setAttribute('aria-hidden', 'true')
    flyer.style.width = `${size}px`
    flyer.style.height = `${size}px`
    flyer.style.left = `${startX}px`
    flyer.style.top = `${startY}px`

    if (imageUrl) {
      flyer.style.backgroundImage = `url("${imageUrl}")`
    }

    document.body.appendChild(flyer)

    const midX = startX + (endX - startX) * 0.45
    const midY = Math.min(startY, endY) - 60

    const animation = flyer.animate(
      [
        {
          transform: 'translate3d(0, 0, 0) scale(1)',
          opacity: 1,
          offset: 0,
        },
        {
          transform: `translate3d(${midX - startX}px, ${midY - startY}px, 0) scale(0.85)`,
          opacity: 0.95,
          offset: 0.55,
        },
        {
          transform: `translate3d(${endX - startX}px, ${endY - startY}px, 0) scale(0.25)`,
          opacity: 0.35,
          offset: 1,
        },
      ],
      {
        duration: 680,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'forwards',
      }
    )

    return animation.finished
      .catch(() => {})
      .finally(() => {
        flyer.remove()
        bumpCart()
      })
  }

  function bumpCart() {
    const cart = document.querySelector('[data-cart-target]')
    if (!cart) return
    cart.classList.remove('is-bump')
    // Force reflow so the animation can re-trigger
    void cart.offsetWidth
    cart.classList.add('is-bump')
    window.setTimeout(() => cart.classList.remove('is-bump'), 450)
  }

  return { flyToCart, bumpCart }
}
