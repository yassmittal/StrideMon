import type { CSSProperties } from 'react'

const revealStaggerMilliseconds = 80

// Staggers items in a row: each `[data-reveal]` waits a little longer than the one before it.
export function buildRevealDelayStyle(itemIndex: number): CSSProperties {
  return { '--reveal-delay': `${itemIndex * revealStaggerMilliseconds}ms` } as CSSProperties
}
