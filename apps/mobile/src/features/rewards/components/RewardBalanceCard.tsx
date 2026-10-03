import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { CounterText } from '../../../components/ui/CounterText'
import { ErrorState } from '../../../components/ui/ErrorState'
import { Panel } from '../../../components/ui/Panel'
import { formatSoleAmount, formatSoleAmountNumber } from '../../../lib/format/format-sole-amount'
import { colors, spacing, textStyles } from '../../../theme'

type RewardBalanceCardProps = {
  rewardBalanceWei: bigint | undefined
  isLoading: boolean
  isError: boolean
  onRetryPress: () => void
}

/** The player's SOLE, read from `SoleToken`, as a rolling counter. */
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
        <Text style={styles.label}>SOLE</Text>
      </View>
      <RewardBalanceContent
        rewardBalanceWei={rewardBalanceWei}
        isLoading={isLoading}
        isError={isError}
        onRetryPress={onRetryPress}
      />
      <Text style={styles.caption}>
        Earn SOLE by walking and running with your Sneaker, then spend it on repairs and upgrades.
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
    return <ActivityIndicator color={colors.textPrimary} accessibilityLabel="Loading your SOLE" />
  }
  if (isError || rewardBalanceWei === undefined) {
    return (
      <ErrorState
        message="Couldn’t read your SOLE balance from Monad."
        onRetryPress={onRetryPress}
      />
    )
  }
  return (
    <CounterText
      value={formatSoleAmountNumber(rewardBalanceWei)}
      accessibilityLabel={`SOLE balance: ${formatSoleAmount(rewardBalanceWei)}`}
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
