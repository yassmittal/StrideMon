import { StyleSheet, Text, View } from 'react-native'
import { colors, fontSizes, fontWeights, spacing } from '../../theme'

type StatValueProps = {
  label: string
  value: string
  /** `large` for the one number a screen is about, such as a balance. */
  size?: 'regular' | 'large'
}

/**
 * A labelled number. Every stat goes through here, so Phase 8 can switch all
 * numbers to IBM Plex Mono (design-system.md → Typography) in one place.
 */
export function StatValue({ label, value, size = 'regular' }: StatValueProps) {
  return (
    <View style={styles.container} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, size === 'large' && styles.valueLarge]}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.extraSmall,
  },
  label: {
    fontSize: fontSizes.caption,
    color: colors.textSecondary,
  },
  value: {
    fontSize: fontSizes.title,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
    // Digits keep one width, so a changing number doesn't shift its neighbours.
    fontVariant: ['tabular-nums'],
  },
  valueLarge: {
    fontSize: fontSizes.display,
  },
})
