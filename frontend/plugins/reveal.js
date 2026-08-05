export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('reveal', {
    // Required for SSR — client-only plugins crash with getSSRProps undefined
    getSSRProps(binding) {
      const mods = binding.modifiers || {}
      if (mods.stagger) return { class: 'reveal-stagger is-visible' }
      if (mods.fade) return { class: 'reveal reveal--fade is-visible' }
      if (mods.scale) return { class: 'reveal reveal--scale is-visible' }
      return { class: 'reveal is-visible' }
    },

    mounted(el, binding) {
      const mods = binding.modifiers || {}

      if (mods.fade) el.classList.add('reveal--fade')
      if (mods.scale) el.classList.add('reveal--scale')
      if (mods.stagger) el.classList.add('reveal-stagger')
      else el.classList.add('reveal')

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        el.classList.add('is-visible')
        return
      }

      const rect = el.getBoundingClientRect()
      const inView = rect.top < window.innerHeight * 0.92 && rect.bottom > 0

      if (inView) {
        // Force a reflow so the entrance animation can replay on first paint
        el.classList.remove('is-visible')
        // eslint-disable-next-line no-unused-expressions
        el.offsetHeight
        requestAnimationFrame(() => {
          el.classList.add('is-visible')
        })
        return
      }

      el.classList.remove('is-visible')

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
      )

      observer.observe(el)
      el.__revealObserver = observer
    },

    unmounted(el) {
      el.__revealObserver?.disconnect()
      delete el.__revealObserver
    },
  })
})
