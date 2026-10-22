'use client'

import { useEffect, useState } from 'react'
import { arrivalCopy, findCopy, lookCloserCopy, stopNames, walkCopy } from '@/content/showroom'
import { useSmallStore } from '@/lib/create-small-store'
import { readIsTouchFirst } from '@/lib/use-reduced-motion'
import { visitStore } from '@/lib/visit-store'
import { walkController } from '@/visit/walk-controller'
import {
  FIRST_INSIDE_STOP_INDEX,
  INSIDE_STOP_COUNT,
  LAST_STOP_INDEX,
  STREET_STOP_INDEX,
} from '@/visit/walk-plan'
import { openFindSheet } from './find-sheet'
import { ChevronIcon } from './icons'
import { PillButton } from './pill'
import { WalkHint } from './walk-hint'

// The bottom of the screen: where you are and what to do next, always (README, "Nobody gets
// stuck"). On the street, the line, "Step inside" and Find; inside, "2 of 5 · The Rare wall", the
// next step, the arrows, the dots and Find. Looking closer, the card takes its place. The where-you-are line names the stop being walked to, so it's
// right mid-move too, and it's announced.

export function WalkBar() {
  const arrivalPhase = useSmallStore(visitStore, (state) => state.arrivalPhase)
  const stopIndex = useSmallStore(visitStore, (state) => state.stopIndex)
  const isMoving = useSmallStore(visitStore, (state) => state.isMoving)
  const lookCloserTargetId = useSmallStore(visitStore, (state) => state.lookCloserTargetId)
  const notice = useSmallStore(visitStore, (state) => state.notice)
  const isTouchFirst = useIsTouchFirst()
  // Looking closer, the card takes the bottom of the screen (look-closer-card.tsx).
  if (arrivalPhase === 'waiting' || lookCloserTargetId !== null) return null

  const isOnStreet = stopIndex === STREET_STOP_INDEX
  const whereYouAre = isOnStreet
    ? arrivalPhase === 'ready'
      ? arrivalCopy.where
      : arrivalCopy.lightsComingOn
    : walkCopy.whereYouAre(stopIndex, INSIDE_STOP_COUNT, stopNames[stopIndex] ?? '')

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 px-4 pb-[max(20px,env(safe-area-inset-bottom))] sm:px-6 sm:pb-6">
      <div className="flex min-w-0 max-w-[30rem] flex-col items-start gap-3">
        {isOnStreet ? null : <WalkHint />}
        <div
          data-ui-panel
          className="pointer-events-auto flex w-full flex-col gap-2 rounded-panel border border-hairline-on-dark bg-dark-panel/70 px-4 py-3 backdrop-blur-md"
        >
          {notice === null || !isOnStreet ? null : (
            <p role="status" className="text-[14px] text-on-dark-secondary leading-snug">
              {notice}
            </p>
          )}
          <p aria-live="polite" className="font-mono text-label text-on-dark uppercase">
            {whereYouAre}
          </p>
          {isOnStreet ? (
            <StreetNextStep isReady={arrivalPhase === 'ready' && !isMoving} />
          ) : (
            <InsideNextStep stopIndex={stopIndex} isTouchFirst={isTouchFirst} />
          )}
        </div>
        {stopIndex === LAST_STOP_INDEX ? (
          <div className="pointer-events-auto">
            <PillButton
              label={walkCopy.backToStart}
              size="compact"
              onPress={() => walkController.goTo(FIRST_INSIDE_STOP_INDEX)}
            />
          </div>
        ) : null}
      </div>
      {isOnStreet ? null : <StopArrows stopIndex={stopIndex} />}
    </div>
  )
}

