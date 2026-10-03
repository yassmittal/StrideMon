import { StyleSheet, Text, View } from 'react-native'
import { colors, fontFamilies, spacing, textStyles } from '../../theme'

type StatValueProps = {
  label: string
  value: string
  /** `large` for the one number a screen is about, such as a balance. */
  size?: 'regular' | 'large'
}

/** A labelled number, in IBM Plex Mono like every number (design-system.md §3.1). */
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
    ...textStyles.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  value: {
    ...textStyles.title,
    fontFamily: fontFamilies.monoRegular,
    color: colors.textPrimary,
  },
  valueLarge: {
    ...textStyles.heading,
    fontFamily: fontFamilies.monoRegular,
  },
})
