import type { HealthResponse } from '@stridemon/shared/api-contracts'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { Button } from '../../../components/ui/Button'
import { ApiError } from '../../../lib/api-client'
import { colors, layout, radii, spacing, textStyles } from '../../../theme'

type ApiHealthStatusProps = {
  health: HealthResponse | undefined
  error: Error | null
  isLoading: boolean
  isRefetching: boolean
  onRetryPress: () => void
}

/** One quiet status line on the welcome screen, or the reason the API can't be reached. */
export function ApiHealthStatus({
  health,
  error,
  isLoading,
  isRefetching,
  onRetryPress,
}: ApiHealthStatusProps) {
  if (isLoading) {
    return (
      <View style={styles.row} accessibilityLabel="Checking the API">
        <ActivityIndicator size="small" color={colors.textPrimary} />
        <Text style={styles.status}>Checking the API…</Text>
      </View>
    )
  }

  if (error !== null || health === undefined) {
    return (
      <View style={styles.errorPanel}>
        <View style={styles.row}>
          <View style={[styles.statusDot, styles.statusDotDown]} />
          <Text style={[styles.status, styles.statusDown]}>API: unreachable</Text>
        </View>
        <Text style={styles.detail}>{describeHealthError(error)}</Text>
        <Button
          label="Try again"
          variant="secondary"
          onPress={onRetryPress}
          isLoading={isRefetching}
        />
      </View>
    )
  }

  return (
    <View style={styles.row}>
      <View style={[styles.statusDot, styles.statusDotUp]} />
      <Text style={styles.status}>API: {health.status}</Text>
      <Text style={styles.status}>•</Text>
      <Text style={styles.status}>MongoDB: {health.mongo}</Text>
    </View>
  )
}

function describeHealthError(error: Error | null): string {
  if (!(error instanceof ApiError)) return 'Something unexpected went wrong.'
  switch (error.code) {
    case 'NETWORK_UNREACHABLE':
      return 'The phone could not reach the API. Check EXPO_PUBLIC_API_BASE_URL is your laptop’s LAN IP and both are on the same Wi-Fi.'
    default:
      return error.message
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
  },
  statusDot: {
    width: layout.callToActionDotSize,
    height: layout.callToActionDotSize,
    borderRadius: radii.pill,
  },
  // Lime only as a fill, ringed in black so it reads on the off-white page.
  statusDotUp: {
    backgroundColor: colors.highlight,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.textPrimary,
  },
  statusDotDown: {
    backgroundColor: colors.danger,
  },
  status: {
    ...textStyles.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  statusDown: {
    color: colors.danger,
  },
  errorPanel: {
    padding: spacing.large,
    borderRadius: radii.medium,
    backgroundColor: colors.dangerSurface,
    gap: spacing.medium,
  },
  detail: {
    ...textStyles.body,
    color: colors.textPrimary,
  },
})
