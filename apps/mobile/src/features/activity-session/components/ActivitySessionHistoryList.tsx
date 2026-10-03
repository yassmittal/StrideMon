import type { ActivitySession } from '@stridemon/shared/api-contracts'
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native'
import { colors, spacing, textStyles } from '../../../theme'
import { ActivitySessionHistoryItem } from './ActivitySessionHistoryItem'

// Start loading the next page when the list is within half a screen of its end.
const LOAD_MORE_THRESHOLD_SCREENS = 0.5

type ActivitySessionHistoryListProps = {
  activitySessions: readonly ActivitySession[]
  onActivitySessionPress: (activitySessionId: string) => void
  onEndReached: () => void
  isLoadingMore: boolean
  onRefresh: () => void
  isRefreshing: boolean
}

/** Past runs, newest first, with pull-to-refresh and more pages on scroll. */
export function ActivitySessionHistoryList({
  activitySessions,
  onActivitySessionPress,
  onEndReached,
  isLoadingMore,
  onRefresh,
  isRefreshing,
}: ActivitySessionHistoryListProps) {
  return (
    <FlatList
      data={activitySessions}
      keyExtractor={(activitySession) => activitySession.activitySessionId}
      renderItem={({ item }) => (
        <ActivitySessionHistoryItem activitySession={item} onPress={onActivitySessionPress} />
      )}
      contentContainerStyle={
        activitySessions.length === 0 ? styles.emptyContent : styles.listContent
      }
      ItemSeparatorComponent={ItemSeparator}
      ListEmptyComponent={HistoryEmptyState}
      ListFooterComponent={
        isLoadingMore ? (
          <ActivityIndicator
            color={colors.primary}
            style={styles.footer}
            accessibilityLabel="Loading more runs"
          />
        ) : null
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={LOAD_MORE_THRESHOLD_SCREENS}
      onRefresh={onRefresh}
      refreshing={isRefreshing}
    />
  )
}

function ItemSeparator() {
  return <View style={styles.separator} />
}

function HistoryEmptyState() {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>No runs yet</Text>
      <Text style={styles.emptyMessage}>
        Press START on Home and go for a walk. Each run you finish shows up here with the SOLE it
        earned.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: spacing.large,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  separator: {
    height: spacing.small,
  },
  footer: {
    paddingVertical: spacing.medium,
  },
  empty: {
    alignItems: 'center',
    gap: spacing.small,
    paddingHorizontal: spacing.large,
  },
  emptyTitle: {
    ...textStyles.title,
    color: colors.textPrimary,
  },
  emptyMessage: {
    ...textStyles.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
})
