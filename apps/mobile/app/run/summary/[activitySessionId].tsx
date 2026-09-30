import { router, useLocalSearchParams } from 'expo-router'
import { Button } from '../../../src/components/ui/Button'
import { ErrorState } from '../../../src/components/ui/ErrorState'
import { LoadingScreen } from '../../../src/components/ui/LoadingScreen'
import { Screen } from '../../../src/components/ui/Screen'
import { ActivitySessionSummaryCard } from '../../../src/features/activity-session/components/ActivitySessionSummaryCard'
import { useActivitySession } from '../../../src/features/activity-session/hooks/useActivitySession'

/** How a finished run was judged. Phase 5 adds settlement polling and the reward. */
export default function ActivitySessionSummaryScreen() {
  const { activitySessionId } = useLocalSearchParams<{ activitySessionId: string }>()
  const activitySessionQuery = useActivitySession(activitySessionId)

  if (activitySessionQuery.isError) {
    return (
      <Screen>
        <ErrorState
          message="Couldn’t load this run. Check your connection and try again."
          onRetryPress={() => activitySessionQuery.refetch()}
          isRetrying={activitySessionQuery.isRefetching}
        />
      </Screen>
    )
  }
  if (activitySessionQuery.data === undefined) {
    return <LoadingScreen accessibilityLabel="Loading your run" />
  }
  return (
    <Screen isScrollable>
      <ActivitySessionSummaryCard activitySession={activitySessionQuery.data} />
      <Button label="Back to Home" onPress={() => router.dismissTo('/')} />
    </Screen>
  )
}
