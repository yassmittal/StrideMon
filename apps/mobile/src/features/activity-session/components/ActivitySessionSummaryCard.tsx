import type { ActivitySession, ActivityValidationResult } from '@stridemon/shared/api-contracts'
import type {
  ActivitySessionRejectionReason,
  ActivityValidationWarning,
} from '@stridemon/shared/domain'
import { StyleSheet, Text, View } from 'react-native'
import { Card } from '../../../components/ui/Card'
import { StatValue } from '../../../components/ui/StatValue'
import { formatDistance } from '../../../lib/format/format-distance'
import { formatSpeed } from '../../../lib/format/format-speed'
import { colors, fontSizes, fontWeights, spacing } from '../../../theme'

type ActivitySessionSummaryCardProps = {
  activitySession: ActivitySession
}

/** How the API judged a finished run: validated numbers and warnings, or why it didn't count. */
export function ActivitySessionSummaryCard({ activitySession }: ActivitySessionSummaryCardProps) {
  switch (activitySession.status) {
    case 'settling':
    case 'settled':
      return activitySession.validationResult === null ? (
        <MessageCard title="Run validated" message="Your run was validated." />
      ) : (
        <ValidatedRunCard validationResult={activitySession.validationResult} />
      )
    case 'rejected':
      return (
        <MessageCard
          title="This run didn’t count"
          message={describeRejectionReason(activitySession.rejectionReason)}
          isError
        />
      )
    case 'active':
    case 'validating':
      return <MessageCard title="Checking your run…" message="The server is validating your GPS." />
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

function ValidatedRunCard({ validationResult }: { validationResult: ActivityValidationResult }) {
  return (
    <Card>
      <Text style={styles.title} accessibilityRole="header">
        Run validated
      </Text>
      <View style={styles.row}>
        <StatValue
          label="Active minutes"
          size="large"
          value={String(validationResult.activeMinutes)}
        />
      </View>
      <View style={styles.row}>
        <View style={styles.cell}>
          <StatValue label="Distance" value={formatDistance(validationResult.distanceMeters)} />
        </View>
        <View style={styles.cell}>
          <StatValue
            label="Average speed"
            value={formatSpeed(validationResult.averageSpeedKilometersPerHour)}
          />
        </View>
      </View>
      {validationResult.activeMinutes === 0 && (
        <Text style={styles.message}>
          No minute of this run counted. A minute counts when it’s a whole minute of moving at 1–20
          km/h, so walk for a few minutes at a steady pace, outdoors.
        </Text>
      )}
      {validationResult.warnings.map((warning) => (
        <Text key={warning} style={styles.warning}>
          {describeWarning(warning)}
        </Text>
      ))}
      <Text style={styles.caption}>
        Distance and speed count only active minutes. Each active minute uses one energy point and
        earns SOLE. Settling on Monad arrives in the next update.
      </Text>
    </Card>
  )
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

function describeRejectionReason(rejectionReason: ActivitySessionRejectionReason | null): string {
  switch (rejectionReason) {
    case 'MOCK_LOCATION_DETECTED':
      return 'This phone reported a simulated location during the run. Turn off any mock-location app and try again.'
    case 'INSUFFICIENT_ACTIVITY_DATA':
      return 'There wasn’t enough GPS data to count this run. Keep it going for at least a minute, outdoors.'
    case null:
      return 'The run was rejected.'
    default: {
      const unhandledReason: never = rejectionReason
      throw new Error(`Unhandled rejection reason: ${String(unhandledReason)}`)
    }
  }
}

function describeWarning(warning: ActivityValidationWarning): string {
  switch (warning) {
    case 'lowGpsAccuracy':
      return 'Some GPS points were too imprecise and were skipped.'
    case 'deviceClockMismatch':
      return 'Some GPS points had times that didn’t match the server clock and were skipped.'
    case 'sessionTooLong':
      return 'Only the first 4 hours of a run count.'
    case 'teleportDetected':
      return 'Some stretches moved faster than 40 km/h (a GPS jump or a vehicle) and didn’t count.'
    case 'samplingGap':
      return 'GPS went quiet for over a minute, so those minutes didn’t count.'
    case 'vehicleSpeedDetected':
      return 'Some minutes were faster than 20 km/h, which looks like a vehicle, so they didn’t count.'
    default: {
      const unhandledWarning: never = warning
      throw new Error(`Unhandled warning: ${String(unhandledWarning)}`)
    }
  }
}

const styles = StyleSheet.create({
  title: {
    fontSize: fontSizes.title,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.medium,
  },
  cell: {
    flex: 1,
  },
  message: {
    fontSize: fontSizes.body,
    color: colors.textPrimary,
  },
  errorMessage: {
    color: colors.danger,
  },
  warning: {
    fontSize: fontSizes.body,
    color: colors.textSecondary,
  },
  caption: {
    fontSize: fontSizes.caption,
    color: colors.textSecondary,
  },
})
