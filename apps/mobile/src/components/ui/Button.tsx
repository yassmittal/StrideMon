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
  accessibilityLabel?: string
  isDisabled?: boolean
  isLoading?: boolean
}

export function Button({
  label,
  onPress,
  accessibilityLabel,
  isDisabled = false,
  isLoading = false,
}: ButtonProps) {
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
        pressed && styles.buttonPressed,
        !isInteractive && styles.buttonDisabled,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={colors.textOnPrimary} />
      ) : (
        <Text style={styles.label}>{label}</Text>
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
  buttonDisabled: {
    backgroundColor: colors.disabled,
  },
  label: {
    color: colors.textOnPrimary,
    fontSize: fontSizes.body,
    fontWeight: fontWeights.semibold,
  },
})
