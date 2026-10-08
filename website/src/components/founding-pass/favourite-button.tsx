'use client'

import { passCardContent } from '@/content/founding-pass'
import { formatPassNumber } from '@/lib/founding-pass/pass-design'
import { toggleFavouritePass, useFavouritePasses } from '@/lib/founding-pass/use-favourite-passes'

type FavouriteButtonProps = {
  designNumber: number
  /** `icon`: a round heart on the art. `pill`: a heart with its label. */
  appearance: 'icon' | 'pill'
  className?: string
}

/** Hearts a pass in this browser (D-044). */
export function FavouriteButton({
  designNumber,
  appearance,
  className = '',
}: FavouriteButtonProps) {
  const favouriteDesignNumbers = useFavouritePasses()
  const isFavourite = favouriteDesignNumbers.includes(designNumber)
  const label = isFavourite
    ? passCardContent.removeFavouriteLabel
    : passCardContent.addFavouriteLabel
  const heart = <HeartIcon isFilled={isFavourite} />

  if (appearance === 'pill') {
    return (
      <button
        type="button"
        aria-pressed={isFavourite}
        onClick={() => toggleFavouritePass(designNumber)}
        className={`inline-flex h-10 items-center gap-2 rounded-full bg-surface-muted px-4 text-xs leading-[1.15] font-medium uppercase transition-colors duration-300 ease-standard active:bg-surface ${className}`}
      >
        {heart}
        {label}
      </button>
    )
  }
  return (
    <button
      type="button"
      aria-pressed={isFavourite}
      aria-label={`${label}: ${formatPassNumber(designNumber)}`}
      onClick={() => toggleFavouritePass(designNumber)}
      className={`flex size-11 items-center justify-center rounded-full transition-colors duration-300 ease-standard active:bg-surface-muted ${className}`}
    >
      {heart}
    </button>
  )
}

function HeartIcon({ isFilled }: { isFilled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="size-[18px] shrink-0"
      viewBox="0 0 18 18"
      fill={isFilled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    >
      <path d="M9 15.2s-6-3.6-6-8.1A3.3 3.3 0 0 1 9 5a3.3 3.3 0 0 1 6 2.1c0 4.5-6 8.1-6 8.1Z" />
    </svg>
  )
}
