import type { ActivitySessionSettlement } from '@stridemon/shared/api-contracts'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { ExternalLink } from '../../../components/ui/ExternalLink'
import { buildTransactionExplorerUrl } from '../../../lib/chain/explorer-urls'
import { formatSoleAmount } from '../../../lib/format/format-sole-amount'
import { colors, fontSizes, fontWeights, radii, spacing } from '../../../theme'

type SettlementHeroCardProps =
  | { phase: 'settling' }
  | { phase: 'settled'; settlement: ActivitySessionSettlement; activeMinutes: number }

/** The top of the summary: "Settling on Monad…", then what the run earned. */
export function SettlementHeroCard(props: SettlementHeroCardProps) {
  if (props.phase === 'settling') {
    return (
      <View style={styles.hero} accessibilityLiveRegion="polite">
        <ActivityIndicator color={colors.textOnPrimary} size="large" />
        <Text style={styles.heroTitle} accessibilityRole="header">
          Settling on Monad…
        </Text>
        <Text style={styles.heroCaption}>
          Minting your SOLE and updating your Sneaker. This takes a few seconds.
        </Text>
      </View>
    )
  }

  const { settlement, activeMinutes } = props
  if (settlement.rewardedMinutes === 0) {
    return <NoRewardHero activeMinutes={activeMinutes} />
  }
  const rewardAmountDisplay = `+${formatSoleAmount(BigInt(settlement.rewardAmountWei))}`
  return (
    <View style={styles.hero} accessibilityLiveRegion="polite">
      <Text style={styles.heroLabel}>You earned</Text>
      <Text
        style={styles.rewardAmount}
        accessibilityRole="header"
        accessibilityLabel={`You earned ${rewardAmountDisplay}`}
      >
        {rewardAmountDisplay}
      </Text>
      <View style={styles.chipRow}>
        <HeroChip label={`${settlement.rewardedMinutes} rewarded min`} />
        <HeroChip label={`Durability −${settlement.durabilityLoss}`} />
      </View>
      {settlement.transactionHash !== null && (
        <View style={styles.linkOnPrimary}>
          <ExternalLink
            label="View transaction"
            url={buildTransactionExplorerUrl(settlement.transactionHash)}
            accessibilityLabel="View the settlement transaction on the explorer"
            tone="onPrimary"
          />
        </View>
      )}
    </View>
  )
}

/**
 * A run that earned nothing says so in words, instead of "+0 SOLE" next to stats
 * that contradict what the run screen just showed.
 */
function NoRewardHero({ activeMinutes }: { activeMinutes: number }) {
  return (
    <View style={[styles.hero, styles.heroNeutral]} accessibilityLiveRegion="polite">
      <Text style={styles.noRewardTitle} accessibilityRole="header">
        No SOLE this time
      </Text>
      <Text style={styles.noRewardCaption}>
        {activeMinutes === 0
          ? 'SOLE is earned per full minute of walking: 60 seconds of moving with good GPS. This run didn’t complete one. Walk for 3–4 minutes outdoors next time.'
          : 'Your Sneaker had no energy left, so these minutes couldn’t earn. Energy refills over time.'}
      </Text>
    </View>
  )
}

function HeroChip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: spacing.small,
    paddingVertical: spacing.extraLarge,
    paddingHorizontal: spacing.large,
    borderRadius: radii.medium,
    backgroundColor: colors.primary,
  },
  heroNeutral: {
    backgroundColor: colors.surface,
  },
  noRewardTitle: {
    fontSize: fontSizes.title,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  noRewardCaption: {
    fontSize: fontSizes.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  heroTitle: {
    fontSize: fontSizes.title,
    fontWeight: fontWeights.bold,
    color: colors.textOnPrimary,
  },
  heroLabel: {
    fontSize: fontSizes.body,
    color: colors.textOnPrimary,
    opacity: 0.8,
  },
  heroCaption: {
    fontSize: fontSizes.body,
    color: colors.textOnPrimary,
    opacity: 0.8,
    textAlign: 'center',
  },
  rewardAmount: {
    fontSize: fontSizes.hero,
    fontWeight: fontWeights.bold,
    color: colors.textOnPrimary,
    fontVariant: ['tabular-nums'],
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.small,
  },
  chip: {
    paddingVertical: spacing.extraSmall,
    paddingHorizontal: spacing.medium,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryPressed,
  },
  chipLabel: {
    fontSize: fontSizes.caption,
    fontWeight: fontWeights.semibold,
    color: colors.textOnPrimary,
  },
  linkOnPrimary: {
    alignItems: 'center',
  },
})
