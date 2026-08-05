/**
 * Lightweight scroll-reveal using IntersectionObserver.
 * Only toggles a class — animation runs in CSS (transform/opacity).
 */
export function useReveal(options = {}) {
  const {
    rootMargin = '0px 0px -8% 0px',
    threshold = 0.12,
    once = true,
  } = options

  let observer

  const observe = (el) => {
    if (!import.meta.client || !el) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('is-visible')
      return
    }

    if (!observer) {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue
            entry.target.classList.add('is-visible')
            if (once) observer.unobserve(entry.target)
          }
        },
        { rootMargin, threshold }
      )
    }

    observer.observe(el)
  }

  const revealRef = (el) => {
    observe(el)
  }

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = undefined
  })

  return { revealRef, observe }
}
