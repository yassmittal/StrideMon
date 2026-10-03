import { Pressable, StyleSheet } from 'react-native'
import { colors, layout, radii } from '../../theme'
import { Icon, type IconName } from './Icon'

type IconCircleButtonProps = {
  icon: IconName
  accessibilityLabel: string
  onPress: () => void
  /** `dark` is Lusion's bigger black back-to-top circle. */
  tone?: 'light' | 'dark'
  isDisabled?: boolean
}

/** design-system.md §8: a round icon button, for close and back. */
export function IconCircleButton({
  icon,
  accessibilityLabel,
  onPress,
  tone = 'light',
  isDisabled = false,
}: IconCircleButtonProps) {
  const isDark = tone === 'dark'
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.circle,
        isDark && styles.circleDark,
        pressed && (isDark ? styles.circleDarkPressed : styles.circlePressed),
        isDisabled && styles.circleDisabled,
      ]}
    >
      <Icon
        name={icon}
        color={
          isDisabled ? colors.textPlaceholder : isDark ? colors.textOnDark : colors.textPrimary
        }
      />
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
  circleDark: {
    width: layout.iconCircleButtonDarkSize,
    height: layout.iconCircleButtonDarkSize,
    backgroundColor: colors.darkBackground,
  },
  circleDarkPressed: {
    backgroundColor: colors.primaryPressed,
  },
  circleDisabled: {
    backgroundColor: colors.disabled,
  },
})
