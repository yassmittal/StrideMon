import { useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import type { Address } from 'viem'
import { Button } from '../../../components/ui/Button'
import { IconCircleButton } from '../../../components/ui/IconCircleButton'
import { MetaLabel } from '../../../components/ui/MetaLabel'
import { Panel } from '../../../components/ui/Panel'
import { ScreenTitle } from '../../../components/ui/ScreenTitle'
import { TextField } from '../../../components/ui/TextField'
import { colors, fontFamilies, radii, spacing, textStyles } from '../../../theme'
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

  const isReviewDisabled = recipientWalletAddress === undefined || isRunInProgress

  return (
    <>
      <View style={styles.header}>
        <IconCircleButton icon="back" accessibilityLabel="Back" onPress={onCancelPress} />
      </View>
      <ScreenTitle
        title={`Send Sneaker #${sneakerTokenId}`}
        metaItems={['Transfer', 'No STRIDE cost']}
      />

      <Panel>
        {sneakerStats === undefined ? (
          <ActivityIndicator color={colors.textPrimary} accessibilityLabel="Loading your Sneaker" />
        ) : (
          <MetaLabel
            items={[
              `Level ${sneakerStats.level}`,
              `Efficiency ${sneakerStats.efficiency}`,
              `Durability ${sneakerStats.durability}/${sneakerStats.maxDurability}`,
            ]}
          />
        )}
        <Text style={styles.caption}>These stats live on the Sneaker and go with it.</Text>
      </Panel>

      <Panel>
        <TextField
          label="Recipient wallet address"
          value={recipientInput}
          onChangeText={setRecipientInput}
          placeholder="0x…"
          errorMessage={recipientProblemMessage}
          valueFont="mono"
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          keyboardType="ascii-capable"
          onSubmitPress={handleReviewPress}
          isSubmitDisabled={isReviewDisabled}
          submitAccessibilityLabel="Review"
        />
        {recipientWalletAddress !== undefined && (
          <View style={styles.recipient} accessibilityLiveRegion="polite">
            <MetaLabel items={['Sending to']} />
            <Text style={styles.recipientAddress} selectable>
              {recipientWalletAddress}
            </Text>
          </View>
        )}
      </Panel>

      <Button label="Review transfer" onPress={handleReviewPress} isDisabled={isReviewDisabled} />
      {isRunInProgress && <Text style={styles.caption}>{TRANSFER_BLOCKED_DURING_RUN_MESSAGE}</Text>}

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
  header: {
    flexDirection: 'row',
    paddingBottom: spacing.small,
  },
  caption: {
    ...textStyles.caption,
    color: colors.textSecondary,
  },
  // Lime with black text: the address checked out (design-system.md §2.2).
  recipient: {
    padding: spacing.medium,
    borderRadius: radii.medium,
    backgroundColor: colors.successSurface,
    gap: spacing.extraSmall,
  },
  recipientAddress: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontFamily: fontFamilies.monoRegular,
  },
})
