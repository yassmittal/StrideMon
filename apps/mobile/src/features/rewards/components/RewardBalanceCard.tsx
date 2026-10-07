import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { CounterText } from '../../../components/ui/CounterText'
import { ErrorState } from '../../../components/ui/ErrorState'
import { Panel } from '../../../components/ui/Panel'
import {
  formatStrideAmount,
  formatStrideAmountNumber,
} from '../../../lib/format/format-stride-amount'
import { colors, spacing, textStyles } from '../../../theme'
import { STRIDE_VALUE_NOTICE } from '../stride-value-notice'

type RewardBalanceCardProps = {
  rewardBalanceWei: bigint | undefined
  isLoading: boolean
  isError: boolean
  onRetryPress: () => void
}

/** The player's STRIDE, read from `StrideToken`, as a rolling counter. */
export function RewardBalanceCard({
  rewardBalanceWei,
  isLoading,
  isError,
  onRetryPress,
}: RewardBalanceCardProps) {
  return (
    <Panel>
      <View style={styles.labelRow}>
        <Text style={styles.label}>Your balance</Text>
        <Text style={styles.label}>STRIDE</Text>
      </View>
      <RewardBalanceContent
        rewardBalanceWei={rewardBalanceWei}
        isLoading={isLoading}
        isError={isError}
        onRetryPress={onRetryPress}
      />
      <Text style={styles.caption}>
        Earn STRIDE by walking and running with your Sneaker, then spend it on repairs and upgrades.
        {` ${STRIDE_VALUE_NOTICE}`}
      </Text>
    </Panel>
  )
}

function RewardBalanceContent({
  rewardBalanceWei,
  isLoading,
  isError,
  onRetryPress,
}: RewardBalanceCardProps) {
  if (isLoading) {
    return <ActivityIndicator color={colors.textPrimary} accessibilityLabel="Loading your STRIDE" />
  }
  if (isError || rewardBalanceWei === undefined) {
    return (
      <ErrorState
        message="Couldn’t read your STRIDE balance from Monad."
        onRetryPress={onRetryPress}
      />
    )
  }
  return (
    <CounterText
      value={formatStrideAmountNumber(rewardBalanceWei)}
      accessibilityLabel={`STRIDE balance: ${formatStrideAmount(rewardBalanceWei)}`}
    />
  )
}

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    ...textStyles.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  caption: {
    ...textStyles.caption,
    color: colors.textSecondary,
    paddingTop: spacing.small,
  },
})
