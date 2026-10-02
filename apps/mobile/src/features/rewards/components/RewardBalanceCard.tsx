import { ActivityIndicator, StyleSheet, Text } from 'react-native'
import { Card } from '../../../components/ui/Card'
import { ErrorState } from '../../../components/ui/ErrorState'
import { StatValue } from '../../../components/ui/StatValue'
import { formatSoleAmount } from '../../../lib/format/format-sole-amount'
import { colors, fontSizes } from '../../../theme'

type RewardBalanceCardProps = {
  rewardBalanceWei: bigint | undefined
  isLoading: boolean
  isError: boolean
  onRetryPress: () => void
}

/** The player's SOLE, read from `SoleToken`. */
export function RewardBalanceCard({
  rewardBalanceWei,
  isLoading,
  isError,
  onRetryPress,
}: RewardBalanceCardProps) {
  return (
    <Card>
      <RewardBalanceContent
        rewardBalanceWei={rewardBalanceWei}
        isLoading={isLoading}
        isError={isError}
        onRetryPress={onRetryPress}
      />
      <Text style={styles.caption}>
        Earn SOLE by walking and running with your Sneaker, then spend it on repairs and upgrades.
      </Text>
    </Card>
  )
}

function RewardBalanceContent({
  rewardBalanceWei,
  isLoading,
  isError,
  onRetryPress,
}: RewardBalanceCardProps) {
  if (isLoading) {
    return <ActivityIndicator color={colors.primary} accessibilityLabel="Loading your SOLE" />
  }
  if (isError || rewardBalanceWei === undefined) {
    return (
      <ErrorState
        message="Couldn’t read your SOLE balance from Monad."
        onRetryPress={onRetryPress}
      />
    )
  }
  return <StatValue label="SOLE balance" size="large" value={formatSoleAmount(rewardBalanceWei)} />
}

const styles = StyleSheet.create({
  caption: {
    fontSize: fontSizes.caption,
    color: colors.textSecondary,
  },
})
