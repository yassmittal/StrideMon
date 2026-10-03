import { SOLE_TOKEN_DECIMALS, SOLE_TOKEN_SYMBOL } from '@stridemon/chain'
import { StyleSheet, Text, View } from 'react-native'
import { Panel } from '../../../components/ui/Panel'
import { StatValue } from '../../../components/ui/StatValue'
import type { ApiClientErrorCode } from '../../../lib/api-client'
import { formatDistance } from '../../../lib/format/format-distance'
import { formatDuration } from '../../../lib/format/format-duration'
import { formatSpeed } from '../../../lib/format/format-speed'
import { formatTokenAmount } from '../../../lib/format/format-token-amount'
import { colors, spacing, textStyles } from '../../../theme'
import type { LiveRunStats as LiveRunStatsValues } from '../live-run-stats'

type LiveRunStatsProps = {
  liveRunStats: LiveRunStatsValues
  energyAtStart: number
  unsentSampleCount: number
  uploadErrorCode: ApiClientErrorCode | null
}

/** The live run: time, distance, speed, energy and reward, the last two estimated. */
export function LiveRunStats({
  liveRunStats,
  energyAtStart,
  unsentSampleCount,
  uploadErrorCode,
}: LiveRunStatsProps) {
  return (
    <View style={styles.container}>
      <StatValue label="Time" size="large" value={formatDuration(liveRunStats.elapsedSeconds)} />
      <Panel>
        <View style={styles.row}>
          <View style={styles.cell}>
            <StatValue label="Distance" value={formatDistance(liveRunStats.distanceMeters)} />
          </View>
          <View style={styles.cell}>
            <StatValue
              label="Speed"
              value={
                liveRunStats.currentSpeedKilometersPerHour === null
                  ? '—'
                  : formatSpeed(liveRunStats.currentSpeedKilometersPerHour)
              }
            />
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.cell}>
            <StatValue
              label="Energy left (estimated)"
              value={`${liveRunStats.estimatedEnergyLeft} / ${energyAtStart}`}
            />
          </View>
          <View style={styles.cell}>
            <StatValue
              label="Reward (estimated)"
              value={`+${formatTokenAmount({
                amountWei: liveRunStats.estimatedRewardWei,
                decimals: SOLE_TOKEN_DECIMALS,
                symbol: SOLE_TOKEN_SYMBOL,
              })}`}
            />
          </View>
        </View>
        <Text style={styles.caption}>
          Estimates assume every minute counts. The server checks your GPS when you stop.
        </Text>
      </Panel>
      <Text style={styles.caption} accessibilityLiveRegion="polite">
        {describeRecordingStatus({
          recordedSampleCount: liveRunStats.recordedSampleCount,
          unsentSampleCount,
          uploadErrorCode,
        })}
      </Text>
    </View>
  )
}

function describeRecordingStatus({
  recordedSampleCount,
  unsentSampleCount,
  uploadErrorCode,
}: {
  recordedSampleCount: number
  unsentSampleCount: number
  uploadErrorCode: ApiClientErrorCode | null
}): string {
  if (recordedSampleCount === 0) return 'Waiting for GPS… Head outside for a clear view of the sky.'
  const recordedText = `${recordedSampleCount} GPS points recorded.`
  if (uploadErrorCode !== null) {
    return `${recordedText} Couldn’t upload ${unsentSampleCount} yet; they’re saved on this phone and will be retried.`
  }
  if (unsentSampleCount > 0) return `${recordedText} ${unsentSampleCount} waiting to upload.`
  return `${recordedText} All uploaded.`
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.medium,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.medium,
  },
  cell: {
    flex: 1,
  },
  caption: {
    ...textStyles.caption,
    color: colors.textSecondary,
  },
})
