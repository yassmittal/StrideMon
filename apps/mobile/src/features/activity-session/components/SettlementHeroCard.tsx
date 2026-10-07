import type { ActivitySessionSettlement } from '@stridemon/shared/api-contracts'
import { StyleSheet, Text, View } from 'react-native'
import { CounterText } from '../../../components/ui/CounterText'
import { ExternalLink } from '../../../components/ui/ExternalLink'
import { MetaLabel } from '../../../components/ui/MetaLabel'
import { Panel } from '../../../components/ui/Panel'
import { StatValue } from '../../../components/ui/StatValue'
import { buildTransactionExplorerUrl } from '../../../lib/chain/explorer-urls'
import { formatStrideAmountNumber } from '../../../lib/format/format-stride-amount'
import { colors, readOpticalPullLeft, spacing, textStyles } from '../../../theme'
import { STRIDE_VALUE_NOTICE } from '../../rewards/stride-value-notice'
import { SummaryHeadline } from './SummaryHeadline'

type SettlementHeroCardProps =
  /** While `SneakerGame` is paused, the settlement waits in the queue (D-032). */
  | { phase: 'settling'; isGamePaused: boolean }
  | { phase: 'settled'; settlement: ActivitySessionSettlement; activeMinutes: number }

/**
 * The top of the summary (design-system.md §9): "Settling on Monad…", then the STRIDE
 * the run earned in huge digits, with what it cost the Sneaker in a panel below.
 */
export function SettlementHeroCard(props: SettlementHeroCardProps) {
  if (props.phase === 'settling') {
    if (props.isGamePaused) {
      return (
        <SummaryHeadline
          metaItems={['Run finished', 'Maintenance']}
          title="Saved. Settling soon"
          message="StrideMon is paused for maintenance. Your run is saved and settles on Monad by itself when the game is back."
          isLoading
        />
      )
    }
    return (
      <SummaryHeadline
        metaItems={['Run finished', 'Settling']}
        title="Settling on Monad…"
        message="Minting your STRIDE and updating your Sneaker. This takes a few seconds."
        isLoading
      />
    )
  }

  const { settlement, activeMinutes } = props
  if (settlement.rewardedMinutes === 0) {
    return (
      <SummaryHeadline
        metaItems={['Run settled']}
        title="No STRIDE this time"
        message={
          activeMinutes === 0
            ? 'STRIDE is earned per full minute of walking: 60 seconds of moving with good GPS. This run didn’t complete one. Walk for 3–4 minutes outdoors next time.'
            : 'Your Sneaker had no energy left, so these minutes couldn’t earn. Energy refills over time.'
        }
      />
    )
  }
  const rewardAmountNumber = `+${formatStrideAmountNumber(BigInt(settlement.rewardAmountWei))}`
  return (
    <>
      <View
        style={styles.hero}
        accessible
        accessibilityRole="header"
        accessibilityLabel={`You earned ${rewardAmountNumber} STRIDE`}
        accessibilityLiveRegion="polite"
      >
        <MetaLabel items={['You earned', 'Run settled']} />
        <View style={styles.amountRow}>
          <View style={styles.amount}>
            <CounterText value={rewardAmountNumber} size="displayLarge" />
          </View>
          <Text style={styles.symbol}>STRIDE</Text>
        </View>
        <Text style={styles.valueNotice}>{STRIDE_VALUE_NOTICE}</Text>
      </View>
      <Panel>
        <View style={styles.statRow}>
          <View style={styles.statCell}>
            <StatValue label="Rewarded minutes" value={String(settlement.rewardedMinutes)} />
          </View>
          <View style={styles.statCell}>
            <StatValue label="Durability lost" value={`−${settlement.durabilityLoss}`} />
          </View>
        </View>
        {settlement.transactionHash !== null && (
          <ExternalLink
            label="View transaction"
            url={buildTransactionExplorerUrl(settlement.transactionHash)}
            accessibilityLabel="View the settlement transaction on the explorer"
          />
        )}
      </Panel>
    </>
  )
}

const styles = StyleSheet.create({
  hero: {
    gap: spacing.medium,
    paddingVertical: spacing.extraLarge,
  },
  amountRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    columnGap: spacing.small,
  },
  amount: {
    marginLeft: readOpticalPullLeft(textStyles.displayLarge.fontSize),
  },
  symbol: {
    ...textStyles.title,
    color: colors.textPrimary,
  },
  valueNotice: {
    ...textStyles.caption,
    color: colors.textSecondary,
  },
  statRow: {
    flexDirection: 'row',
    gap: spacing.medium,
  },
  statCell: {
    flex: 1,
  },
})
