'use client'

import type { MouseEvent } from 'react'
import type { PassAvailability, RecentPassMint } from '@/lib/founding-pass/pass-collection'
import {
  buildPassPagePath,
  formatPassNumber,
  type PassDesign,
} from '@/lib/founding-pass/pass-design'
import { FavouriteButton } from './favourite-button'
import { PassArt } from './pass-art'
import { PassAvailabilityText } from './pass-availability-text'
import { PassRarityBadge } from './pass-rarity-badge'

type PassCardProps = {
  design: PassDesign
  availability: PassAvailability | null
  recentMint: RecentPassMint | null
  /** Opens the detail sheet. Without JavaScript, or with a modifier key, the link opens the page. */
  onOpen: (designNumber: number) => void
  isArtEager?: boolean
}

export function PassCard({
  design,
  availability,
  recentMint,
  onOpen,
  isArtEager = false,
}: PassCardProps) {
  const isTaken = availability === 'minted' || availability === 'pending'

  function openDetailSheet(event: MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return
    }
    event.preventDefault()
    onOpen(design.designNumber)
  }

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-panel bg-surface">
      <a
        href={buildPassPagePath(design.designNumber)}
        onClick={openDetailSheet}
        className="group flex flex-1 flex-col"
      >
        <PassArt
          design={design}
          view="shoe"
          isEager={isArtEager}
          className={`transition-opacity duration-300 ease-standard ${isTaken ? 'opacity-40 grayscale' : 'group-hover:opacity-85'}`}
        />
        <span className="flex flex-1 flex-col gap-1.5 px-3 pt-3 pb-3.5 md:px-4 md:pb-4">
          <span className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
            <span className="font-mono text-xs">{formatPassNumber(design.designNumber)}</span>
            <PassRarityBadge rarity={design.rarity} />
          </span>
          <span className="text-[0.9375rem] leading-[1.2] md:text-base">{design.name}</span>
          <PassAvailabilityText
            availability={availability}
            recentMint={recentMint}
            className="text-xs leading-[1.3] text-ink-secondary-small"
          />
        </span>
      </a>
      <FavouriteButton
        designNumber={design.designNumber}
        appearance="icon"
        className="absolute top-1 right-1"
      />
    </article>
  )
}
