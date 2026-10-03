import { router } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'
import { Button } from '../../src/components/ui/Button'
import { MetaLabel } from '../../src/components/ui/MetaLabel'
import { Screen } from '../../src/components/ui/Screen'
import { ApiHealthStatus } from '../../src/features/health/components/ApiHealthStatus'
import { useApiHealth } from '../../src/features/health/hooks/useApiHealth'
import { colors, spacing, textStyles } from '../../src/theme'

// Lusion pulls display lines left so the glyph edge meets the gutter (design-system.md §3.3).
const OPTICAL_PULL_LEFT = -0.05 * (textStyles.displayLarge.fontSize ?? 0)

export default function WelcomeScreen() {
  const apiHealthQuery = useApiHealth()

  return (
    <Screen>
      <MetaLabel items={['StrideMon', 'Move to earn', 'Monad']} />
      <View style={styles.hero}>
        <Text style={styles.headline} accessibilityRole="header">
          Walk.{'\n'}Earn.{'\n'}Upgrade.
        </Text>
        <Text style={styles.intro}>
          Your Sneaker is an NFT on Monad. Walk or run with it to earn SOLE, then spend SOLE to
          repair and level it up.
        </Text>
      </View>
      {/* Kept from Phase 0: a wrong LAN IP shows up here, before sign-in fails on it. */}
      <ApiHealthStatus
        health={apiHealthQuery.data}
        error={apiHealthQuery.error}
        isLoading={apiHealthQuery.isLoading}
        isRefetching={apiHealthQuery.isRefetching}
        onRetryPress={() => apiHealthQuery.refetch()}
      />
      <Button label="Connect wallet" onPress={() => router.push('/connect-wallet')} />
    </Screen>
  )
}

const styles = StyleSheet.create({
  hero: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.large,
  },
  headline: {
    ...textStyles.displayLarge,
    marginLeft: OPTICAL_PULL_LEFT,
    color: colors.textPrimary,
  },
  intro: {
    ...textStyles.intro,
    color: colors.textPrimary,
  },
})
