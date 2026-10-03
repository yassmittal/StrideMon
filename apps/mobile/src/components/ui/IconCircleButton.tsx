import { Pressable, StyleSheet } from 'react-native'
import { colors, layout, radii } from '../../theme'
import { Icon, type IconName } from './Icon'

type IconCircleButtonProps = {
  icon: IconName
  accessibilityLabel: string
  onPress: () => void
  isDisabled?: boolean
}

/** design-system.md §8: a round icon button, for close and back. */
export function IconCircleButton({
  icon,
  accessibilityLabel,
  onPress,
  isDisabled = false,
}: IconCircleButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.circle,
        pressed && styles.circlePressed,
        isDisabled && styles.circleDisabled,
      ]}
    >
      <Icon name={icon} color={isDisabled ? colors.textPlaceholder : colors.textPrimary} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  circle: {
    width: layout.iconCircleButtonSize,
    height: layout.iconCircleButtonSize,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  circlePressed: {
    backgroundColor: colors.surface,
  },
  circleDisabled: {
    backgroundColor: colors.disabled,
  },
})
