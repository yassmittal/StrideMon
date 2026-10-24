'use client'

import { useEffect } from 'react'
import { visitStore } from '@/lib/visit-store'
import { soundEngine } from './sound-engine'
import { readVisitCues } from './visit-cues'

// The page's side of the sound (D-070): every press is offered to the engine (the first starts
// the music), the page's own buttons and links click, the visit's changes play their cues, Find
// muffles the room, and a hidden tab goes quiet.

/** The sound button handles its own presses: it must never start the music and stop it at once. */
const SOUND_BUTTON_SELECTOR = '[data-sound-button]'

export function useStoreSounds(): void {
  useEffect(() => {
    const onPress = (event: Event) => {
      if (isWithin(event.target, SOUND_BUTTON_SELECTOR)) return
      soundEngine.handlePress()
    }
    const onPointerDown = (event: PointerEvent) => {
      onPress(event)
      if (isOnPressable(event.target)) soundEngine.playCue('press')
    }
    // Enter or Space on a focused button: a click with no pointer behind it.
    const onClick = (event: MouseEvent) => {
      onPress(event)
      if (event.detail === 0 && isOnPressable(event.target)) soundEngine.playCue('press')
    }

    let previous = visitStore.read()
    const unsubscribe = visitStore.subscribe(() => {
      const next = visitStore.read()
      for (const cue of readVisitCues(previous, next)) soundEngine.playCue(cue)
      if (previous.isFindOpen !== next.isFindOpen) soundEngine.setRoomMuffled(next.isFindOpen)
      previous = next
    })
    const onVisibilityChange = () => soundEngine.setPageVisible(!document.hidden)

    // Capture, so a press counts even when its own handler stops it.
    window.addEventListener('pointerdown', onPointerDown, { capture: true })
    window.addEventListener('pointerup', onPress, { capture: true })
    window.addEventListener('click', onClick, { capture: true })
    window.addEventListener('keydown', onPress, { capture: true })
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown, { capture: true })
      window.removeEventListener('pointerup', onPress, { capture: true })
      window.removeEventListener('click', onClick, { capture: true })
      window.removeEventListener('keydown', onPress, { capture: true })
      document.removeEventListener('visibilitychange', onVisibilityChange)
      unsubscribe()
    }
  }, [])
}

function isWithin(target: EventTarget | null, selector: string): boolean {
  return target instanceof Element && target.closest(selector) !== null
}

function isOnPressable(target: EventTarget | null): boolean {
  return (
    isWithin(target, 'a[href], button:not(:disabled), [role="button"]') &&
    !isWithin(target, SOUND_BUTTON_SELECTOR)
  )
}
