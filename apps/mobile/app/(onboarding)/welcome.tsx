import { router } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'
import { BrandMark } from '../../src/components/ui/BrandMark'
import { Button } from '../../src/components/ui/Button'
import { MetaLabel } from '../../src/components/ui/MetaLabel'
import { Screen } from '../../src/components/ui/Screen'
import { ApiHealthStatus } from '../../src/features/health/components/ApiHealthStatus'
import { useApiHealth } from '../../src/features/health/hooks/useApiHealth'
import {
  buildFullDescenderLineStyle,
  colors,
  layout,
  readOpticalPullLeft,
  spacing,
  textStyles,
} from '../../src/theme'

export default function WelcomeScreen() {
  const apiHealthQuery = useApiHealth()

  return (
    <Screen>
      <View style={styles.brand}>
        <BrandMark size={layout.brandMarkSize} />
        <MetaLabel items={['StrideMon', 'Move to earn', 'Monad']} />
      </View>
      <View style={styles.hero}>
        <View accessible accessibilityRole="header" accessibilityLabel="Walk. Earn. Upgrade.">
          <Text style={styles.headline}>Walk.{'\n'}Earn.</Text>
          <Text style={[styles.headline, styles.headlineLastLine]}>Upgrade.</Text>
        </View>
        <Text style={styles.intro}>
          Your Sneaker is an NFT on Monad. Walk or run with it to earn STRIDE, then spend STRIDE to
          repair and level it up.
        </Text>
      </View>
      {/* Only when the API can't be reached: then sign-in would fail on it. */}
      <ApiHealthStatus
        error={apiHealthQuery.error}
        isRefetching={apiHealthQuery.isRefetching}
        onRetryPress={() => apiHealthQuery.refetch()}
      />
      <Button label="Connect wallet" onPress={() => router.push('/connect-wallet')} />
    </Screen>
  )
}

const styles = StyleSheet.create({
  brand: {
    gap: spacing.large,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.large,
  },
  headline: {
    ...textStyles.displayLarge,
    marginLeft: readOpticalPullLeft(textStyles.displayLarge.fontSize),
    color: colors.textPrimary,
  },
  // Keeps the g of "Upgrade." on Android.
  headlineLastLine: buildFullDescenderLineStyle(textStyles.displayLarge),
  intro: {
    ...textStyles.intro,
    color: colors.textPrimary,
  },
})
