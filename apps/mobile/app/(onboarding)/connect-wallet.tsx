import { StyleSheet, Text, View } from 'react-native'
import { MetaLabel } from '../../src/components/ui/MetaLabel'
import { Screen } from '../../src/components/ui/Screen'
import { SignInPanel } from '../../src/features/auth/components/SignInPanel'
import { useSignIn } from '../../src/features/auth/hooks/useSignIn'
import { useWalletConnection } from '../../src/features/wallet/hooks/useWalletConnection'
import { colors, spacing, textStyles } from '../../src/theme'

const OPTICAL_PULL_LEFT = -0.05 * (textStyles.heading.fontSize ?? 0)

export default function ConnectWalletScreen() {
  const { walletAddress, openWalletPicker, disconnectWallet } = useWalletConnection()
  const { signInState, signIn } = useSignIn()

  return (
    <Screen isScrollable>
      <MetaLabel items={['Sign in', walletAddress === undefined ? 'Step 1 of 2' : 'Step 2 of 2']} />
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          {walletAddress === undefined ? 'Connect your wallet' : 'Prove it’s yours'}
        </Text>
      </View>
      <SignInPanel
        walletAddress={walletAddress}
        signInState={signInState}
        onConnectWalletPress={openWalletPicker}
        onSignInPress={signIn}
        onDisconnectWalletPress={disconnectWallet}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: spacing.sectionSmall,
  },
  title: {
    ...textStyles.heading,
    marginLeft: OPTICAL_PULL_LEFT,
    color: colors.textPrimary,
  },
})
