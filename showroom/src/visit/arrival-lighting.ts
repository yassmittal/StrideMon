import { MathUtils } from 'three'
import {
  DOWNLIGHT_ROW_COUNT,
  type StoreLightingLevels,
  storeLightingPresets,
} from '@/store/store-lighting'
import { ARRIVAL } from './walk-plan'

// The lights coming on (brief §4, the film's `darkFront` → `litFront`): the downlights row by row
// from the glass to the back, then the lightboxes, the Sneakers, the signs and the LEDs. Each fades
// in on a smooth curve, so nothing flickers.

const { dark, lit } = storeLightingPresets

/** How far a fade that starts at `startSeconds` has come, eased in and out. */
function readFade(elapsedSeconds: number, startSeconds: number, fadeSeconds: number): number {
  return MathUtils.smoothstep(elapsedSeconds, startSeconds, startSeconds + fadeSeconds)
}

/** The store's light levels `elapsedSeconds` into the arrival. */
export function readArrivalLighting(elapsedSeconds: number): StoreLightingLevels {
  const rows = Array.from({ length: DOWNLIGHT_ROW_COUNT }, (_, rowIndex) =>
    readFade(
      elapsedSeconds,
      ARRIVAL.firstRowStartSeconds + rowIndex * ARRIVAL.rowStaggerSeconds,
      ARRIVAL.rowFadeSeconds,
    ),
  )
  const store = readFade(elapsedSeconds, ARRIVAL.storeStartSeconds, ARRIVAL.storeFadeSeconds)
  const led = readFade(elapsedSeconds, ARRIVAL.ledStartSeconds, ARRIVAL.ledFadeSeconds)
  const exposure = readFade(
    elapsedSeconds,
    ARRIVAL.firstRowStartSeconds,
    ARRIVAL.storeStartSeconds + ARRIVAL.storeFadeSeconds - ARRIVAL.firstRowStartSeconds,
  )
  return {
    storeBrightness: MathUtils.lerp(dark.storeBrightness, lit.storeBrightness, store),
    downlightRowBrightness: rows.map((row, rowIndex) =>
      MathUtils.lerp(
        dark.downlightRowBrightness[rowIndex] ?? dark.storeBrightness,
        lit.downlightRowBrightness[rowIndex] ?? lit.storeBrightness,
        row,
      ),
    ),
    ledBrightness: MathUtils.lerp(dark.ledBrightness, lit.ledBrightness, led),
    signBrightness: MathUtils.lerp(dark.signBrightness, lit.signBrightness, store),
    exposure: MathUtils.lerp(dark.exposure, lit.exposure, exposure),
  }
}

/** When every light is fully on. */
export const ARRIVAL_LIGHTS_ON_SECONDS = Math.max(
  ARRIVAL.firstRowStartSeconds +
    (DOWNLIGHT_ROW_COUNT - 1) * ARRIVAL.rowStaggerSeconds +
    ARRIVAL.rowFadeSeconds,
  ARRIVAL.storeStartSeconds + ARRIVAL.storeFadeSeconds,
  ARRIVAL.ledStartSeconds + ARRIVAL.ledFadeSeconds,
)
