import { StyleSheet, Text, View } from 'react-native'
import { Button } from '../../../components/ui/Button'
import { colors, fontSizes, radii, spacing } from '../../../theme'
import { WalletAddress } from '../../wallet/components/WalletAddress'
import { describeSignInError, type SignInState } from '../sign-in-state'

type SignInPanelProps = {
  walletAddress: string | undefined
  signInState: SignInState
  onConnectWalletPress: () => void
  onSignInPress: () => void
  onDisconnectWalletPress: () => void
}

/** Connect a wallet, then sign once to prove it's yours. Two explicit steps (mobile-app.md). */
export function SignInPanel({
  walletAddress,
  signInState,
  onConnectWalletPress,
  onSignInPress,
  onDisconnectWalletPress,
}: SignInPanelProps) {
  if (walletAddress === undefined) {
    return (
      <View style={styles.card}>
        <Text style={styles.explanation}>
          StrideMon uses your wallet as your account. Connect the wallet app on this phone to
          continue.
        </Text>
        <Text style={styles.caption}>
          Turn on the Monad Testnet network (chain 10143) in your wallet first. Wallets only share
          accounts for networks they have enabled.
        </Text>
        <Button label="Connect wallet" onPress={onConnectWalletPress} />
      </View>
    )
  }

  const isBusy = signInState.phase !== 'idle' && signInState.phase !== 'failed'

  return (
    <View style={styles.card}>
      <Text style={styles.caption}>Connected wallet</Text>
      <WalletAddress walletAddress={walletAddress} />
      <Text style={styles.explanation}>
        Sign a message to prove this wallet is yours. It’s free and sends no transaction.
      </Text>
      <SignInProgress signInState={signInState} />
      <Button
        label="Sign to verify it’s you"
        onPress={onSignInPress}
        isLoading={isBusy}
        accessibilityLabel="Sign to verify it’s you"
      />
      <Button
        label="Use a different wallet"
        variant="secondary"
        onPress={onDisconnectWalletPress}
        isDisabled={isBusy}
      />
    </View>
  )
}

function SignInProgress({ signInState }: { signInState: SignInState }) {
  switch (signInState.phase) {
    case 'idle':
      return null
    case 'requestingMessage':
      return <Text style={styles.progress}>Preparing the sign-in request…</Text>
    case 'awaitingSignature':
      return <Text style={styles.progress}>Approve the signature request in your wallet app.</Text>
    case 'verifying':
      return <Text style={styles.progress}>Checking your signature…</Text>
    case 'failed':
      return (
        <Text style={styles.error} accessibilityRole="alert">
          {describeSignInError(signInState.errorCode)}
        </Text>
      )
    default: {
      const unhandledPhase: never = signInState
      throw new Error(`Unhandled sign-in phase: ${JSON.stringify(unhandledPhase)}`)
    }
  }
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.large,
    borderRadius: radii.medium,
    backgroundColor: colors.surface,
    gap: spacing.medium,
  },
  caption: {
    fontSize: fontSizes.caption,
    color: colors.textSecondary,
  },
  explanation: {
    fontSize: fontSizes.body,
    color: colors.textSecondary,
  },
  progress: {
    fontSize: fontSizes.body,
    color: colors.textPrimary,
  },
  error: {
    fontSize: fontSizes.body,
    color: colors.danger,
  },
})
