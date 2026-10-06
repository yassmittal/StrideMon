import { useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { Button } from '../../../components/ui/Button'
import { ErrorState } from '../../../components/ui/ErrorState'
import { Panel } from '../../../components/ui/Panel'
import { formatStrideAmount } from '../../../lib/format/format-stride-amount'
import { colors, fontFamilies, radii, spacing, textStyles } from '../../../theme'
import type { SneakerActionCost } from '../sneaker-action-cost'
import type { SneakerGameTransactionState } from '../sneaker-game-transaction-state'
import {
  type SneakerTransactionConfirmation,
  SneakerTransactionSheet,
} from './SneakerTransactionSheet'
import { type StatChange, StatChangeRow } from './StatChangeRow'

type SneakerActionPanelProps = {
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
    setConfirmation({
      kind: 'spend',
      confirmationTitle,
      successTitle,
      statChanges,
      costWei,
      rewardBalanceWei,
    })
  }

  function handleSheetClosePress() {
    setConfirmation(null)
    onTransactionReset()
  }

  return (
    <Panel>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        {costWei !== undefined && (
          <View
            style={styles.costChip}
            accessible
            accessibilityLabel={`Costs ${formatStrideAmount(costWei)}`}
          >
            <Text style={styles.costChipLabel}>{formatStrideAmount(costWei)}</Text>
          </View>
        )}
      </View>
      <Text style={styles.description}>{description}</Text>

      {cost.status === 'error' ? (
        <ErrorState message="Couldn’t read the cost from Monad." onRetryPress={cost.onRetryPress} />
      ) : cost.status === 'loading' ? (
        <ActivityIndicator color={colors.textPrimary} accessibilityLabel="Reading the cost" />
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
            {blockedReasonMessage ?? `You have ${formatStrideAmount(rewardBalanceWei)}.`}
          </Text>
        </>
      )}

      <SneakerTransactionSheet
        confirmation={confirmation}
        transactionState={transactionState}
        onConfirmPress={onConfirmPress}
        onClosePress={handleSheetClosePress}
      />
    </Panel>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...textStyles.title,
    color: colors.textPrimary,
  },
  costChip: {
    paddingVertical: spacing.extraSmall,
    paddingHorizontal: spacing.medium,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
  },
  costChipLabel: {
    ...textStyles.caption,
    color: colors.textPrimary,
    fontFamily: fontFamilies.monoRegular,
    textTransform: 'uppercase',
  },
  description: {
    ...textStyles.body,
    color: colors.textSecondary,
  },
  statChanges: {
    padding: spacing.medium,
    borderRadius: radii.medium,
    backgroundColor: colors.background,
    gap: spacing.small,
  },
  caption: {
    ...textStyles.caption,
    color: colors.textSecondary,
  },
})
