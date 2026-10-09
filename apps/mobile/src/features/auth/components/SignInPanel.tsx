import { StyleSheet, Text, View } from 'react-native'
import { Button } from '../../../components/ui/Button'
import { ExternalLink } from '../../../components/ui/ExternalLink'
import { buildHelpUrl } from '../../../config/website-urls'
import { colors, radii, spacing, textStyles } from '../../../theme'
import { WalletAddress } from '../../wallet/components/WalletAddress'
import { describeSignInError, findSignInHelpTopicId, type SignInState } from '../sign-in-state'

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
        <ExternalLink label="How to add Monad Testnet" url={buildHelpUrl('add-monad-testnet')} />
        <Button label="Connect wallet" onPress={onConnectWalletPress} />
        <ExternalLink label="Can’t connect? Get help" url={buildHelpUrl('app-cant-connect')} />
      </View>
    )
  }

  const isBusy = signInState.phase !== 'idle' && signInState.phase !== 'failed'

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Connected wallet</Text>
      <WalletAddress walletAddress={walletAddress} />
      <Text style={styles.explanation}>
        Sign a message to prove this wallet is yours. It’s free and sends no transaction.
      </Text>
      <SignInProgress signInState={signInState} />
      <View style={styles.actions}>
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
        <View>
          <Text style={styles.error} accessibilityRole="alert">
            {describeSignInError(signInState.errorCode)}
          </Text>
          <ExternalLink
            label="Get help"
            url={buildHelpUrl(findSignInHelpTopicId(signInState.errorCode))}
          />
        </View>
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
  actions: {
    gap: spacing.small,
  },
  caption: {
    ...textStyles.caption,
    color: colors.textSecondary,
  },
  label: {
    ...textStyles.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  explanation: {
    ...textStyles.body,
    color: colors.textPrimary,
  },
  progress: {
    ...textStyles.body,
    color: colors.textPrimary,
  },
  error: {
    ...textStyles.body,
    color: colors.danger,
  },
})
