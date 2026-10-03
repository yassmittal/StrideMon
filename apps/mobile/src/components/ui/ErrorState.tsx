import { StyleSheet, Text, View } from 'react-native'
import { colors, spacing, textStyles } from '../../theme'
import { Button } from './Button'

type ErrorStateProps = {
  message: string
  onRetryPress: () => void
  isRetrying?: boolean
  retryLabel?: string
  /** `dark` on a black screen, where Lusion's brighter red reads better. */
  tone?: 'light' | 'dark'
}

/** Something couldn't load: says what, and offers the way forward. */
export function ErrorState({
  message,
  onRetryPress,
  isRetrying = false,
  retryLabel = 'Try again',
  tone = 'light',
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text
        style={[styles.message, tone === 'dark' && styles.messageOnDark]}
        accessibilityRole="alert"
      >
        {message}
      </Text>
      <Button
        label={retryLabel}
        variant="secondary"
        onPress={onRetryPress}
        isLoading={isRetrying}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.medium,
  },
  message: {
    ...textStyles.body,
    color: colors.danger,
  },
  messageOnDark: {
    color: colors.dangerAccent,
  },
})
