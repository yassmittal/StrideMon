'use client'

import { useEffect, useRef } from 'react'
import { buildPassPageUrl, lookCloserCopy, stopNames } from '@/content/showroom'
import {
  findRecentPassMint,
  type PassCollection,
  readPassAvailability,
  readPassSchedulePhase,
} from '@/lib/collection/pass-collection'
import { isMintingPhase } from '@/lib/collection/pass-schedule'
import { type PassCollectionState, usePassCollection } from '@/lib/collection/use-pass-collection'
import { useSmallStore } from '@/lib/create-small-store'
import { formatPassNumber, passRarityLabels, readPassDesign } from '@/lib/sneaker-design'
import { visitStore } from '@/lib/visit-store'
import {
  type LookCloserTarget,
  listGroupTargets,
  readLookCloserTarget,
  readNeighbourTarget,
  readTargetDesignNumber,
} from '@/visit/look-closer-targets'
import { walkController } from '@/visit/walk-controller'
import { WALK_STOP_IDS } from '@/visit/walk-plan'
import { ChevronIcon } from './icons'
import { PillButton, PillLink } from './pill'

// Look closer's card (brief §6.4): a sheet over the bottom of a phone, a small panel at the bottom
// left of a laptop. Number, rarity, name, whether it's minted, the pass's promise, and one button to
// its page on stridemon.xyz. Its neighbours on the same wall and Back are always on it, so one tap
// gets you back to the walk.

export function LookCloserCard() {
  const targetId = useSmallStore(visitStore, (state) => state.lookCloserTargetId)
  const standDesignNumber = useSmallStore(visitStore, (state) => state.standDesignNumber)
  const counterScreenDesignNumber = useSmallStore(
    visitStore,
    (state) => state.counterScreen.designNumber,
  )
  const collectionState = usePassCollection()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const target = readLookCloserTarget(targetId)
  const designNumber =
    target === null
      ? null
      : readTargetDesignNumber(target, { standDesignNumber, counterScreenDesignNumber })

  // A new Sneaker: the card says so to a screen reader and keeps the keyboard on it.
  useEffect(() => {
    if (designNumber !== null) headingRef.current?.focus({ preventScroll: true })
  }, [designNumber])

  if (target === null || designNumber === null) return null
  const design = readPassDesign(designNumber)
  if (design === undefined) return null
  const groupTargets = listGroupTargets(target.groupId)
  const previous = readNeighbourTarget(target, -1)
  const next = readNeighbourTarget(target, 1)
  const buttonLabel = readButtonLabel(collectionState.collection, designNumber)

  return (
    <section
      data-ui-panel
      aria-label={`${formatPassNumber(designNumber)} ${design.name}`}
      className="pointer-events-auto absolute inset-x-0 bottom-0 z-20 flex flex-col gap-3 rounded-t-[16px] border-hairline-on-dark border-t bg-dark-panel/85 px-5 pt-4 pb-[max(20px,env(safe-area-inset-bottom))] backdrop-blur-md sm:inset-x-auto sm:bottom-6 sm:left-6 sm:w-[23rem] sm:rounded-panel sm:border sm:pb-5"
    >
      <p className="font-mono text-label text-on-dark-secondary uppercase">
        {lookCloserCopy.where(
          readPlaceName(target),
          groupTargets.indexOf(target) + 1,
          groupTargets.length,
        )}
      </p>
      <div className="flex flex-col gap-1">
        <p className="flex items-baseline justify-between gap-3 font-mono text-on-dark text-sm uppercase">
          <span>{formatPassNumber(designNumber)}</span>
          <span className="text-label text-on-dark-secondary">
            {passRarityLabels[design.rarity]}
          </span>
        </p>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-[22px] text-on-dark leading-tight outline-none"
        >
          {design.name}
        </h2>
      </div>
      <div className="flex flex-col gap-1">
        <p aria-live="polite" className="font-mono text-label text-lime uppercase">
          {readStateText(collectionState, designNumber)}
        </p>
        <p className="text-[14px] text-on-dark-secondary leading-snug">{lookCloserCopy.promise}</p>
      </div>
      <PillLink
        href={buildPassPageUrl(designNumber)}
        label={buttonLabel}
        variant="light"
        size="regular"
      />
      <div className="flex items-center justify-between gap-3">
        <PillButton
          label={lookCloserCopy.back}
          size="compact"
          onPress={() => walkController.leaveLookCloser()}
        />
        {groupTargets.length > 1 ? (
          <div className="flex gap-2">
            <NeighbourButton
              direction="previous"
              isDisabled={previous === null}
              onPress={() => walkController.stepNeighbour(-1)}
            />
            <NeighbourButton
              direction="next"
              isDisabled={next === null}
              onPress={() => walkController.stepNeighbour(1)}
            />
          </div>
        ) : null}
      </div>
    </section>
  )
}

function NeighbourButton({
  direction,
  isDisabled,
  onPress,
}: {
  direction: 'previous' | 'next'
  isDisabled: boolean
  onPress: () => void
}) {
  return (
    <button
      type="button"
      aria-label={direction === 'previous' ? lookCloserCopy.previous : lookCloserCopy.next}
      disabled={isDisabled}
      onClick={onPress}
      className="flex size-10 items-center justify-center rounded-full border border-hairline-on-dark bg-dark-panel/75 text-on-dark transition-colors duration-300 ease-standard hover:bg-dark-panel active:bg-black disabled:opacity-35"
    >
      <ChevronIcon direction={direction === 'previous' ? 'left' : 'right'} />
    </button>
  )
}

function readPlaceName(target: LookCloserTarget): string {
  if (target.groupId === 'stand') return lookCloserCopy.standPlace
  if (target.design === 'counterScreen') return lookCloserCopy.counterScreenPlace
  if (target.groupId === 'street') return lookCloserCopy.windowPlace
  return stopNames[WALK_STOP_IDS.indexOf(target.groupId)] ?? ''
}

function readStateText(
  { collection, requestStatus }: PassCollectionState,
  designNumber: number,
): string {
  const availability = readPassAvailability(collection, designNumber)
  if (availability === null) {
    return requestStatus === 'loading' ? lookCloserCopy.checking : lookCloserCopy.unknown
  }
  if (availability === 'pending') return lookCloserCopy.pending
  if (availability === 'available') return lookCloserCopy.available
  const recentMint = findRecentPassMint(collection, designNumber)
  return recentMint === null
    ? lookCloserCopy.minted
    : lookCloserCopy.mintedByFounder(recentMint.founderNumber)
}

/** "Mint it" while minting is open and nobody has taken it; "See it" otherwise (D-066). */
function readButtonLabel(collection: PassCollection | null, designNumber: number): string {
  const phase = readPassSchedulePhase(collection, new Date())
  const availability = readPassAvailability(collection, designNumber)
  return isMintingPhase(phase) && availability === 'available'
    ? lookCloserCopy.mintIt
    : lookCloserCopy.seeIt
}
