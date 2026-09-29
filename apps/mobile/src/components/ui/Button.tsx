import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native'
import {
  colors,
  fontSizes,
  fontWeights,
  MINIMUM_TOUCH_TARGET_SIZE,
  radii,
  spacing,
} from '../../theme'

type ButtonProps = {
  label: string
  onPress: () => void
  /** `secondary` is for the less important action next to a primary one. */
  variant?: 'primary' | 'secondary'
  accessibilityLabel?: string
  isDisabled?: boolean
  isLoading?: boolean
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  accessibilityLabel,
  isDisabled = false,
  isLoading = false,
}: ButtonProps) {
  const isSecondary = variant === 'secondary'
  const isInteractive = !isDisabled && !isLoading

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !isInteractive, busy: isLoading }}
      disabled={!isInteractive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isSecondary && styles.buttonSecondary,
        pressed && (isSecondary ? styles.buttonSecondaryPressed : styles.buttonPressed),
        !isInteractive && styles.buttonDisabled,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={isSecondary ? colors.primary : colors.textOnPrimary} />
      ) : (
        <Text style={[styles.label, isSecondary && styles.labelSecondary]}>{label}</Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    minHeight: MINIMUM_TOUCH_TARGET_SIZE,
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.small,
    borderRadius: radii.medium,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  buttonSecondary: {
    backgroundColor: colors.surface,
  },
  buttonSecondaryPressed: {
    backgroundColor: colors.disabled,
  },
  buttonDisabled: {
    backgroundColor: colors.disabled,
  },
  label: {
    color: colors.textOnPrimary,
    fontSize: fontSizes.body,
    fontWeight: fontWeights.semibold,
  },
  labelSecondary: {
    color: colors.primary,
  },
})
