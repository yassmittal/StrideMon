import { StyleSheet, Text, View } from 'react-native'
import { Button } from '../../../components/ui/Button'
import { DarkPanel } from '../../../components/ui/DarkPanel'
import { colors, spacing, textStyles } from '../../../theme'

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
    <View style={styles.container}>
      <DarkPanel
        title="Run in progress"
        description="Your GPS points are saved on this phone. Resume the run, or finish it to see how it counted."
        onPress={onResumePress}
        accessibilityLabel="Resume the run in progress"
      />
      {errorMessage !== null && (
        <Text style={styles.error} accessibilityRole="alert">
          {errorMessage}
        </Text>
      )}
      <Button label="Finish" variant="secondary" onPress={onFinishPress} isLoading={isFinishing} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.small,
  },
  error: {
    ...textStyles.body,
    color: colors.danger,
  },
})
