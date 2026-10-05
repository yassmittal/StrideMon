import { Easing } from 'react-native'

/** design-system.md §7. Two main curves, nothing bounces. */
export const motion = {
  easingStandard: Easing.bezier(0.4, 0, 0.1, 1),
  easingEmphasized: Easing.bezier(0.35, 0, 0, 1),
  easingArrow: Easing.bezier(0.4, 0, 0, 1),
  easingLoop: Easing.bezier(0.1, 0, 0.1, 1),
  easingOutExpo: Easing.bezier(0.16, 1, 0.3, 1),
  durationInstant: 100,
  durationFast: 200,
  durationBase: 300,
  durationMedium: 400,
  durationSlow: 500,
  durationSlower: 600,
} as const
