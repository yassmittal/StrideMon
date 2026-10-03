import type { ActivitySession } from '@stridemon/shared/api-contracts'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { formatDateTime } from '../../../lib/format/format-date-time'
import { formatDistance } from '../../../lib/format/format-distance'
import { formatDuration } from '../../../lib/format/format-duration'
import { formatSoleAmount } from '../../../lib/format/format-sole-amount'
import {
  colors,
  fontFamilies,
  MINIMUM_TOUCH_TARGET_SIZE,
  radii,
  spacing,
  textStyles,
} from '../../../theme'
import { describeActivitySessionStatus } from '../activity-session-copy'
import { calculateActivitySessionDurationSeconds } from '../activity-session-duration'
import { ActivitySessionStatusBadge } from './ActivitySessionStatusBadge'

type ActivitySessionHistoryItemProps = {
  activitySession: ActivitySession
  onPress: (activitySessionId: string) => void
}

/** One past run: when, how long and how far, what it earned, and its status. */
export function ActivitySessionHistoryItem({
  activitySession,
  onPress,
}: ActivitySessionHistoryItemProps) {
  const { validationResult, settlement } = activitySession
  const durationSeconds = calculateActivitySessionDurationSeconds(activitySession)
  // Counted distance only exists for counted minutes: "0 m" after a real walk reads as a bug.
  const details = [
    durationSeconds === null ? null : formatDuration(durationSeconds),
    validationResult === null || validationResult.activeMinutes === 0
      ? null
      : formatDistance(validationResult.distanceMeters),
  ].filter((detail) => detail !== null)
  const rewardAmountDisplay =
    settlement === null || settlement.rewardedMinutes === 0
      ? null
      : `+${formatSoleAmount(BigInt(settlement.rewardAmountWei))}`
  const startedAtDisplay = formatDateTime(activitySession.startedAt)
  const statusLabel = describeActivitySessionStatus(activitySession.status).label

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={[startedAtDisplay, ...details, rewardAmountDisplay, statusLabel]
        .filter((part) => part !== null)
        .join(', ')}
      accessibilityHint="Opens this run’s summary"
      onPress={() => onPress(activitySession.activitySessionId)}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={styles.main}>
        <Text style={styles.date}>{startedAtDisplay}</Text>
        {details.length > 0 && <Text style={styles.details}>{details.join('  •  ')}</Text>}
      </View>
      <View style={styles.side}>
        {rewardAmountDisplay !== null && <Text style={styles.reward}>{rewardAmountDisplay}</Text>}
        <ActivitySessionStatusBadge status={activitySession.status} />
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    minHeight: MINIMUM_TOUCH_TARGET_SIZE,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.medium,
    padding: spacing.large,
    borderRadius: radii.medium,
    backgroundColor: colors.surface,
  },
  rowPressed: {
    backgroundColor: colors.primarySurface,
  },
  main: {
    flex: 1,
    gap: spacing.small,
  },
  date: {
    ...textStyles.body,
    color: colors.textPrimary,
  },
  // Not a MetaLabel: uppercase would turn "22 m" into "22 M".
  details: {
    ...textStyles.caption,
    color: colors.textSecondary,
  },
  side: {
    alignItems: 'flex-end',
    gap: spacing.small,
  },
  reward: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontFamily: fontFamilies.monoRegular,
  },
})
