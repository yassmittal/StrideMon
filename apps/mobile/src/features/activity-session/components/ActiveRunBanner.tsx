import { StyleSheet, Text, View } from 'react-native'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { colors, fontSizes, fontWeights, spacing } from '../../../theme'

type ActiveRunBannerProps = {
  onResumePress: () => void
  onFinishPress: () => void
  isFinishing: boolean
  errorMessage: string | null
}

/** On Home when a run is still in progress (the app was closed mid-run): Resume or Finish. */
export function ActiveRunBanner({
  onResumePress,
  onFinishPress,
  isFinishing,
  errorMessage,
}: ActiveRunBannerProps) {
  return (
    <Card>
      <Text style={styles.title} accessibilityRole="header">
        Run in progress
      </Text>
      <Text style={styles.message}>
        Your GPS points are saved on this phone. Resume the run, or finish it to see how it counted.
      </Text>
      {errorMessage !== null && (
        <Text style={styles.error} accessibilityRole="alert">
          {errorMessage}
        </Text>
      )}
      <View style={styles.actions}>
        <Button label="Resume" onPress={onResumePress} isDisabled={isFinishing} />
        <Button
          label="Finish"
          variant="secondary"
          onPress={onFinishPress}
          isLoading={isFinishing}
        />
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: fontSizes.title,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  message: {
    fontSize: fontSizes.body,
    color: colors.textPrimary,
  },
  error: {
    fontSize: fontSizes.body,
    color: colors.danger,
  },
  actions: {
    gap: spacing.small,
  },
})
