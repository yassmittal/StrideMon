import { StyleSheet, Text, View } from 'react-native'
import { CounterText } from '../../../components/ui/CounterText'
import { CrossMarks } from '../../../components/ui/CrossMarks'
import { MetaLabel } from '../../../components/ui/MetaLabel'
import { ProgressBar } from '../../../components/ui/ProgressBar'
import type { ApiClientErrorCode } from '../../../lib/api-client'
import { formatDistance } from '../../../lib/format/format-distance'
import { formatDuration } from '../../../lib/format/format-duration'
import { formatSpeed } from '../../../lib/format/format-speed'
import { formatStrideAmount } from '../../../lib/format/format-stride-amount'
import { colors, spacing, textStyles } from '../../../theme'
import type { LiveRunStats as LiveRunStatsValues } from '../live-run-stats'

type LiveRunStatsProps = {
  liveRunStats: LiveRunStatsValues
  energyAtStart: number
  unsentSampleCount: number
  uploadErrorCode: ApiClientErrorCode | null
}

/**
 * The live run on the black run screen (design-system.md §9): time and distance huge,
 * energy as a lime bar, and the estimated reward framed by "+" marks.
 */
export function LiveRunStats({
  liveRunStats,
  energyAtStart,
  unsentSampleCount,
  uploadErrorCode,
}: LiveRunStatsProps) {
  const speedDisplay =
    liveRunStats.currentSpeedKilometersPerHour === null
      ? '—'
      : formatSpeed(liveRunStats.currentSpeedKilometersPerHour)
  const rewardDisplay = `+${formatStrideAmount(liveRunStats.estimatedRewardWei)}`

  return (
    <View style={styles.container}>
      <LiveStat label="Time" value={formatDuration(liveRunStats.elapsedSeconds)} />
      <LiveStat label="Distance" value={formatDistance(liveRunStats.distanceMeters)} />
      <View accessible accessibilityLabel={`Speed: ${speedDisplay}`}>
        <MetaLabel items={['Speed', speedDisplay]} tone="dark" />
      </View>

      <ProgressBar
        label="Energy left (estimated)"
        value={liveRunStats.estimatedEnergyLeft}
        maximum={energyAtStart}
        tone="dark"
      />

      <CrossMarks caption="Estimated reward" tone="dark">
        <View accessible accessibilityLabel={`Reward (estimated): ${rewardDisplay}`}>
          <CounterText value={rewardDisplay} size="title" tone="dark" />
        </View>
      </CrossMarks>
      <Text style={styles.caption}>
        Estimates assume every minute counts. The server checks your GPS when you stop.
      </Text>

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

/** One huge live number with its label above, like Lusion's preloader digits. */
function LiveStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.liveStat} accessible accessibilityLabel={`${label}: ${value}`}>
      <MetaLabel items={[label]} tone="dark" />
      <CounterText value={value} size="displayHuge" tone="dark" />
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
    gap: spacing.large,
  },
  liveStat: {
    gap: spacing.small,
  },
  caption: {
    ...textStyles.caption,
    color: colors.textOnDarkMuted,
  },
})
