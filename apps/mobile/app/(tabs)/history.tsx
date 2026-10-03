import { router } from 'expo-router'
import { ErrorState } from '../../src/components/ui/ErrorState'
import { LoadingScreen } from '../../src/components/ui/LoadingScreen'
import { Screen } from '../../src/components/ui/Screen'
import { ScreenTitle } from '../../src/components/ui/ScreenTitle'
import { ActivitySessionHistoryList } from '../../src/features/activity-session/components/ActivitySessionHistoryList'
import { useActivitySessionHistory } from '../../src/features/activity-session/hooks/useActivitySessionHistory'

/** Past runs, newest first. Tapping one opens its summary. */
export default function HistoryScreen() {
  const historyQuery = useActivitySessionHistory()
  const { activitySessions } = historyQuery

  if (historyQuery.isError && activitySessions === undefined) {
    return (
      <Screen>
        <ErrorState
          message="Couldn’t load your runs. Check your connection and try again."
          onRetryPress={() => historyQuery.refetch()}
          isRetrying={historyQuery.isRefetching}
        />
      </Screen>
    )
  }
  if (activitySessions === undefined) {
    return <LoadingScreen accessibilityLabel="Loading your runs" />
  }
  return (
    <Screen>
      <ScreenTitle title="History" metaItems={['Past runs', 'Newest first']} />
      <ActivitySessionHistoryList
        activitySessions={activitySessions}
        onActivitySessionPress={(activitySessionId) =>
          router.push(`/run/summary/${activitySessionId}`)
        }
        onEndReached={() => {
          if (historyQuery.hasNextPage && !historyQuery.isFetchingNextPage) {
            void historyQuery.fetchNextPage()
          }
        }}
        isLoadingMore={historyQuery.isFetchingNextPage}
        onRefresh={() => historyQuery.refetch()}
        isRefreshing={historyQuery.isRefetching && !historyQuery.isFetchingNextPage}
      />
    </Screen>
  )
}
