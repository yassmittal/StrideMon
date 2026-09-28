import { StyleSheet, Text } from 'react-native'
import { Screen } from '../src/components/ui/Screen'
import { ApiHealthStatus } from '../src/features/health/components/ApiHealthStatus'
import { useApiHealth } from '../src/features/health/hooks/useApiHealth'
import { colors, fontSizes, fontWeights } from '../src/theme'

export default function HomeScreen() {
  const apiHealthQuery = useApiHealth()

  return (
    <Screen>
      <Text style={styles.title}>StrideMon</Text>
      <Text style={styles.tagline}>Walk. Earn. Upgrade your Sneaker.</Text>
      <ApiHealthStatus
        health={apiHealthQuery.data}
        error={apiHealthQuery.error}
        isLoading={apiHealthQuery.isLoading}
        isRefetching={apiHealthQuery.isRefetching}
        onRetryPress={() => apiHealthQuery.refetch()}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: fontSizes.display,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  tagline: {
    fontSize: fontSizes.body,
    color: colors.textSecondary,
  },
})
