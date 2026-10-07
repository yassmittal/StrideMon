import { StyleSheet, Text, View } from 'react-native'
import { Button } from '../../../components/ui/Button'
import { ApiError } from '../../../lib/api-client'
import { colors, radii, spacing, textStyles } from '../../../theme'

type ApiHealthStatusProps = {
  error: Error | null
  isRefetching: boolean
  onRetryPress: () => void
}

/**
 * Nothing while the API answers: players don't need to see it. When it can't be reached, a plain
 * reason and a retry, before sign-in fails on it. Dev builds add the usual cause (a wrong LAN IP).
 */
export function ApiHealthStatus({ error, isRefetching, onRetryPress }: ApiHealthStatusProps) {
  if (error === null) return null

  return (
    <View style={styles.errorPanel}>
      <Text style={styles.message}>{describeHealthError(error)}</Text>
      <Button
        label="Try again"
        variant="secondary"
        onPress={onRetryPress}
        isLoading={isRefetching}
      />
    </View>
  )
}

function describeHealthError(error: Error): string {
  const isNetworkFailure = error instanceof ApiError && error.code === 'NETWORK_UNREACHABLE'
  if (isNetworkFailure && __DEV__) {
    return 'The phone could not reach the API. Check EXPO_PUBLIC_API_BASE_URL is your laptop’s LAN IP and both are on the same Wi-Fi.'
  }
  return 'StrideMon can’t be reached right now. Check your connection and try again.'
}

const styles = StyleSheet.create({
  errorPanel: {
    padding: spacing.large,
    borderRadius: radii.medium,
    backgroundColor: colors.dangerSurface,
    gap: spacing.medium,
  },
  message: {
    ...textStyles.body,
    color: colors.textPrimary,
  },
})
