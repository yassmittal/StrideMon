import type { ActivitySession } from '@stridemon/shared/api-contracts'
import { StyleSheet, View } from 'react-native'
import { spacing } from '../../../theme'
import { describeRejectionReason } from '../activity-session-copy'
import { calculateActivitySessionDurationSeconds } from '../activity-session-duration'
import { RunStatsCard } from './RunStatsCard'
import { SettlementHeroCard } from './SettlementHeroCard'
import { SummaryHeadline } from './SummaryHeadline'

type ActivitySessionSummaryCardProps = {
  activitySession: ActivitySession
}

/**
 * A finished run: "Settling on Monad…" and then the SOLE it earned, with the
 * validated numbers below. Or why it didn't count.
 */
export function ActivitySessionSummaryCard({ activitySession }: ActivitySessionSummaryCardProps) {
  const { validationResult, settlement } = activitySession
  const runStats =
    validationResult === null ? null : (
      <RunStatsCard
        validationResult={validationResult}
        durationSeconds={calculateActivitySessionDurationSeconds(activitySession)}
        settlement={settlement}
      />
    )

  switch (activitySession.status) {
    case 'settling':
      return (
        <View style={styles.stack}>
          <SettlementHeroCard phase="settling" />
          {runStats}
        </View>
      )
    case 'settled':
      return (
        <View style={styles.stack}>
          {settlement !== null && (
            <SettlementHeroCard
              phase="settled"
              settlement={settlement}
              activeMinutes={validationResult?.activeMinutes ?? 0}
            />
          )}
          {runStats}
        </View>
      )
    case 'rejected':
      return (
        <View style={styles.stack}>
          <SummaryHeadline
            metaItems={['Run finished', 'Didn’t count']}
            title="This run didn’t count"
            message={describeRejectionReason(activitySession.rejectionReason)}
            isError
          />
          {runStats}
        </View>
      )
    case 'active':
    case 'validating':
      return (
        <SummaryHeadline
          metaItems={['Run finished', 'Validating']}
          title="Checking your run…"
          message="The server is validating your GPS."
          isLoading
        />
      )
    case 'abandoned':
      return (
        <SummaryHeadline
          metaItems={['Run closed']}
          title="This run was closed"
          message="Nothing arrived from it for 30 minutes, so it was closed without a result."
          isError
        />
      )
    default: {
      const unhandledStatus: never = activitySession.status
      throw new Error(`Unhandled activity session status: ${String(unhandledStatus)}`)
    }
  }
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.small,
  },
})
