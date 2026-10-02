import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { Button } from '../../../components/ui/Button'
import { ExternalLink } from '../../../components/ui/ExternalLink'
import { buildTransactionExplorerUrl } from '../../../lib/chain/explorer-urls'
import { formatSoleAmount } from '../../../lib/format/format-sole-amount'
import { colors, fontSizes, fontWeights, radii, spacing } from '../../../theme'
import {
  describeSneakerGameTransactionError,
  type SneakerGameTransactionErrorCode,
} from '../sneaker-game-transaction-state'
import type { SneakerTransactionConfirmation } from './SneakerTransactionSheet'
import { StatChangeRow } from './StatChangeRow'

const SUCCESS_BADGE_SIZE = 64

export function ConfirmationStep({
  title,
  confirmation,
  onConfirmPress,
  onCancelPress,
}: {
  title: string
  confirmation: SneakerTransactionConfirmation
  onConfirmPress: () => void
  onCancelPress: () => void
}) {
  const { statChanges, costWei, rewardBalanceWei } = confirmation
  return (
    <>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <View style={styles.rows}>
        {statChanges.map((statChange) => (
          <StatChangeRow key={statChange.label} {...statChange} />
        ))}
        <View style={styles.divider} />
        <StatChangeRow
          label="SOLE balance"
          valueBefore={formatSoleAmount(rewardBalanceWei)}
          valueAfter={formatSoleAmount(rewardBalanceWei - costWei)}
        />
      </View>
      <Text style={styles.caption}>
        You spend {formatSoleAmount(costWei)}. Your wallet opens next to approve it, and Monad
        charges a small fee in MON.
      </Text>
      <Button label="Confirm in wallet" onPress={onConfirmPress} />
      <Button label="Not now" variant="secondary" onPress={onCancelPress} />
    </>
  )
}

export function PendingStep({
  title,
  caption,
  transactionHash,
}: {
  title: string
  caption: string
  transactionHash?: string
}) {
  return (
    <View style={styles.centered} accessibilityLiveRegion="polite">
      <ActivityIndicator color={colors.primary} size="large" />
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <Text style={[styles.caption, styles.centeredText]}>{caption}</Text>
      {transactionHash !== undefined && (
        <ExternalLink
          label="View transaction"
          url={buildTransactionExplorerUrl(transactionHash)}
          accessibilityLabel="View the transaction on the explorer"
        />
      )}
    </View>
  )
}

export function SucceededStep({
  title,
  confirmation,
  transactionHash,
  onDonePress,
}: {
  title: string
  confirmation: SneakerTransactionConfirmation
  transactionHash: string
  onDonePress: () => void
}) {
  return (
    <>
      <View style={styles.centered} accessibilityLiveRegion="polite">
        <View style={styles.successBadge}>
          <Text style={styles.successMark}>✓</Text>
        </View>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        <Text style={styles.caption}>Spent {formatSoleAmount(confirmation.costWei)}</Text>
      </View>
      <View style={styles.rows}>
        {confirmation.statChanges.map((statChange) => (
          <StatChangeRow key={statChange.label} {...statChange} />
        ))}
      </View>
      <View style={styles.centered}>
        <ExternalLink
          label="View transaction"
          url={buildTransactionExplorerUrl(transactionHash)}
          accessibilityLabel="View the transaction on the explorer"
        />
      </View>
      <Button label="Done" onPress={onDonePress} />
    </>
  )
}

/** A wallet cancel is the player's choice, so it reads as neutral, not as an error. */
export function FailedStep({
  errorCode,
  onRetryPress,
  onClosePress,
}: {
  errorCode: SneakerGameTransactionErrorCode
  onRetryPress: () => void
  onClosePress: () => void
}) {
  const isWalletCancel = errorCode === 'WALLET_REJECTED'
  return (
    <>
      <View style={styles.centered} accessibilityLiveRegion="polite">
        <Text
          style={[styles.title, !isWalletCancel && styles.titleDanger]}
          accessibilityRole="header"
        >
          {isWalletCancel ? 'You cancelled in your wallet' : 'That didn’t go through'}
        </Text>
        <Text style={[styles.caption, styles.centeredText]}>
          {describeSneakerGameTransactionError(errorCode)}
        </Text>
      </View>
      <Button label="Try again" onPress={onRetryPress} />
      <Button label="Close" variant="secondary" onPress={onClosePress} />
    </>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: fontSizes.title,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  titleDanger: {
    color: colors.danger,
  },
  rows: {
    padding: spacing.medium,
    borderRadius: radii.medium,
    backgroundColor: colors.surface,
    gap: spacing.small,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.disabled,
  },
  caption: {
    fontSize: fontSizes.caption,
    color: colors.textSecondary,
  },
  centered: {
    alignItems: 'center',
    gap: spacing.small,
  },
  centeredText: {
    textAlign: 'center',
  },
  successBadge: {
    width: SUCCESS_BADGE_SIZE,
    height: SUCCESS_BADGE_SIZE,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.successSurface,
  },
  successMark: {
    fontSize: fontSizes.display,
    fontWeight: fontWeights.bold,
    color: colors.success,
  },
})
