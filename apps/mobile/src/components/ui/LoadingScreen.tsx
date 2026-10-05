import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { colors, spacing, textStyles } from '../../theme'

type LoadingScreenProps = {
  accessibilityLabel: string
  /** Says what it's waiting on, when that takes long enough to wonder. */
  message?: string
  /** `dark` while a dark screen loads, so it doesn't flash light first. */
  tone?: 'light' | 'dark'
}

/** A whole screen that is waiting on something, such as restoring the auth session at launch. */
export function LoadingScreen({ accessibilityLabel, message, tone = 'light' }: LoadingScreenProps) {
  const isDark = tone === 'dark'
  return (
    <View
      style={[styles.container, isDark && styles.containerDark]}
      accessibilityLabel={accessibilityLabel}
    >
      <ActivityIndicator size="large" color={isDark ? colors.textOnDark : colors.textPrimary} />
      {message !== undefined && (
        <Text style={[styles.message, isDark && styles.messageOnDark]}>{message}</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.medium,
    backgroundColor: colors.background,
  },
  containerDark: {
    backgroundColor: colors.darkBackground,
  },
  message: {
    ...textStyles.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  messageOnDark: {
    color: colors.textOnDarkMuted,
  },
})
