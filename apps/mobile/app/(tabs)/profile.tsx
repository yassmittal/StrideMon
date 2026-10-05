import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { Button } from '../../src/components/ui/Button'
import { ErrorState } from '../../src/components/ui/ErrorState'
import { MetaLabel } from '../../src/components/ui/MetaLabel'
import { Panel } from '../../src/components/ui/Panel'
import { Screen } from '../../src/components/ui/Screen'
import { ScreenTitle } from '../../src/components/ui/ScreenTitle'
import { useCurrentUser } from '../../src/features/auth/hooks/useCurrentUser'
import { useSignOut } from '../../src/features/auth/hooks/useSignOut'
import { MonBalance } from '../../src/features/wallet/components/MonBalance'
import { WalletAddress } from '../../src/features/wallet/components/WalletAddress'
import { useMonBalance } from '../../src/features/wallet/hooks/useMonBalance'
import { colors, spacing } from '../../src/theme'

export default function ProfileScreen() {
  const currentUserQuery = useCurrentUser()
  const walletAddress = currentUserQuery.data?.user.walletAddress
  const monBalanceQuery = useMonBalance(walletAddress)
  const { signOut, isSigningOut } = useSignOut()

  return (
    <Screen isScrollable>
      <ScreenTitle title="Profile" metaItems={['Monad testnet']} />
      <Panel>
        {currentUserQuery.isLoading ? (
          <ActivityIndicator color={colors.textPrimary} accessibilityLabel="Loading your profile" />
        ) : walletAddress === undefined ? (
          <ErrorState
            message="Couldn’t load your profile."
            onRetryPress={() => currentUserQuery.refetch()}
            isRetrying={currentUserQuery.isRefetching}
          />
        ) : (
          <View style={styles.walletSection}>
            <MetaLabel items={['Signed in as']} />
            <WalletAddress walletAddress={walletAddress} />
          </View>
        )}
      </Panel>
      {walletAddress !== undefined && (
        <Panel>
          <MonBalance
            balance={monBalanceQuery.data}
            isLoading={monBalanceQuery.isLoading}
            isError={monBalanceQuery.isError}
          />
        </Panel>
      )}
      <View style={styles.signOut}>
        <Button label="Sign out" variant="secondary" onPress={signOut} isLoading={isSigningOut} />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  walletSection: {
    gap: spacing.small,
  },
  signOut: {
    paddingTop: spacing.large,
  },
})
