// How lit the store is, as a few numbers that can move: the film's `darkFront` shot is `dark`,
// every other shot `lit`. The arrival animates between them (the lights coming on, Part 2);
// everything that glows or is lit reads them through `useStoreLightingEffect`, so a change never
// re-renders React.

/** The four rows of downlights, from the glass to the back (room.tsx). */
export const DOWNLIGHT_ROW_COUNT = 4

export type StoreLightingLevels = {
  /** The lightboxes, prints, niches, the Sneakers and the stand (the film's `storeBrightness`). */
  storeBrightness: number
  /** Each row of downlights, from the glass to the back. The room's own light follows them. */
  downlightRowBrightness: readonly number[]
  /** The LED coves and shelf strips inside (D-065: they come on with the store). */
  ledBrightness: number
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
const DARK_STORE_BRIGHTNESS = 0.18 * FILM_DARK_FRONT_BRIGHTNESS

export const storeLightingPresets: Record<StoreLightingPresetName, StoreLightingLevels> = {
  dark: {
    storeBrightness: DARK_STORE_BRIGHTNESS,
    downlightRowBrightness: Array.from(
      { length: DOWNLIGHT_ROW_COUNT },
      () => DARK_STORE_BRIGHTNESS,
    ),
    // The film keeps the LEDs on here; the showroom dims them so they can come on (D-065).
    ledBrightness: DARK_STORE_BRIGHTNESS,
    signBrightness: 0.55 * FILM_DARK_FRONT_BRIGHTNESS,
    exposure: 0.45 * FILM_DARK_FRONT_BRIGHTNESS,
  },
  lit: {
    storeBrightness: 1,
    downlightRowBrightness: Array.from({ length: DOWNLIGHT_ROW_COUNT }, () => 1),
    ledBrightness: 1,
    signBrightness: 1,
    exposure: 1,
  },
}

/** The room's soft light at a depth: the mean of the rows around it. */
export function readRoomLightLevel(levels: StoreLightingLevels, rowIndexes: readonly number[]) {
  const total = rowIndexes.reduce(
    (sum, rowIndex) => sum + (levels.downlightRowBrightness[rowIndex] ?? levels.storeBrightness),
    0,
  )
  return total / Math.max(rowIndexes.length, 1)
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
