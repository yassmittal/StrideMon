// How lit the store is, as a few numbers that can move: the film's `darkFront` shot is `dark`,
// every other shot `lit`. Part 2 animates between them (the lights coming on); everything that
// glows or is lit reads them through `useStoreLightingEffect`, so a change never re-renders React.

export type StoreLightingLevels = {
  /** The room's lights, lightboxes and the Sneakers inside (the film's `storeBrightness`). */
  storeBrightness: number
  /** The signs outside: the fascia, the blade sign, the window poster, the neighbours. */
  signBrightness: number
  /** The architecture's tone-mapping exposure (the film's per-shot `exposure`). */
  exposure: number
}

export type StoreLightingPresetName = 'dark' | 'lit'

/**
 * The film's numbers: `ShowroomWorld` (0.18 and 0.55 when dim) and `camera.ts` (exposure 0.45),
 * each times the 0.75 brightness the film's `darkFront` shot settles on as a CSS filter. The
 * showroom puts no filter on the canvas (it would dim the Sneakers' colours), so it's folded in.
 */
const FILM_DARK_FRONT_BRIGHTNESS = 0.75

export const storeLightingPresets: Record<StoreLightingPresetName, StoreLightingLevels> = {
  dark: {
    storeBrightness: 0.18 * FILM_DARK_FRONT_BRIGHTNESS,
    signBrightness: 0.55 * FILM_DARK_FRONT_BRIGHTNESS,
    exposure: 0.45 * FILM_DARK_FRONT_BRIGHTNESS,
  },
  lit: { storeBrightness: 1, signBrightness: 1, exposure: 1 },
}

type StoreLightingListener = (levels: StoreLightingLevels) => void

export class StoreLighting {
  private currentLevels: StoreLightingLevels
  private readonly listeners = new Set<StoreLightingListener>()

  constructor(initialLevels: StoreLightingLevels) {
    this.currentLevels = { ...initialLevels }
  }

  get levels(): StoreLightingLevels {
    return this.currentLevels
  }

  setLevels(levels: StoreLightingLevels): void {
    this.currentLevels = { ...levels }
    for (const listener of this.listeners) listener(this.currentLevels)
  }

  /** Calls the listener now and on every change; returns the unsubscribe. */
  subscribe(listener: StoreLightingListener): () => void {
    this.listeners.add(listener)
    listener(this.currentLevels)
    return () => {
      this.listeners.delete(listener)
    }
  }
}
