import type { HealthResponse } from '@stridemon/shared/api-contracts'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { Button } from '../../../components/ui/Button'
import { ApiError } from '../../../lib/api-client'
import { colors, fontSizes, fontWeights, radii, spacing } from '../../../theme'

type ApiHealthStatusProps = {
  health: HealthResponse | undefined
  error: Error | null
  isLoading: boolean
  isRefetching: boolean
  onRetryPress: () => void
}

export function ApiHealthStatus({
  health,
  error,
  isLoading,
  isRefetching,
  onRetryPress,
}: ApiHealthStatusProps) {
  if (isLoading) {
    return (
      <View style={styles.card} accessibilityLabel="Checking the API">
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.detail}>Checking the API…</Text>
      </View>
    )
  }

  if (error !== null || health === undefined) {
    return (
      <View style={styles.card}>
        <Text style={[styles.headline, styles.headlineDanger]}>API: unreachable</Text>
        <Text style={styles.detail}>{describeHealthError(error)}</Text>
        <Button label="Try again" onPress={onRetryPress} isLoading={isRefetching} />
      </View>
    )
  }

  return (
    <View style={styles.card}>
      <Text style={[styles.headline, styles.headlineSuccess]}>API: {health.status}</Text>
      <Text style={styles.detail}>MongoDB: {health.mongo}</Text>
      <Button label="Check again" onPress={onRetryPress} isLoading={isRefetching} />
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
  card: {
    padding: spacing.large,
    borderRadius: radii.medium,
    backgroundColor: colors.surface,
    gap: spacing.medium,
  },
  headline: {
    fontSize: fontSizes.title,
    fontWeight: fontWeights.bold,
  },
  headlineSuccess: {
    color: colors.success,
  },
  headlineDanger: {
    color: colors.danger,
  },
  detail: {
    fontSize: fontSizes.body,
    color: colors.textSecondary,
  },
})
