// Per-weight entry points: the package root would bundle all 14 weights.
import { IBMPlexMono_400Regular } from '@expo-google-fonts/ibm-plex-mono/400Regular'
import { IBMPlexMono_500Medium } from '@expo-google-fonts/ibm-plex-mono/500Medium'

/**
 * One family per weight: Android picks a font by its file, not by `fontWeight`,
 * so text sets one of these and never a `fontWeight` (design-system.md §10).
 */
export const fontFamilies = {
  regular: 'Satoshi-Regular',
  medium: 'Satoshi-Medium',
  /** Every number: STRIDE, distance, time, energy, stats. */
  monoRegular: 'IBMPlexMono-Regular',
  monoMedium: 'IBMPlexMono-Medium',
} as const

/** For `useFonts`: each family name with its file. Satoshi is the free Aeonik stand-in (§3.1). */
export const fontFiles = {
  [fontFamilies.regular]: require('../../assets/fonts/Satoshi-Regular.ttf'),
  [fontFamilies.medium]: require('../../assets/fonts/Satoshi-Medium.ttf'),
  [fontFamilies.monoRegular]: IBMPlexMono_400Regular,
  [fontFamilies.monoMedium]: IBMPlexMono_500Medium,
}
