import type { GameConfig } from '@stridemon/shared/game-rules'
import { router } from 'expo-router'
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native'
import { Button } from '../../src/components/ui/Button'
import { ErrorState } from '../../src/components/ui/ErrorState'
import { LoadingScreen } from '../../src/components/ui/LoadingScreen'
import { Screen } from '../../src/components/ui/Screen'
import { LiveRunStats } from '../../src/features/activity-session/components/LiveRunStats'
import { useActiveActivitySession } from '../../src/features/activity-session/hooks/useActiveActivitySession'
import { useFinishActivitySession } from '../../src/features/activity-session/hooks/useFinishActivitySession'
import { useLocalActiveActivitySession } from '../../src/features/activity-session/hooks/useLocalActiveActivitySession'
import type { LocalActiveActivitySession } from '../../src/features/activity-session/location-tracking/local-active-activity-session'
import { describeRunError } from '../../src/features/activity-session/run-error-messages'
import { useGameConfig } from '../../src/features/sneaker/hooks/useGameConfig'
import { colors, fontSizes, fontWeights, spacing } from '../../src/theme'

/** The live run: stats while GPS records, and STOP. */
export default function ActiveRunScreen() {
  const localActiveActivitySessionQuery = useLocalActiveActivitySession()
  const gameConfigQuery = useGameConfig()

  if (localActiveActivitySessionQuery.isError || gameConfigQuery.isError) {
    return (
      <Screen>
        <ErrorState
          message="Couldn’t load your run. Check your connection and try again."
          onRetryPress={() => {
            void localActiveActivitySessionQuery.refetch()
            void gameConfigQuery.refetch()
          }}
        />
      </Screen>
    )
  }
  const localActiveActivitySession = localActiveActivitySessionQuery.data
  const gameConfig = gameConfigQuery.data
  if (localActiveActivitySession === undefined || gameConfig === undefined) {
    return <LoadingScreen accessibilityLabel="Loading your run" />
  }
  if (localActiveActivitySession === null) {
    return (
      <Screen>
        <ErrorState
          message="There’s no run in progress on this phone."
          retryLabel="Back to Home"
          onRetryPress={() => router.dismissTo('/')}
        />
      </Screen>
    )
  }
  return (
    <ActiveRun localActiveActivitySession={localActiveActivitySession} gameConfig={gameConfig} />
  )
}

function ActiveRun({
  localActiveActivitySession,
  gameConfig,
}: {
  localActiveActivitySession: LocalActiveActivitySession
  gameConfig: GameConfig
}) {
  const { liveRunStats, unsentSampleCount, uploadErrorCode, trackingError, retryTracking } =
    useActiveActivitySession({ localActiveActivitySession, gameConfig })
  const finishMutation = useFinishActivitySession()
  const { activitySessionId } = localActiveActivitySession

  function finishRun() {
    finishMutation.mutate(activitySessionId, {
      onSuccess: (activitySession) =>
        router.replace(`/run/summary/${activitySession.activitySessionId}`),
    })
  }

  function handleStopPress() {
    Alert.alert('Finish this run?', 'GPS stops, and the server checks how much of it counted.', [
      { text: 'Keep going', style: 'cancel' },
      { text: 'Finish', style: 'destructive', onPress: finishRun },
    ])
  }

  return (
    <Screen isScrollable>
      <Text style={styles.title} accessibilityRole="header">
        Run in progress
      </Text>
      {trackingError !== null && (
        <ErrorState
          message={describeRunError(trackingError)}
          retryLabel="Restart GPS"
          onRetryPress={retryTracking}
        />
      )}
      {liveRunStats === undefined ? (
        <ActivityIndicator color={colors.primary} accessibilityLabel="Loading live stats" />
      ) : (
        <LiveRunStats
          liveRunStats={liveRunStats}
          energyAtStart={localActiveActivitySession.energyAtStart}
          unsentSampleCount={unsentSampleCount}
          uploadErrorCode={uploadErrorCode}
        />
      )}
      <View style={styles.stopSection}>
        {finishMutation.error !== null && (
          <Text style={styles.error} accessibilityRole="alert">
            {describeRunError(finishMutation.error)}
          </Text>
        )}
        <Button
          label={finishMutation.error === null ? 'Stop' : 'Try finishing again'}
          accessibilityLabel="Stop and finish the run"
          onPress={finishMutation.error === null ? handleStopPress : finishRun}
          isLoading={finishMutation.isPending}
        />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: fontSizes.title,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  stopSection: {
    gap: spacing.small,
  },
  error: {
    fontSize: fontSizes.body,
    color: colors.danger,
  },
})
