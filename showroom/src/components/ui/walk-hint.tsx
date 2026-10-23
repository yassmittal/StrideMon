'use client'

import { useEffect, useState } from 'react'
import { walkCopy } from '@/content/showroom'
import { useSmallStore } from '@/lib/create-small-store'
import { readIsTouchFirst } from '@/lib/use-reduced-motion'
import { visitStore } from '@/lib/visit-store'
import { HINT, STREET_STOP_INDEX } from '@/visit/walk-plan'
import { ChevronIcon } from './icons'

// "Swipe up to walk" (or "Scroll to walk"): once, on arriving inside, and once more if nobody walks
// for a few seconds after (README, "Nobody gets stuck"). The first step hides it for good. It sits
// just above the arrows, so it never covers what the stop shows.

/** The step count when the visitor first arrived inside: kept for the page, so it's one time. */
let stepCountOnArrival: number | null = null

export function WalkHint() {
  const stopIndex = useSmallStore(visitStore, (state) => state.stopIndex)
  const isMoving = useSmallStore(visitStore, (state) => state.isMoving)
  const walkStepCount = useSmallStore(visitStore, (state) => state.walkStepCount)
  const [isShown, setIsShown] = useState(false)
  const [arrivalStepCount, setArrivalStepCount] = useState<number | null>(null)
  const [isTouchFirst, setIsTouchFirst] = useState(false)
  useEffect(() => setIsTouchFirst(readIsTouchFirst()), [])
  const isInside = stopIndex !== STREET_STOP_INDEX

  useEffect(() => {
    if (stepCountOnArrival !== null || !isInside || isMoving) return
    stepCountOnArrival = walkStepCount
    setArrivalStepCount(walkStepCount)
  }, [isInside, isMoving, walkStepCount])

  useEffect(() => {
    if (arrivalStepCount === null) return
    setIsShown(true)
    const hideTimer = window.setTimeout(() => setIsShown(false), HINT.showForMilliseconds)
    const showAgainTimer = window.setTimeout(() => {
      if (visitStore.read().walkStepCount === arrivalStepCount) setIsShown(true)
    }, HINT.showAgainAfterMilliseconds)
    return () => {
      window.clearTimeout(hideTimer)
      window.clearTimeout(showAgainTimer)
    }
  }, [arrivalStepCount])

  const hasWalkedSinceArriving = arrivalStepCount !== null && walkStepCount !== arrivalStepCount
  const isVisible = isShown && !hasWalkedSinceArriving

  return (
    <p
      aria-hidden="true"
      className={`flex items-center gap-2 whitespace-nowrap rounded-full border border-hairline-on-dark bg-dark-panel/75 py-2.5 pr-4 pl-5 font-medium text-on-dark text-xs uppercase backdrop-blur-md transition-opacity duration-500 ease-standard ${isVisible ? 'opacity-100' : 'hidden opacity-0'}`}
    >
      {isTouchFirst ? walkCopy.touchHint : walkCopy.pointerHint}
      <ChevronIcon direction={isTouchFirst ? 'up' : 'down'} />
    </p>
  )
}