function StreetNextStep({ isReady }: { isReady: boolean }) {
  return (
    <div
      className={`flex flex-col items-start gap-4 transition-opacity duration-500 ease-standard ${isReady ? 'opacity-100' : 'pointer-events-none hidden opacity-0'}`}
      aria-hidden={!isReady}
    >
      <p className="max-w-[24rem] text-[17px] text-on-dark leading-snug sm:text-xl">
        {arrivalCopy.line}
      </p>
      {isReady ? (
        <div className="flex flex-wrap items-center gap-2">
          <PillButton
            label={arrivalCopy.stepInside}
            variant="light"
            onPress={() => walkController.goTo(FIRST_INSIDE_STOP_INDEX)}
          />
          <PillButton label={findCopy.open} size="compact" onPress={openFindSheet} />
        </div>
      ) : null}
    </div>
  )
}

function InsideNextStep({ stopIndex, isTouchFirst }: { stopIndex: number; isTouchFirst: boolean }) {
  const isLastStop = stopIndex === LAST_STOP_INDEX
  const nextStopName = stopNames[stopIndex + 1]
  return (
    <>
      <p className="text-[15px] text-on-dark-secondary leading-snug">
        {walkCopy.withLookCloserHint(
          isLastStop || nextStopName === undefined
            ? walkCopy.lastStop
            : walkCopy.nextStep(isTouchFirst, nextStopName),
          isTouchFirst ? lookCloserCopy.tapHint : lookCloserCopy.clickHint,
        )}
      </p>
      <div className="flex items-center justify-between gap-3">
        <StopDots stopIndex={stopIndex} />
        <PillButton label={findCopy.open} size="compact" onPress={openFindSheet} />
      </div>
    </>
  )
}

function StopDots({ stopIndex }: { stopIndex: number }) {
  const insideStopIndexes = Array.from(
    { length: INSIDE_STOP_COUNT },
    (_, offset) => FIRST_INSIDE_STOP_INDEX + offset,
  )
  return (
    <nav aria-label={walkCopy.stopsLabel} className="-mb-1 -ml-2 flex">
      {insideStopIndexes.map((index) => {
        const isCurrent = index === stopIndex
        return (
          <button
            key={index}
            type="button"
            aria-label={walkCopy.goToStop(index, INSIDE_STOP_COUNT, stopNames[index] ?? '')}
            aria-current={isCurrent ? 'step' : undefined}
            onClick={() => walkController.goTo(index)}
            className="group flex size-7 items-center justify-center rounded-full"
          >
            <span
              className={`block h-1.5 rounded-full transition-all duration-400 ease-standard ${isCurrent ? 'w-4 bg-on-dark' : 'w-1.5 bg-white/35 group-hover:bg-white/70'}`}
            />
          </button>
        )
      })}
    </nav>
  )
}

function StopArrows({ stopIndex }: { stopIndex: number }) {
  return (
    <div className="pointer-events-auto flex shrink-0 flex-col gap-2">
      <ArrowButton
        direction="up"
        label={`${walkCopy.previousStop}: ${stopNames[stopIndex - 1] ?? ''}`}
        onPress={() => walkController.step(-1)}
      />
      <ArrowButton
        direction="down"
        label={`${walkCopy.nextStop}: ${stopNames[stopIndex + 1] ?? ''}`}
        isDisabled={stopIndex === LAST_STOP_INDEX}
        onPress={() => walkController.step(1)}
      />
    </div>
  )
}

function ArrowButton({
  direction,
  label,
  isDisabled = false,
  onPress,
}: {
  direction: 'up' | 'down'
  label: string
  isDisabled?: boolean
  onPress: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={isDisabled}
      onClick={onPress}
      className="flex size-11 items-center justify-center rounded-full border border-hairline-on-dark bg-dark-panel/75 text-on-dark backdrop-blur-md transition-colors duration-300 ease-standard hover:bg-dark-panel active:bg-black disabled:opacity-35"
    >
      <ChevronIcon direction={direction} />
    </button>
  )
}

/** Read after mounting: the server doesn't know the device. */
function useIsTouchFirst(): boolean {
  const [isTouchFirst, setIsTouchFirst] = useState(false)
  useEffect(() => setIsTouchFirst(readIsTouchFirst()), [])
  return isTouchFirst
}
