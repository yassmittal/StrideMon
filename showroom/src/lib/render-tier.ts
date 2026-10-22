// The three quality tiers (brief §7.6). Every tier keeps the same store, the same Sneakers and the
// same colours; only the cost changes. Part 4 tunes when a device steps down.

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
    floorReflectionPixels: 1024,
    isBloomOn: true,
    bloomResolutionScale: 1,
    bloomLevelCount: 7,
    wallSneakerPixels: 512,
    printScale: 1,
    multisampleCount: 4,
  },
  medium: {
    label: 'Medium',
    maxPixelRatio: 1.5,
    floorReflectionPixels: 512,
    isBloomOn: true,
    bloomResolutionScale: 0.5,
    bloomLevelCount: 5,
    wallSneakerPixels: 384,
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

/** Touch devices start on Medium, others on High (brief §7.6). */
export function chooseStartingRenderTier(): RenderTier {
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches
  return isTouchDevice ? 'medium' : 'high'
}

/** One tier down, or the same tier when it's already the lowest. */
export function toLowerRenderTier(tier: RenderTier): RenderTier {
  return RENDER_TIERS[Math.min(RENDER_TIERS.indexOf(tier) + 1, RENDER_TIERS.length - 1)] ?? tier
}
