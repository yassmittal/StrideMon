import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, MINIMUM_TOUCH_TARGET_SIZE, radii, spacing, textStyles } from '../../theme'

// Feedback that the press registered, without changing the panel's color.
const PRESSED_OPACITY = 0.85

type DarkPanelProps = {
  title: string
  description?: string
  onPress: () => void
  accessibilityLabel?: string
}

/** design-system.md §8: the one featured action on a light screen, black with an arrow. */
export function DarkPanel({ title, description, onPress, accessibilityLabel }: DarkPanelProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={onPress}
      style={({ pressed }) => [styles.panel, pressed && styles.panelPressed]}
    >
      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.arrow}>→</Text>
      </View>
      {description !== undefined && <Text style={styles.description}>{description}</Text>}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  panel: {
    minHeight: MINIMUM_TOUCH_TARGET_SIZE,
    paddingVertical: spacing.large,
    paddingHorizontal: spacing.extraLarge,
    borderRadius: radii.medium,
    backgroundColor: colors.darkBackground,
    gap: spacing.small,
  },
  panelPressed: {
    opacity: PRESSED_OPACITY,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.medium,
  },
  title: {
    ...textStyles.menuItem,
    flexShrink: 1,
    color: colors.textOnDark,
    textTransform: 'uppercase',
  },
  arrow: {
    ...textStyles.menuItem,
    color: colors.highlight,
  },
  description: {
    ...textStyles.caption,
    color: colors.textOnDarkMuted,
  },
})
