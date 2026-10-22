'use client'

import { lookCloserCopy } from '@/content/showroom'
import { useSmallStore } from '@/lib/create-small-store'
import { formatPassNumber, passRarityLabels, readPassDesign } from '@/lib/sneaker-design'
import { visitStore } from '@/lib/visit-store'
import {
  listGroupTargets,
  lookCloserGroupIds,
  readTargetDesignNumber,
} from '@/visit/look-closer-targets'
import { walkController } from '@/visit/walk-controller'

// For keyboards and screen readers (Part 3, step 7): the Sneakers at the current stop as buttons
// that look closer. Visually hidden until it holds the keyboard's focus, then a small panel.

export function SneakerList() {
  const arrivalPhase = useSmallStore(visitStore, (state) => state.arrivalPhase)
  const stopIndex = useSmallStore(visitStore, (state) => state.stopIndex)
  const standDesignNumber = useSmallStore(visitStore, (state) => state.standDesignNumber)
  const counterScreenDesignNumber = useSmallStore(
    visitStore,
    (state) => state.counterScreen.designNumber,
  )
  if (arrivalPhase !== 'ready') return null
  // In the arrows' order: wall by wall, row by row, left to right as seen.
  const targets = lookCloserGroupIds.flatMap((groupId) =>
    listGroupTargets(groupId).filter((target) => target.stopIndex === stopIndex),
  )
  return (
    <nav
      aria-label={lookCloserCopy.listLabel}
      data-ui-panel
      className="sr-only focus-within:not-sr-only focus-within:pointer-events-auto focus-within:absolute focus-within:top-24 focus-within:left-1/2 focus-within:z-30 focus-within:max-h-[50dvh] focus-within:w-[min(22rem,calc(100vw-32px))] focus-within:-translate-x-1/2 focus-within:overflow-y-auto focus-within:rounded-panel focus-within:border focus-within:border-hairline-on-dark focus-within:bg-dark-panel/95 focus-within:p-2"
    >
      <ul className="flex flex-col">
        {targets.map((target) => {
          const designNumber = readTargetDesignNumber(target, {
            standDesignNumber,
            counterScreenDesignNumber,
          })
          const design = readPassDesign(designNumber)
          if (design === undefined) return null
          return (
            <li key={target.id}>
              <button
                type="button"
                onClick={() => walkController.lookCloser(target.id)}
                className="w-full rounded-[8px] px-2 py-2 text-left text-[14px] text-on-dark hover:bg-white/8"
              >
                {lookCloserCopy.listItem(
                  formatPassNumber(designNumber),
                  design.name,
                  passRarityLabels[design.rarity],
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
