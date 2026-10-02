import type { ActivitySessionStatus } from '@stridemon/shared/domain'
import { StyleSheet, Text, View } from 'react-native'
import { colors, fontSizes, fontWeights, radii, spacing } from '../../../theme'
import { describeActivitySessionStatus, type StatusTone } from '../activity-session-copy'

const TONE_COLORS: Record<StatusTone, { text: string; background: string }> = {
  neutral: { text: colors.textSecondary, background: colors.background },
  pending: { text: colors.primary, background: colors.primarySurface },
  success: { text: colors.success, background: colors.successSurface },
  danger: { text: colors.danger, background: colors.dangerSurface },
}

/** "Settled", "Settling", "Didn’t count"… as a small colored pill. */
export function ActivitySessionStatusBadge({ status }: { status: ActivitySessionStatus }) {
  const { label, tone } = describeActivitySessionStatus(status)
  const toneColors = TONE_COLORS[tone]
  return (
    <View style={[styles.badge, { backgroundColor: toneColors.background }]}>
      <Text style={[styles.label, { color: toneColors.text }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.extraSmall / 2,
    paddingHorizontal: spacing.small,
    borderRadius: radii.pill,
  },
  label: {
    fontSize: fontSizes.caption,
    fontWeight: fontWeights.semibold,
  },
})
