import { StyleSheet, Text, View } from 'react-native'
import { Button } from '../../../components/ui/Button'
import { colors, spacing, textStyles } from '../../../theme'

type StartRunPanelProps = {
  onStartPress: () => void
  /** Why START is disabled, e.g. no energy. `null` when the player can start. */
  blockedReasonMessage: string | null
  isStarting: boolean
  errorMessage: string | null
}

/** START, or the reason it's disabled, and what went wrong on the last try. */
export function StartRunPanel({
  onStartPress,
  blockedReasonMessage,
  isStarting,
  errorMessage,
}: StartRunPanelProps) {
  return (
    <View style={styles.container}>
      <Button
        label="Start a run"
        variant="callToAction"
        onPress={onStartPress}
        isDisabled={blockedReasonMessage !== null}
        isLoading={isStarting}
      />
      {errorMessage !== null && (
        <Text style={styles.error} accessibilityRole="alert">
          {errorMessage}
        </Text>
      )}
      <Text style={styles.caption}>
        {blockedReasonMessage ??
          'Walk or run outdoors with your phone. Every active minute uses one energy point.'}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.medium,
    paddingTop: spacing.small,
  },
  error: {
    ...textStyles.body,
    color: colors.danger,
  },
  caption: {
    ...textStyles.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
})
