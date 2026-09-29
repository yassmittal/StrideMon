import { StyleSheet, Text, View } from 'react-native'
import { colors, fontSizes, spacing } from '../../theme'
import { Button } from './Button'

type ErrorStateProps = {
  message: string
  onRetryPress: () => void
  isRetrying?: boolean
  retryLabel?: string
}

/** Something couldn't load: says what, and offers the way forward. */
export function ErrorState({
  message,
  onRetryPress,
  isRetrying = false,
  retryLabel = 'Try again',
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.message} accessibilityRole="alert">
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
    fontSize: fontSizes.body,
    color: colors.danger,
  },
})
