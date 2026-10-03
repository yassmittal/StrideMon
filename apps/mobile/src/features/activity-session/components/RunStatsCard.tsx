import type {
  ActivitySessionSettlement,
  ActivityValidationResult,
} from '@stridemon/shared/api-contracts'
import { StyleSheet, Text, View } from 'react-native'
import { MetaLabel } from '../../../components/ui/MetaLabel'
import { Panel } from '../../../components/ui/Panel'
import { StatValue } from '../../../components/ui/StatValue'
import { formatDistance } from '../../../lib/format/format-distance'
import { formatDuration } from '../../../lib/format/format-duration'
import { formatSpeed } from '../../../lib/format/format-speed'
import { colors, spacing, textStyles } from '../../../theme'
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
    <Panel>
      <View accessibilityRole="header">
        <MetaLabel items={['Your run']} />
      </View>
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
    </Panel>
  )
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.medium,
  },
  cell: {
    width: '50%',
  },
  note: {
    ...textStyles.body,
    color: colors.textPrimary,
  },
  warning: {
    ...textStyles.body,
    color: colors.textSecondary,
  },
  caption: {
    ...textStyles.caption,
    color: colors.textSecondary,
  },
})
