import type {
  ActivitySessionSettlement,
  ActivityValidationResult,
} from '@stridemon/shared/api-contracts'
import { StyleSheet, Text, View } from 'react-native'
import { Card } from '../../../components/ui/Card'
import { StatValue } from '../../../components/ui/StatValue'
import { formatDistance } from '../../../lib/format/format-distance'
import { formatDuration } from '../../../lib/format/format-duration'
import { formatSpeed } from '../../../lib/format/format-speed'
import { colors, fontSizes, fontWeights, spacing } from '../../../theme'
import { describeWarning } from '../activity-session-copy'

type RunStatsCardProps = {
  validationResult: ActivityValidationResult
  durationSeconds: number | null
  /** Once settled: explains when energy capped the rewarded minutes. */
  settlement: ActivitySessionSettlement | null
}

/** A finished run's validated numbers, and anything that didn't count. */
export function RunStatsCard({ validationResult, durationSeconds, settlement }: RunStatsCardProps) {
  const hasActiveMinutes = validationResult.activeMinutes > 0
  const wasCappedByEnergy =
    settlement !== null && settlement.rewardedMinutes < validationResult.activeMinutes

  return (
    <Card>
      <Text style={styles.title} accessibilityRole="header">
        Your run
      </Text>
      <View style={styles.grid}>
        <View style={styles.cell}>
          <StatValue
            label="Duration"
            value={durationSeconds === null ? '—' : formatDuration(durationSeconds)}
          />
        </View>
        <View style={styles.cell}>
          <StatValue label="Active minutes" value={String(validationResult.activeMinutes)} />
        </View>
        {/* With no counted minute these would read 0 m and 0 km/h, which looks like a bug. */}
        {hasActiveMinutes && (
          <>
            <View style={styles.cell}>
              <StatValue label="Distance" value={formatDistance(validationResult.distanceMeters)} />
            </View>
            <View style={styles.cell}>
              <StatValue
                label="Average speed"
                value={formatSpeed(validationResult.averageSpeedKilometersPerHour)}
              />
            </View>
          </>
        )}
      </View>

      {wasCappedByEnergy && (
        <Text style={styles.note}>
          Your Sneaker had energy for {settlement.rewardedMinutes} of your{' '}
          {validationResult.activeMinutes} active minutes. Energy refills over time.
        </Text>
      )}
      {validationResult.warnings.map((warning) => (
        <Text key={warning} style={styles.warning}>
          {describeWarning(warning)}
        </Text>
      ))}
      {hasActiveMinutes && (
        <Text style={styles.caption}>Distance and speed count active minutes only.</Text>
      )}
    </Card>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: fontSizes.body,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.medium,
  },
  cell: {
    width: '50%',
  },
  note: {
    fontSize: fontSizes.body,
    color: colors.textPrimary,
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
