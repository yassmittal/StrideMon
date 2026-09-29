import { router } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'
import { Button } from '../../src/components/ui/Button'
import { Screen } from '../../src/components/ui/Screen'
import { ApiHealthStatus } from '../../src/features/health/components/ApiHealthStatus'
import { useApiHealth } from '../../src/features/health/hooks/useApiHealth'
import { colors, fontSizes, fontWeights, spacing } from '../../src/theme'

export default function WelcomeScreen() {
  const apiHealthQuery = useApiHealth()

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.title}>StrideMon</Text>
        <Text style={styles.tagline}>Walk. Earn. Upgrade your Sneaker.</Text>
      </View>
      {/* Kept from Phase 0: a wrong LAN IP shows up here, before sign-in fails on it. */}
      <ApiHealthStatus
        health={apiHealthQuery.data}
        error={apiHealthQuery.error}
        isLoading={apiHealthQuery.isLoading}
        isRefetching={apiHealthQuery.isRefetching}
        onRetryPress={() => apiHealthQuery.refetch()}
      />
      <Button label="Get started" onPress={() => router.push('/connect-wallet')} />
    </Screen>
  )
}

const styles = StyleSheet.create({
  hero: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.small,
  },
  title: {
    fontSize: fontSizes.display,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  tagline: {
    fontSize: fontSizes.title,
    color: colors.textSecondary,
  },
})
