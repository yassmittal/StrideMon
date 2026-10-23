'use client'

import {
  arrivalCopy,
  buildPassPageUrl,
  lookCloserCopy,
  stopNames,
  storeButtonCopy,
  walkCopy,
} from '@/content/showroom'
import { useSmallStore } from '@/lib/create-small-store'
import { formatPassNumber, passRarityLabels, readPassDesign } from '@/lib/sneaker-design'
import { visitStore } from '@/lib/visit-store'
import { STORE_BUTTON_SPOTS } from '@/store/store-buttons'
import {
  listGroupTargets,
  lookCloserGroupIds,
  readLookCloserTarget,
  readTargetDesignNumber,
} from '@/visit/look-closer-targets'
import { runStoreAction } from '@/visit/store-actions'
import { walkController } from '@/visit/walk-controller'
import { INSIDE_STOP_COUNT, STREET_STOP_INDEX, WALK_STOP_IDS } from '@/visit/walk-plan'

// For keyboards and screen readers (D-068): what the store shows with its lit words and buttons,
// said in words. A line that's announced (where you are, or the Sneaker you're looking at), and the
// stop's buttons and Sneakers as real buttons and links: visually hidden until they hold the
// keyboard's focus, then a small panel.

const REVEAL_ON_FOCUS =
  'sr-only focus-within:not-sr-only focus-within:pointer-events-auto focus-within:absolute focus-within:top-6 focus-within:left-1/2 focus-within:z-30 focus-within:max-h-[50dvh] focus-within:w-[min(22rem,calc(100vw-32px))] focus-within:-translate-x-1/2 focus-within:overflow-y-auto focus-within:rounded-panel focus-within:border focus-within:border-hairline-on-dark focus-within:bg-dark-panel/95 focus-within:p-2'
const ITEM_CLASS =
  'block w-full rounded-[8px] px-2 py-2 text-left text-[14px] text-on-dark hover:bg-white/8'

export function StoreList() {
  const arrivalPhase = useSmallStore(visitStore, (state) => state.arrivalPhase)
  const stopIndex = useSmallStore(visitStore, (state) => state.stopIndex)
  const standDesignNumber = useSmallStore(visitStore, (state) => state.standDesignNumber)
  const lookCloserTargetId = useSmallStore(visitStore, (state) => state.lookCloserTargetId)
  const lookedAt = readLookCloserTarget(lookCloserTargetId)
  const lookedAtDesign =
    lookedAt === null
      ? undefined
      : readPassDesign(readTargetDesignNumber(lookedAt, standDesignNumber))

  const whereYouAre =
    lookedAtDesign !== undefined
      ? `${lookCloserCopy.where(
          formatPassNumber(lookedAtDesign.designNumber),
          lookedAtDesign.name,
          passRarityLabels[lookedAtDesign.rarity],
        )}. ${lookCloserCopy.promise}`
      : stopIndex === STREET_STOP_INDEX
        ? arrivalPhase === 'ready'
          ? arrivalCopy.where
          : arrivalCopy.lightsComingOn
        : walkCopy.whereYouAre(stopIndex, INSIDE_STOP_COUNT, stopNames[stopIndex] ?? '')

  return (
    <>
      <p aria-live="polite" className="sr-only">
        {arrivalPhase === 'waiting' ? '' : whereYouAre}
      </p>
      {arrivalPhase === 'ready' ? (
        <nav aria-label={lookCloserCopy.listLabel} data-ui-panel className={REVEAL_ON_FOCUS}>
          {lookedAtDesign !== undefined ? (
            <ul className="flex flex-col">
              <li>
                <a href={buildPassPageUrl(lookedAtDesign.designNumber)} className={ITEM_CLASS}>
                  {lookCloserCopy.seeIt}
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => walkController.leaveLookCloser()}
                  className={ITEM_CLASS}
                >
                  {lookCloserCopy.back}
                </button>
              </li>
            </ul>
          ) : (
            <StopItems stopIndex={stopIndex} standDesignNumber={standDesignNumber} />
          )}
        </nav>
      ) : null}
    </>
  )
}

function StopItems({
  stopIndex,
  standDesignNumber,
}: {
  stopIndex: number
  standDesignNumber: number
}) {
  const stopId = WALK_STOP_IDS[stopIndex]
  const buttons = STORE_BUTTON_SPOTS.filter((spot) => spot.isListed && spot.stopId === stopId)
  // In the arrows' order: wall by wall, row by row, left to right as seen.
  const targets = lookCloserGroupIds.flatMap((groupId) =>
    listGroupTargets(groupId).filter((target) => target.stopIndex === stopIndex),
  )
  return (
    <ul className="flex flex-col">
      {buttons.map((spot) => (
        <li key={spot.id}>
          <button type="button" onClick={() => runStoreAction(spot.action)} className={ITEM_CLASS}>
            {storeButtonCopy[spot.action]}
          </button>
        </li>
      ))}
      {targets.map((target) => {
        const design = readPassDesign(readTargetDesignNumber(target, standDesignNumber))
        if (design === undefined) return null
        return (
          <li key={target.id}>
            <button
              type="button"
              onClick={() => walkController.lookCloser(target.id)}
              className={ITEM_CLASS}
            >
              {lookCloserCopy.listItem(
                formatPassNumber(design.designNumber),
                design.name,
                passRarityLabels[design.rarity],
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
