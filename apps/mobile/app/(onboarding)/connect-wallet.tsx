import { StyleSheet, Text } from 'react-native'
import { Screen } from '../../src/components/ui/Screen'
import { SignInPanel } from '../../src/features/auth/components/SignInPanel'
import { useSignIn } from '../../src/features/auth/hooks/useSignIn'
import { useWalletConnection } from '../../src/features/wallet/hooks/useWalletConnection'
import { colors, fontSizes, fontWeights } from '../../src/theme'

export default function ConnectWalletScreen() {
  const { walletAddress, openWalletPicker, disconnectWallet } = useWalletConnection()
  const { signInState, signIn } = useSignIn()

  return (
    <Screen>
      <Text style={styles.title}>Connect your wallet</Text>
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
  title: {
    fontSize: fontSizes.title,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
})
