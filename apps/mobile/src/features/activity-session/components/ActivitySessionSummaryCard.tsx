import type { ActivitySession } from '@stridemon/shared/api-contracts'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { Card } from '../../../components/ui/Card'
import { colors, fontSizes, fontWeights, spacing } from '../../../theme'
import { describeRejectionReason } from '../activity-session-copy'
import { calculateActivitySessionDurationSeconds } from '../activity-session-duration'
import { RunStatsCard } from './RunStatsCard'
import { SettlementHeroCard } from './SettlementHeroCard'

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
          <MessageCard
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
        <Card>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.title} accessibilityRole="header">
            Checking your run…
          </Text>
          <Text style={styles.message}>The server is validating your GPS.</Text>
        </Card>
      )
    case 'abandoned':
      return (
        <MessageCard
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

function MessageCard({
  title,
  message,
  isError = false,
}: {
  title: string
  message: string
  isError?: boolean
}) {
  return (
    <Card>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <Text style={[styles.message, isError && styles.errorMessage]}>{message}</Text>
    </Card>
  )
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.medium,
  },
  title: {
    fontSize: fontSizes.title,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  message: {
    fontSize: fontSizes.body,
    color: colors.textPrimary,
  },
  errorMessage: {
    color: colors.danger,
  },
})
