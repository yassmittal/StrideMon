import { type PassRarity, passRarityLabels } from '@/lib/founding-pass/pass-design'

type PassRarityBadgeProps = {
  rarity: PassRarity
  className?: string
}

// Calm on purpose: rarity is only for looks (brief §9). Lime only as a fill behind black text.
const rarityClasses: Record<PassRarity, string> = {
  common: 'text-ink-secondary-small',
  uncommon: 'text-ink',
  rare: 'rounded-full bg-surface-muted px-2 py-0.5 text-ink',
  legendary: 'rounded-full bg-lime px-2 py-0.5 text-ink',
}

export function PassRarityBadge({ rarity, className = '' }: PassRarityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center text-label font-medium tracking-[0.08em] uppercase ${rarityClasses[rarity]} ${className}`}
    >
      {passRarityLabels[rarity]}
    </span>
  )
}
