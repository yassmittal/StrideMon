import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { Button } from '../../src/components/ui/Button'
import { Screen } from '../../src/components/ui/Screen'
import { useCurrentUser } from '../../src/features/auth/hooks/useCurrentUser'
import { useSignOut } from '../../src/features/auth/hooks/useSignOut'
import { MonBalance } from '../../src/features/wallet/components/MonBalance'
import { WalletAddress } from '../../src/features/wallet/components/WalletAddress'
import { useMonBalance } from '../../src/features/wallet/hooks/useMonBalance'
import { colors, radii, spacing, textStyles } from '../../src/theme'

export default function ProfileScreen() {
  const currentUserQuery = useCurrentUser()
  const walletAddress = currentUserQuery.data?.user.walletAddress
  const monBalanceQuery = useMonBalance(walletAddress)
  const { signOut, isSigningOut } = useSignOut()

  return (
    <Screen>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.card}>
        {currentUserQuery.isLoading ? (
          <ActivityIndicator color={colors.primary} accessibilityLabel="Loading your profile" />
        ) : walletAddress === undefined ? (
          <View style={styles.errorState}>
            <Text style={styles.error}>Couldn’t load your profile.</Text>
            <Button
              label="Try again"
              variant="secondary"
              onPress={() => currentUserQuery.refetch()}
              isLoading={currentUserQuery.isRefetching}
            />
          </View>
        ) : (
          <>
            <Text style={styles.caption}>Signed in as</Text>
            <WalletAddress walletAddress={walletAddress} />
            <MonBalance
              balance={monBalanceQuery.data}
              isLoading={monBalanceQuery.isLoading}
              isError={monBalanceQuery.isError}
            />
          </>
        )}
      </View>
      <Button label="Sign out" variant="secondary" onPress={signOut} isLoading={isSigningOut} />
    </Screen>
  )
}

const styles = StyleSheet.create({
  title: {
    ...textStyles.title,
    color: colors.textPrimary,
  },
  card: {
    padding: spacing.large,
    borderRadius: radii.medium,
    backgroundColor: colors.surface,
    gap: spacing.small,
  },
  caption: {
    ...textStyles.caption,
    color: colors.textSecondary,
  },
  errorState: {
    gap: spacing.medium,
  },
  error: {
    ...textStyles.body,
    color: colors.danger,
  },
})
