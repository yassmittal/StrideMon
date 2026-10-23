// The numbers for what live rendering adds (brief §6.3), tuned by eye against the film until it's
// rich and quiet. The film's own sizes, colours and lights stay in the components.

export const STORE_TUNING = {
  floor: {
    /**
     * drei's blur "size" [x, y]: its blur steps 1/size of the texture per tap, so a smaller number
     * blurs more. Stronger along the floor's depth, as a polished floor smears.
     */
    reflectionBlur: [420, 140] as [number, number],
    /** Times the floor's roughness (0.32) is the share of the reflection that's blurred: all of it. */
    mixBlur: 3.2,
    /** How strongly the reflection shows: a soft smear, never a mirror. */
    mixStrength: 1.1,
    mixContrast: 1,
    environmentShare: 0.25,
    /** The Low tier has no reflection, so its floor is a little rougher. */
    lowTierRoughness: 0.42,
  },
  bloom: {
    /** Only what's brighter than white blooms: lit things, never Sneakers or prints. */
    luminanceThreshold: 1,
    luminanceSmoothing: 0.25,
    intensity: 0.55,
    radius: 0.7,
  },
  contactShadows: {
    opacity: 0.45,
    blur: 2.4,
    /** Height above the floor that casts: counters, the table, chairs, the pedestal. */
    farMeters: 1.2,
    /** 2 cm a pixel over the 10 m room, blurred: 1,024 cost four times as much for nothing seen. */
    resolutionPixels: 512,
  },
  grain: {
    opacity: 0.07,
  },
} as const
