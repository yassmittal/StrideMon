'use client'

import { type RefObject, useEffect } from 'react'
import { visitStore } from '@/lib/visit-store'
import { walkController } from './walk-controller'
import { FIRST_INSIDE_STOP_INDEX, INPUT, STREET_STOP_INDEX } from './walk-plan'

// The walk's input (Part 2, step 4), on the element over the whole store. A wheel or trackpad
// scroll and a vertical swipe walk one stop (normalised, with a short lock so one flick is one
// step); a horizontal drag looks around; ↑ ↓ walk; Enter steps inside from the street. On touch,
// a gesture's main axis after a few pixels decides between walking and looking. Presses on links
// and buttons are theirs, never the walk's.

const LINE_HEIGHT_PIXELS = 16

export function useWalkInput(surfaceRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const surface = surfaceRef.current
    if (surface === null) return
    const wheel = createWheelStepper()
    const gesture = createGestureTracker()
    const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return // A trackpad's pinch: the browser's zoom.
      event.preventDefault()
      wheel.handle(event)
    }
    const onPointerDown = (event: PointerEvent) => {
      if (isOnControl(event.target) || !event.isPrimary) return
      gesture.start(event)
      surface.setPointerCapture(event.pointerId)
    }
    const onPointerMove = (event: PointerEvent) => {
      if (gesture.isTracking(event)) {
        gesture.move(event)
        return
      }
      if (isFinePointer && event.pointerType === 'mouse' && event.buttons === 0) {
        walkController.setPointerLook(
          (event.clientX / window.innerWidth) * 2 - 1,
          (event.clientY / window.innerHeight) * 2 - 1,
        )
      }
    }
    const onPointerEnd = (event: PointerEvent) => {
      if (!gesture.isTracking(event)) return
      gesture.end(event)
      if (surface.hasPointerCapture(event.pointerId)) surface.releasePointerCapture(event.pointerId)
    }
    const onPointerLeave = () => walkController.setPointerLook(0, 0)
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || isTypingTarget(event.target)) return
      if (event.key === 'ArrowDown' || event.key === 'PageDown') {
        event.preventDefault()
        walkController.step(1)
      } else if (event.key === 'ArrowUp' || event.key === 'PageUp') {
        event.preventDefault()
        walkController.step(-1)
      } else if (event.key === 'Enter' && !isOnControl(event.target)) {
        const { stopIndex, isMoving } = visitStore.read()
        if (stopIndex === STREET_STOP_INDEX && !isMoving)
          walkController.goTo(FIRST_INSIDE_STOP_INDEX)
      }
    }

    surface.addEventListener('wheel', onWheel, { passive: false })
    surface.addEventListener('pointerdown', onPointerDown)
    surface.addEventListener('pointermove', onPointerMove)
    surface.addEventListener('pointerup', onPointerEnd)
    surface.addEventListener('pointercancel', onPointerEnd)
    surface.addEventListener('pointerleave', onPointerLeave)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      surface.removeEventListener('wheel', onWheel)
      surface.removeEventListener('pointerdown', onPointerDown)
      surface.removeEventListener('pointermove', onPointerMove)
      surface.removeEventListener('pointerup', onPointerEnd)
      surface.removeEventListener('pointercancel', onPointerEnd)
      surface.removeEventListener('pointerleave', onPointerLeave)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [surfaceRef])
}

/** One step per scroll: the wheel locks after a step until it's quiet, or a new flick starts. */
function createWheelStepper() {
  let accumulatedPixels = 0
  let isLocked = false
  let lockedAtMilliseconds = 0
  let lastEventAtMilliseconds = -Infinity
  let lastMagnitude = 0
  return {
    handle(event: WheelEvent) {
      const now = event.timeStamp
      const deltaPixels = readWheelPixels(event)
      const magnitude = Math.abs(deltaPixels)
      const isQuiet = now - lastEventAtMilliseconds > INPUT.wheelQuietMilliseconds
      if (isLocked) {
        const isNewFlick =
          now - lockedAtMilliseconds > INPUT.wheelNewFlickAfterMilliseconds &&
          magnitude > lastMagnitude * INPUT.wheelNewFlickRatio &&
          magnitude > INPUT.swipeMinimumPixels
        if (!isQuiet && !isNewFlick) {
          lastEventAtMilliseconds = now
          lastMagnitude = magnitude
          return
        }
        isLocked = false
        accumulatedPixels = 0
      } else if (isQuiet) {
        accumulatedPixels = 0
      }
      lastEventAtMilliseconds = now
      lastMagnitude = magnitude
      accumulatedPixels += deltaPixels
      if (Math.abs(accumulatedPixels) < INPUT.wheelStepPixels) return
      walkController.step(accumulatedPixels > 0 ? 1 : -1)
      isLocked = true
      lockedAtMilliseconds = now
      accumulatedPixels = 0
    },
  }
}

function readWheelPixels(event: WheelEvent): number {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return event.deltaY * LINE_HEIGHT_PIXELS
  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) return event.deltaY * window.innerHeight
  return event.deltaY
}

/** A press that becomes a swipe (vertical: walk) or a drag (horizontal: look around). */
function createGestureTracker() {
  let pointerId: number | null = null
  let axis: 'undecided' | 'walk' | 'look' = 'undecided'
  let startX = 0
  let startY = 0
  let startedAtMilliseconds = 0
  return {
    isTracking: (event: PointerEvent) => event.pointerId === pointerId,
    start(event: PointerEvent) {
      pointerId = event.pointerId
      axis = 'undecided'
      startX = event.clientX
      startY = event.clientY
      startedAtMilliseconds = event.timeStamp
    },
    move(event: PointerEvent) {
      const acrossPixels = event.clientX - startX
      const downPixels = event.clientY - startY
      if (axis === 'undecided') {
        if (Math.hypot(acrossPixels, downPixels) < INPUT.gestureDecisionPixels) return
        axis = Math.abs(acrossPixels) > Math.abs(downPixels) ? 'look' : 'walk'
        if (axis === 'look') walkController.beginLookDrag()
      }
      if (axis === 'look') {
        walkController.moveLookDrag(
          acrossPixels / window.innerWidth,
          downPixels / window.innerHeight,
        )
      }
    },
    end(event: PointerEvent) {
      if (axis === 'walk' && event.type === 'pointerup') {
        const upPixels = startY - event.clientY
        const elapsedMilliseconds = Math.max(event.timeStamp - startedAtMilliseconds, 1)
        const isLongEnough = Math.abs(upPixels) >= INPUT.swipeStepPixels
        const isFastEnough =
          Math.abs(upPixels) >= INPUT.swipeMinimumPixels &&
          Math.abs(upPixels) / elapsedMilliseconds >= INPUT.swipeStepSpeed
        // Swiping up walks on, as scrolling down does.
        if (isLongEnough || isFastEnough) walkController.step(upPixels > 0 ? 1 : -1)
      }
      pointerId = null
      axis = 'undecided'
    },
  }
}

function isOnControl(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    target.closest('a, button, input, summary, [role="button"]') !== null
  )
}

function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  )
}
