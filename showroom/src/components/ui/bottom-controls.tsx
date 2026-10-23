'use client'

import { useEffect, useState } from 'react'
import { arrivalCopy, lookCloserCopy, stopNames, walkCopy } from '@/content/showroom'
import { useSmallStore } from '@/lib/create-small-store'
import { visitStore } from '@/lib/visit-store'
import {
  listGroupTargets,
  readLookCloserTarget,
  readNeighbourTarget,
} from '@/visit/look-closer-targets'
import { walkController } from '@/visit/walk-controller'
import {
  FIRST_INSIDE_STOP_INDEX,
  INSIDE_STOP_COUNT,
  LAST_STOP_INDEX,
  STREET_STOP_INDEX,
} from '@/visit/walk-plan'
import { ChevronIcon, CloseIcon } from './icons'
import { WalkHint } from './walk-hint'

// The little that's left over the canvas (D-068): at a stop, the dots and ⌃ ⌄; on the street, ⌄
// to step inside; looking closer, ‹ ✕ ›. No words but the one-time hint and a notice that fades.
// Everything else is in the store. Round, dark, quiet: the Lusion look.

/** How long a notice (a bad deep link) stays before it fades. */
const NOTICE_MILLISECONDS = 7000

export function BottomControls() {
  const arrivalPhase = useSmallStore(visitStore, (state) => state.arrivalPhase)
  const stopIndex = useSmallStore(visitStore, (state) => state.stopIndex)
  const isMoving = useSmallStore(visitStore, (state) => state.isMoving)
  const lookCloserTargetId = useSmallStore(visitStore, (state) => state.lookCloserTargetId)
  if (arrivalPhase !== 'ready') return null

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-3 px-4 pb-[max(20px,env(safe-area-inset-bottom))] sm:px-6 sm:pb-6">
      <Notice />
      {lookCloserTargetId !== null ? (
        <LookCloserControls targetId={lookCloserTargetId} />
      ) : stopIndex === STREET_STOP_INDEX ? (
        <div className="flex w-full justify-end">
          <RoundButton
            label={arrivalCopy.stepInside}
            isDisabled={isMoving}
            onPress={() => walkController.goTo(FIRST_INSIDE_STOP_INDEX)}
          >
            <ChevronIcon direction="down" />
          </RoundButton>
        </div>
      ) : (
        <div className="flex w-full items-end justify-between gap-4">
          <StopDots stopIndex={stopIndex} />
          <div className="flex flex-col items-end gap-2">
            <WalkHint />
            <RoundButton
              label={`${walkCopy.previousStop}: ${stopNames[stopIndex - 1] ?? ''}`}
              onPress={() => walkController.step(-1)}
            >
              <ChevronIcon direction="up" />
            </RoundButton>
            <RoundButton
              label={`${walkCopy.nextStop}: ${stopNames[stopIndex + 1] ?? ''}`}
              isDisabled={stopIndex === LAST_STOP_INDEX}
              onPress={() => walkController.step(1)}
            >
              <ChevronIcon direction="down" />
            </RoundButton>
          </div>
        </div>
      )}
    </div>
  )
}

function LookCloserControls({ targetId }: { targetId: string }) {
  const target = readLookCloserTarget(targetId)
  if (target === null) return null
  const hasNeighbours = listGroupTargets(target.groupId).length > 1
  return (
    <div className="flex items-center gap-3">
      {hasNeighbours ? (
        <RoundButton
          label={lookCloserCopy.previous}
          isDisabled={readNeighbourTarget(target, -1) === null}
          onPress={() => walkController.stepNeighbour(-1)}
        >
          <ChevronIcon direction="left" />
        </RoundButton>
      ) : null}
      <RoundButton label={lookCloserCopy.back} onPress={() => walkController.leaveLookCloser()}>
        <CloseIcon />
      </RoundButton>
      {hasNeighbours ? (
        <RoundButton
          label={lookCloserCopy.next}
          isDisabled={readNeighbourTarget(target, 1) === null}
          onPress={() => walkController.stepNeighbour(1)}
        >
          <ChevronIcon direction="right" />
        </RoundButton>
      ) : null}
    </div>
  )
}

function StopDots({ stopIndex }: { stopIndex: number }) {
  const insideStopIndexes = Array.from(
    { length: INSIDE_STOP_COUNT },
    (_, offset) => FIRST_INSIDE_STOP_INDEX + offset,
  )
  return (
    <nav aria-label={walkCopy.stopsLabel} className="pointer-events-auto -ml-2 flex">
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
              className={`block h-1.5 rounded-full shadow-[0_0_6px_rgba(0,0,0,0.5)] transition-all duration-400 ease-standard ${isCurrent ? 'w-4 bg-on-dark' : 'w-1.5 bg-white/45 group-hover:bg-white/80'}`}
            />
          </button>
        )
      })}
    </nav>
  )
}

function RoundButton({
  label,
  isDisabled = false,
  onPress,
  children,
}: {
  label: string
  isDisabled?: boolean
  onPress: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={isDisabled}
      onClick={onPress}
      className="pointer-events-auto flex size-11 items-center justify-center rounded-full border border-hairline-on-dark bg-dark-panel/70 text-on-dark backdrop-blur-md transition-colors duration-300 ease-standard hover:bg-dark-panel active:bg-black disabled:opacity-35"
    >
      {children}
    </button>
  )
}

/** A calm line that fades by itself: a deep link to a Sneaker that doesn't exist. */
function Notice() {
  const notice = useSmallStore(visitStore, (state) => state.notice)
  const [isVisible, setIsVisible] = useState(false)
  useEffect(() => {
    if (notice === null) return
    setIsVisible(true)
    const hideTimer = window.setTimeout(() => setIsVisible(false), NOTICE_MILLISECONDS)
    const clearTimer = window.setTimeout(
      () => visitStore.update({ notice: null }),
      NOTICE_MILLISECONDS + 600,
    )
    return () => {
      window.clearTimeout(hideTimer)
      window.clearTimeout(clearTimer)
    }
  }, [notice])
  if (notice === null) return null
  return (
    <p
      role="status"
      className={`max-w-[24rem] rounded-panel border border-hairline-on-dark bg-dark-panel/75 px-4 py-2.5 text-center text-[14px] text-on-dark leading-snug backdrop-blur-md transition-opacity duration-500 ease-standard ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      {notice}
    </p>
  )
}
