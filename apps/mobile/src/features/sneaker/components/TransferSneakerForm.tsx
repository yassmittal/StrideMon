import { useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native'
import type { Address } from 'viem'
import { Button } from '../../../components/ui/Button'
import { Panel } from '../../../components/ui/Panel'
import { StatValue } from '../../../components/ui/StatValue'
import {
  colors,
  fontFamilies,
  MINIMUM_TOUCH_TARGET_SIZE,
  radii,
  spacing,
  textStyles,
} from '../../../theme'
import type { SneakerGameTransactionState } from '../sneaker-game-transaction-state'
import { describeTransferRecipientProblem, toTransferRecipient } from '../transfer-recipient'
import {
  type SneakerTransactionConfirmation,
  SneakerTransactionSheet,
} from './SneakerTransactionSheet'
import { TRANSFER_BLOCKED_DURING_RUN_MESSAGE } from './TransferPanel'

type TransferSneakerFormProps = {
  walletAddress: Address
  sneakerTokenId: bigint
  /** `undefined` while the stats load from Monad. */
  sneakerStats:
    | { level: number; efficiency: number; durability: number; maxDurability: number }
    | undefined
  isRunInProgress: boolean
  transactionState: SneakerGameTransactionState
  onConfirmPress: (recipientWalletAddress: Address) => void
  onTransactionReset: () => void
  onCancelPress: () => void
  /** Called when the player closes the sheet after the Sneaker has left the wallet. */
  onTransferred: () => void
}

/** Pick the recipient, check it, then confirm in the shared transaction sheet. */
export function TransferSneakerForm({
  walletAddress,
  sneakerTokenId,
  sneakerStats,
  isRunInProgress,
  transactionState,
  onConfirmPress,
  onTransactionReset,
  onCancelPress,
  onTransferred,
}: TransferSneakerFormProps) {
  const [recipientInput, setRecipientInput] = useState('')
  const [confirmation, setConfirmation] = useState<SneakerTransactionConfirmation | null>(null)
  const transferRecipient = toTransferRecipient({ recipientInput, walletAddress })
  const recipientProblemMessage = describeTransferRecipientProblem(transferRecipient)
  const recipientWalletAddress =
    transferRecipient.status === 'valid' ? transferRecipient.recipientWalletAddress : undefined

  function handleReviewPress() {
    if (recipientWalletAddress === undefined) return
    onTransactionReset()
    setConfirmation({
      kind: 'transfer',
      confirmationTitle: `Send Sneaker #${sneakerTokenId}?`,
      successTitle: `Sneaker #${sneakerTokenId} sent`,
      sneakerTokenId,
      recipientWalletAddress,
    })
  }

  function handleConfirmPress() {
    if (recipientWalletAddress !== undefined) onConfirmPress(recipientWalletAddress)
  }

  function handleSheetClosePress() {
    if (transactionState.phase === 'succeeded') {
      onTransferred()
      return
    }
    setConfirmation(null)
    onTransactionReset()
  }

  return (
    <>
      <Text style={styles.title} accessibilityRole="header">
        Send Sneaker #{sneakerTokenId.toString()}
      </Text>

      <Panel>
        {sneakerStats === undefined ? (
          <ActivityIndicator color={colors.primary} accessibilityLabel="Loading your Sneaker" />
        ) : (
          <View style={styles.stats}>
            <StatValue label="Level" value={String(sneakerStats.level)} />
            <StatValue label="Efficiency" value={String(sneakerStats.efficiency)} />
            <StatValue
              label="Durability"
              value={`${sneakerStats.durability}/${sneakerStats.maxDurability}`}
            />
          </View>
        )}
        <Text style={styles.caption}>These stats live on the Sneaker and go with it.</Text>
      </Panel>

      <Panel>
        <Text style={styles.fieldLabel} nativeID="recipient-label">
          Recipient wallet address
        </Text>
        <TextInput
          value={recipientInput}
          onChangeText={setRecipientInput}
          placeholder="0x…"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          keyboardType="ascii-capable"
          accessibilityLabel="Recipient wallet address"
          accessibilityLabelledBy="recipient-label"
          style={[styles.input, recipientProblemMessage !== null && styles.inputInvalid]}
        />
        {recipientProblemMessage !== null && (
          <Text style={styles.problem} accessibilityLiveRegion="polite">
            {recipientProblemMessage}
          </Text>
        )}
        {recipientWalletAddress !== undefined && (
          <View style={styles.recipient} accessibilityLiveRegion="polite">
            <Text style={styles.recipientLabel}>✓ Sending to</Text>
            <Text style={styles.recipientAddress} selectable>
              {recipientWalletAddress}
            </Text>
          </View>
        )}
      </Panel>

      <Button
        label="Review transfer"
        onPress={handleReviewPress}
        isDisabled={recipientWalletAddress === undefined || isRunInProgress}
      />
      {isRunInProgress && <Text style={styles.blocked}>{TRANSFER_BLOCKED_DURING_RUN_MESSAGE}</Text>}
      <Button label="Cancel" variant="secondary" onPress={onCancelPress} />

      <SneakerTransactionSheet
        confirmation={confirmation}
        transactionState={transactionState}
        onConfirmPress={handleConfirmPress}
        onClosePress={handleSheetClosePress}
      />
    </>
  )
}

const styles = StyleSheet.create({
  title: {
    ...textStyles.title,
    color: colors.textPrimary,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.extraLarge,
  },
  caption: {
    ...textStyles.caption,
    color: colors.textSecondary,
  },
  fieldLabel: {
    ...textStyles.body,
    fontFamily: fontFamilies.medium,
    color: colors.textPrimary,
  },
  input: {
    minHeight: MINIMUM_TOUCH_TARGET_SIZE,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    borderRadius: radii.medium,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.disabled,
    backgroundColor: colors.background,
    ...textStyles.body,
    color: colors.textPrimary,
    fontFamily: fontFamilies.monoRegular,
  },
  inputInvalid: {
    borderColor: colors.danger,
  },
  problem: {
    ...textStyles.caption,
    color: colors.danger,
  },
  recipient: {
    padding: spacing.medium,
    borderRadius: radii.medium,
    backgroundColor: colors.successSurface,
    gap: spacing.extraSmall,
  },
  recipientLabel: {
    ...textStyles.caption,
    fontFamily: fontFamilies.medium,
    color: colors.textPrimary,
  },
  recipientAddress: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontFamily: fontFamilies.monoMedium,
  },
  blocked: {
    ...textStyles.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
})
