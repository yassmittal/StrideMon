import { useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { ErrorState } from '../../../components/ui/ErrorState'
import { formatSoleAmount } from '../../../lib/format/format-sole-amount'
import { colors, fontSizes, fontWeights, radii, spacing } from '../../../theme'
import type { SneakerActionCost } from '../sneaker-action-cost'
import type { SneakerGameTransactionState } from '../sneaker-game-transaction-state'
import {
  type SneakerTransactionConfirmation,
  SneakerTransactionSheet,
} from './SneakerTransactionSheet'
import { type StatChange, StatChangeRow } from './StatChangeRow'

export type SneakerActionPanelProps = {
  title: string
  description: string
  actionLabel: string
  statChanges: readonly StatChange[]
  cost: SneakerActionCost
  rewardBalanceWei: bigint
  /** Why the action is disabled. `null` when the player can go ahead. */
  blockedReasonMessage: string | null
  confirmationTitle: string
  successTitle: string
  transactionState: SneakerGameTransactionState
  onConfirmPress: () => void
  /** Called when the sheet closes, so the transaction can go back to idle. */
  onTransactionReset: () => void
}

/**
 * One thing the player can buy for their Sneaker: what it costs, what it changes,
 * and why it's disabled. Tapping it opens the confirmation sheet.
 */
export function SneakerActionPanel({
  title,
  description,
  actionLabel,
  statChanges,
  cost,
  rewardBalanceWei,
  blockedReasonMessage,
  confirmationTitle,
  successTitle,
  transactionState,
  onConfirmPress,
  onTransactionReset,
}: SneakerActionPanelProps) {
  // A snapshot, so the sheet keeps showing what was bought after the chain is re-read
  // (after an upgrade, the level on screen is already the new one).
  const [confirmation, setConfirmation] = useState<SneakerTransactionConfirmation | null>(null)
  const costWei = cost.status === 'ready' ? cost.costWei : undefined

  function handleActionPress() {
    if (costWei === undefined) return
    onTransactionReset()
    setConfirmation({ confirmationTitle, successTitle, statChanges, costWei, rewardBalanceWei })
  }

  function handleSheetClosePress() {
    setConfirmation(null)
    onTransactionReset()
  }

  return (
    <Card>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        {costWei !== undefined && (
          <View style={styles.costChip}>
            <Text style={styles.costChipLabel}>{formatSoleAmount(costWei)}</Text>
          </View>
        )}
      </View>
      <Text style={styles.description}>{description}</Text>

      {cost.status === 'error' ? (
        <ErrorState message="Couldn’t read the cost from Monad." onRetryPress={cost.onRetryPress} />
      ) : cost.status === 'loading' ? (
        <ActivityIndicator color={colors.primary} accessibilityLabel="Reading the cost" />
      ) : (
        <>
          {statChanges.length > 0 && (
            <View style={styles.statChanges}>
              {statChanges.map((statChange) => (
                <StatChangeRow key={statChange.label} {...statChange} />
              ))}
            </View>
          )}
          <Button
            label={actionLabel}
            onPress={handleActionPress}
            isDisabled={blockedReasonMessage !== null || costWei === undefined}
          />
          <Text style={styles.caption}>
            {blockedReasonMessage ?? `You have ${formatSoleAmount(rewardBalanceWei)}.`}
          </Text>
        </>
      )}

      <SneakerTransactionSheet
        confirmation={confirmation}
        transactionState={transactionState}
        onConfirmPress={onConfirmPress}
        onClosePress={handleSheetClosePress}
      />
    </Card>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: fontSizes.title,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  costChip: {
    paddingVertical: spacing.extraSmall,
    paddingHorizontal: spacing.medium,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySurface,
  },
  costChipLabel: {
    fontSize: fontSizes.caption,
    fontWeight: fontWeights.semibold,
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  description: {
    fontSize: fontSizes.body,
    color: colors.textSecondary,
  },
  statChanges: {
    padding: spacing.medium,
    borderRadius: radii.medium,
    backgroundColor: colors.background,
    gap: spacing.small,
  },
  caption: {
    fontSize: fontSizes.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
})
