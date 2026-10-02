import { router } from 'expo-router'
import { StyleSheet, Text } from 'react-native'
import { ErrorState } from '../../src/components/ui/ErrorState'
import { LoadingScreen } from '../../src/components/ui/LoadingScreen'
import { Screen } from '../../src/components/ui/Screen'
import { ActivitySessionHistoryList } from '../../src/features/activity-session/components/ActivitySessionHistoryList'
import { useActivitySessionHistory } from '../../src/features/activity-session/hooks/useActivitySessionHistory'
import { colors, fontSizes, fontWeights } from '../../src/theme'

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
      <Text style={styles.title} accessibilityRole="header">
        History
      </Text>
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

const styles = StyleSheet.create({
  title: {
    fontSize: fontSizes.title,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
})
