import { StyleSheet, Text, View } from 'react-native'
import { colors, fontSizes, radii, spacing } from '../../theme'

// Tall enough to read at a glance, thin enough to stay secondary to the numbers.
const TRACK_HEIGHT = 8

type ProgressBarProps = {
  label: string
  value: number
  maximum: number
}

/** A labelled bar with `value / maximum` on the right. Used for energy and durability. */
export function ProgressBar({ label, value, maximum }: ProgressBarProps) {
  const filledFraction = maximum > 0 ? Math.min(Math.max(value / maximum, 0), 1) : 0

  return (
    <View
      style={styles.container}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: maximum, now: value, text: `${value} of ${maximum}` }}
    >
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          {value} / {maximum}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${filledFraction * 100}%` }]} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.small,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  label: {
    fontSize: fontSizes.caption,
    color: colors.textSecondary,
  },
  value: {
    fontSize: fontSizes.body,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: radii.pill,
    backgroundColor: colors.disabled,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
})
