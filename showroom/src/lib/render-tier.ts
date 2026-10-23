// The three quality tiers (brief §7.6). Every tier keeps the same store, the same Sneakers and the
// same colours; only the cost changes. A device steps down when its frame rate stays low (D-067).

export const RENDER_TIERS = ['high', 'medium', 'low'] as const
export type RenderTier = (typeof RENDER_TIERS)[number]

export type RenderTierSettings = {
  label: string
  maxPixelRatio: number
  /** The floor's reflection texture size, or null for no reflection (a rougher floor). */
  floorReflectionPixels: number | null
  isBloomOn: boolean
  /** Bloom's working size as a share of the screen. */
  bloomResolutionScale: number
  /** How many halvings the mipmap blur spreads over: fewer is a tighter glow and fewer passes. */
  bloomLevelCount: number
  /** Each Sneaker's width in the walls' atlases. */
  wallSneakerPixels: number
  /** The prints' size as a share of the film's canvases. */
  printScale: number
  /** Samples for the composer's anti-aliasing. */
  multisampleCount: number
}

export const renderTierSettings: Record<RenderTier, RenderTierSettings> = {
  high: {
    label: 'High',
    maxPixelRatio: 2,
    floorReflectionPixels: 512,
    isBloomOn: true,
    bloomResolutionScale: 1,
    bloomLevelCount: 7,
    wallSneakerPixels: 384,
    printScale: 1,
    multisampleCount: 4,
  },
  medium: {
    label: 'Medium',
    maxPixelRatio: 1.5,
    floorReflectionPixels: 256,
    isBloomOn: true,
    bloomResolutionScale: 0.5,
    bloomLevelCount: 5,
    wallSneakerPixels: 256,
    printScale: 0.5,
    multisampleCount: 2,
  },
  low: {
    label: 'Low',
    maxPixelRatio: 1,
    floorReflectionPixels: null,
    isBloomOn: false,
    bloomResolutionScale: 0.5,
    bloomLevelCount: 5,
    wallSneakerPixels: 256,
    printScale: 0.5,
    multisampleCount: 0,
  },
}

/**
 * When a device steps down a tier (drei's `PerformanceMonitor`): the frame rate is sampled every
 * quarter second, and when 8 of the last 10 samples are under 45 fps, it steps down. It never steps
 * back up, so it can't flicker between tiers. 45, not 60: a phone holding 50 is smooth enough to
 * keep its tier (the brief's §8 asks ≥ 50 on the phone), and a phone held at 30 by battery saver
 * just steps down to Low, which costs nothing.
 */
export const TIER_STEP_DOWN = {
  sampleMilliseconds: 250,
  sampleCount: 10,
  /** The share of samples that must be slow: more than 7.5 of 10. */
  slowShare: 0.75,
  belowFramesPerSecond: 45,
} as const

/** The monitor's [lower, upper] frame rates: under the lower steps down; nothing steps up. */
export function readTierStepDownBounds(): [number, number] {
  return [TIER_STEP_DOWN.belowFramesPerSecond, Number.POSITIVE_INFINITY]
}

/**
 * Touch devices start on Medium, others on High (brief §7.6). `?tier=low` (or `medium`, `high`)
 * holds a tier, for measuring and for the stills.
 */
export function chooseStartingRenderTier(): { tier: RenderTier; isChosenByHand: boolean } {
  const tierInLink = new URLSearchParams(window.location.search).get('tier')
  const heldTier = RENDER_TIERS.find((tier) => tier === tierInLink)
  if (heldTier !== undefined) return { tier: heldTier, isChosenByHand: true }
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches
  return { tier: isTouchDevice ? 'medium' : 'high', isChosenByHand: false }
}

/** One tier down, or the same tier when it's already the lowest. */
export function toLowerRenderTier(tier: RenderTier): RenderTier {
  return RENDER_TIERS[Math.min(RENDER_TIERS.indexOf(tier) + 1, RENDER_TIERS.length - 1)] ?? tier
}
