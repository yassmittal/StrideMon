'use client'

import { useEffect } from 'react'

// Fades `[data-reveal]` elements in once as they enter the viewport. The inline script in the
// layout only arms this (adds `reveal-ready`) when motion is allowed.
export function RevealObserver() {
  useEffect(() => {
    const root = document.documentElement
    window.__strideMonRevealReady = true
    if (!root.classList.contains('reveal-ready')) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-revealed')
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    for (const element of document.querySelectorAll('[data-reveal]')) {
      observer.observe(element)
    }
    return () => observer.disconnect()
  }, [])

  return null
}
