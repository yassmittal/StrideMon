type MetaLabelProps = {
  items: readonly string[]
  tone?: 'light' | 'dark'
  className?: string
}

// Tiny uppercase metadata joined by bullets: STRIDEMON • MOVE TO EARN • MONAD.
export function MetaLabel({ items, tone = 'light', className = '' }: MetaLabelProps) {
  const colorClass = tone === 'dark' ? 'text-on-dark-secondary' : 'text-ink-secondary-small'
  return (
    <p className={`text-label font-medium uppercase tracking-[0.08em] ${colorClass} ${className}`}>
      {items.join(' • ')}
    </p>
  )
}
