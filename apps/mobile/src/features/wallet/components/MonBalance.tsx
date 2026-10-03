import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { formatTokenAmount } from '../../../lib/format/format-token-amount'
import { colors, spacing, textStyles } from '../../../theme'

type MonBalanceProps = {
  balance: { value: bigint; decimals: number; symbol: string } | undefined
  isLoading: boolean
  isError: boolean
}

export function MonBalance({ balance, isLoading, isError }: MonBalanceProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.caption}>Testnet MON balance</Text>
      {isLoading ? (
        <ActivityIndicator color={colors.primary} accessibilityLabel="Loading balance" />
      ) : isError || balance === undefined ? (
        <Text style={styles.error}>Couldn’t read the balance from Monad.</Text>
      ) : (
        <Text style={styles.amount}>
          {formatTokenAmount({
            amountWei: balance.value,
            decimals: balance.decimals,
            symbol: balance.symbol,
          })}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.extraSmall,
  },
  caption: {
    ...textStyles.caption,
    color: colors.textSecondary,
  },
  amount: {
    ...textStyles.title,
    color: colors.textPrimary,
  },
  error: {
    ...textStyles.body,
    color: colors.danger,
  },
})
