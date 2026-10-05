import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { Button } from '../../../components/ui/Button'
import { ExternalLink } from '../../../components/ui/ExternalLink'
import {
  buildSneakerExplorerUrl,
  buildTransactionExplorerUrl,
} from '../../../lib/chain/explorer-urls'
import { formatSoleAmount } from '../../../lib/format/format-sole-amount'
import { formatWalletAddress } from '../../../lib/format/format-wallet-address'
import { colors, layout, radii, spacing, textStyles } from '../../../theme'
import {
  describeSneakerGameTransactionError,
  type SneakerGameTransactionErrorCode,
} from '../sneaker-game-transaction-state'
import type { SneakerTransactionConfirmation } from './SneakerTransactionSheet'
import { StatChangeRow } from './StatChangeRow'
import { TransferConfirmationDetails } from './TransferConfirmationDetails'

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
  return (
    <>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {confirmation.kind === 'spend' ? (
        <SpendConfirmationDetails confirmation={confirmation} />
      ) : (
        <TransferConfirmationDetails
          sneakerTokenId={confirmation.sneakerTokenId}
          recipientWalletAddress={confirmation.recipientWalletAddress}
        />
      )}
      <Button label="Confirm in wallet" variant="callToAction" onPress={onConfirmPress} />
      <Button label="Not now" variant="secondary" onPress={onCancelPress} />
    </>
  )
}

function SpendConfirmationDetails({
  confirmation: { statChanges, costWei, rewardBalanceWei },
}: {
  confirmation: Extract<SneakerTransactionConfirmation, { kind: 'spend' }>
}) {
  return (
    <>
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
    <View style={styles.block} accessibilityLiveRegion="polite">
      <ActivityIndicator color={colors.textPrimary} size="large" style={styles.spinner} />
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <Text style={styles.caption}>{caption}</Text>
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
      <View style={styles.block} accessibilityLiveRegion="polite">
        <View style={styles.successBadge}>
          <Text style={styles.successMark}>✓</Text>
        </View>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        {confirmation.kind === 'spend' ? (
          <Text style={styles.caption}>Spent {formatSoleAmount(confirmation.costWei)}</Text>
        ) : (
          <Text style={styles.caption}>
            Now owned by {formatWalletAddress(confirmation.recipientWalletAddress)}
          </Text>
        )}
      </View>
      {confirmation.kind === 'spend' && (
        <View style={styles.rows}>
          {confirmation.statChanges.map((statChange) => (
            <StatChangeRow key={statChange.label} {...statChange} />
          ))}
        </View>
      )}
      <View>
        <ExternalLink
          label="View transaction"
          url={buildTransactionExplorerUrl(transactionHash)}
          accessibilityLabel="View the transaction on the explorer"
        />
        {confirmation.kind === 'transfer' && (
          <ExternalLink
            label="See the new owner on the explorer"
            url={buildSneakerExplorerUrl(confirmation.sneakerTokenId)}
            accessibilityLabel={`View Sneaker ${confirmation.sneakerTokenId} and its new owner on the explorer`}
          />
        )}
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
      <View style={styles.block} accessibilityLiveRegion="polite">
        <Text
          style={[styles.title, !isWalletCancel && styles.titleDanger]}
          accessibilityRole="header"
        >
          {isWalletCancel ? 'You cancelled in your wallet' : 'That didn’t go through'}
        </Text>
        <Text style={styles.caption}>{describeSneakerGameTransactionError(errorCode)}</Text>
      </View>
      <Button label="Try again" onPress={onRetryPress} />
      <Button label="Close" variant="secondary" onPress={onClosePress} />
    </>
  )
}

const styles = StyleSheet.create({
  title: {
    ...textStyles.title,
    color: colors.textPrimary,
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
    backgroundColor: colors.overlayOnLight,
  },
  caption: {
    ...textStyles.caption,
    color: colors.textSecondary,
  },
  block: {
    gap: spacing.small,
  },
  spinner: {
    alignSelf: 'flex-start',
  },
  successBadge: {
    width: layout.successBadgeSize,
    height: layout.successBadgeSize,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.successSurface,
  },
  successMark: {
    ...textStyles.heading,
    color: colors.textPrimary,
  },
})
