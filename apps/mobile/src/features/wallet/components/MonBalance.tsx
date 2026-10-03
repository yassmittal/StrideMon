import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { CounterText } from '../../../components/ui/CounterText'
import { MetaLabel } from '../../../components/ui/MetaLabel'
import { formatTokenAmount } from '../../../lib/format/format-token-amount'
import { colors, spacing, textStyles } from '../../../theme'

type MonBalanceProps = {
  balance: { value: bigint; decimals: number; symbol: string } | undefined
  isLoading: boolean
  isError: boolean
}

/** The wallet's testnet MON, which pays the fee for repair, upgrade and transfer. */
export function MonBalance({ balance, isLoading, isError }: MonBalanceProps) {
  return (
    <View style={styles.container}>
      <MetaLabel items={['Testnet MON balance']} />
      {isLoading ? (
        <ActivityIndicator color={colors.textPrimary} accessibilityLabel="Loading balance" />
      ) : isError || balance === undefined ? (
        <Text style={styles.error}>Couldn’t read the balance from Monad.</Text>
      ) : (
        <CounterText
          value={formatTokenAmount({
            amountWei: balance.value,
            decimals: balance.decimals,
            symbol: balance.symbol,
          })}
          size="title"
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.small,
  },
  error: {
    ...textStyles.body,
    color: colors.danger,
  },
})
