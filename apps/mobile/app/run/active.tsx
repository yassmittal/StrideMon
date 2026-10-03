import type { GameConfig } from '@stridemon/shared/game-rules'
import { router } from 'expo-router'
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native'
import { Button } from '../../src/components/ui/Button'
import { ErrorState } from '../../src/components/ui/ErrorState'
import { LoadingScreen } from '../../src/components/ui/LoadingScreen'
import { MetaLabel } from '../../src/components/ui/MetaLabel'
import { Screen } from '../../src/components/ui/Screen'
import { LiveRunStats } from '../../src/features/activity-session/components/LiveRunStats'
import { useActiveActivitySession } from '../../src/features/activity-session/hooks/useActiveActivitySession'
import { useFinishActivitySession } from '../../src/features/activity-session/hooks/useFinishActivitySession'
import { useLocalActiveActivitySession } from '../../src/features/activity-session/hooks/useLocalActiveActivitySession'
import type { LocalActiveActivitySession } from '../../src/features/activity-session/location-tracking/local-active-activity-session'
import { describeRunError } from '../../src/features/activity-session/run-error-messages'
import { useGameConfig } from '../../src/features/sneaker/hooks/useGameConfig'
import { colors, layout, radii, spacing, textStyles } from '../../src/theme'

/** The live run on a black screen (design-system.md §9): stats while GPS records, and STOP. */
export default function ActiveRunScreen() {
  const localActiveActivitySessionQuery = useLocalActiveActivitySession()
  const gameConfigQuery = useGameConfig()

  if (localActiveActivitySessionQuery.isError || gameConfigQuery.isError) {
    return (
      <Screen tone="dark">
        <ErrorState
          message="Couldn’t load your run. Check your connection and try again."
          onRetryPress={() => {
            void localActiveActivitySessionQuery.refetch()
            void gameConfigQuery.refetch()
          }}
          tone="dark"
        />
      </Screen>
    )
  }
  const localActiveActivitySession = localActiveActivitySessionQuery.data
  const gameConfig = gameConfigQuery.data
  if (localActiveActivitySession === undefined || gameConfig === undefined) {
    return <LoadingScreen accessibilityLabel="Loading your run" tone="dark" />
  }
  if (localActiveActivitySession === null) {
    return (
      <Screen tone="dark">
        <ErrorState
          message="There’s no run in progress on this phone."
          retryLabel="Back to Home"
          onRetryPress={() => router.dismissTo('/')}
          tone="dark"
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
  const { activitySessionId, sneakerTokenId } = localActiveActivitySession

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
    <Screen isScrollable tone="dark">
      <View style={styles.header} accessibilityRole="header">
        <View style={styles.recordingDot} />
        <MetaLabel items={['Run in progress', `Sneaker #${sneakerTokenId}`]} tone="dark" />
      </View>
      {trackingError !== null && (
        <ErrorState
          message={describeRunError(trackingError)}
          retryLabel="Restart GPS"
          onRetryPress={retryTracking}
          tone="dark"
        />
      )}
      {liveRunStats === undefined ? (
        <ActivityIndicator color={colors.textOnDark} accessibilityLabel="Loading live stats" />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
    paddingBottom: spacing.large,
  },
  // Lime on black: GPS is recording.
  recordingDot: {
    width: layout.callToActionDotSize,
    height: layout.callToActionDotSize,
    borderRadius: radii.pill,
    backgroundColor: colors.highlight,
  },
  stopSection: {
    gap: spacing.small,
    paddingTop: spacing.section,
  },
  error: {
    ...textStyles.body,
    color: colors.dangerAccent,
  },
})
