import { BottomSheet } from '../../../components/ui/BottomSheet'
import {
  isSneakerGameTransactionPending,
  type SneakerGameTransactionState,
} from '../sneaker-game-transaction-state'
import { ConfirmationStep, FailedStep, PendingStep, SucceededStep } from './SneakerTransactionSteps'
import type { StatChange } from './StatChangeRow'

/** What the player is about to do, snapshotted when they tapped the action. */
export type SneakerTransactionConfirmation =
  | {
      /** Repair or upgrade: STRIDE is spent and stats change. */
      kind: 'spend'
      confirmationTitle: string
      successTitle: string
      statChanges: readonly StatChange[]
      costWei: bigint
      rewardBalanceWei: bigint
    }
  | {
      /** The Sneaker leaves this wallet (D-027). */
      kind: 'transfer'
      confirmationTitle: string
      successTitle: string
      sneakerTokenId: bigint
      recipientWalletAddress: string
    }

type SneakerTransactionSheetProps = {
  /** What the player saw when they tapped the action. `null` hides the sheet. */
  confirmation: SneakerTransactionConfirmation | null
  transactionState: SneakerGameTransactionState
  onConfirmPress: () => void
  onClosePress: () => void
}

/**
 * A bottom sheet that walks one repair, upgrade or transfer through confirm → wallet → chain →
 * done. It can't be dismissed while the wallet or chain is busy, so the player
 * always sees how it ended.
 */
export function SneakerTransactionSheet({
  confirmation,
  transactionState,
  onConfirmPress,
  onClosePress,
}: SneakerTransactionSheetProps) {
  return (
    <BottomSheet
      isVisible={confirmation !== null}
      metaItems={describeTransactionPhase(transactionState)}
      isDismissible={!isSneakerGameTransactionPending(transactionState)}
      onClosePress={onClosePress}
    >
      {confirmation !== null && (
        <SheetStep
          confirmation={confirmation}
          transactionState={transactionState}
          onConfirmPress={onConfirmPress}
          onClosePress={onClosePress}
        />
      )}
    </BottomSheet>
  )
}

type SheetStepProps = Omit<SneakerTransactionSheetProps, 'confirmation'> & {
  confirmation: SneakerTransactionConfirmation
}

function SheetStep({
  confirmation,
  transactionState,
  onConfirmPress,
  onClosePress,
}: SheetStepProps) {
  switch (transactionState.phase) {
    case 'idle':
      return (
        <ConfirmationStep
          title={confirmation.confirmationTitle}
          confirmation={confirmation}
          onConfirmPress={onConfirmPress}
          onCancelPress={onClosePress}
        />
      )
    case 'awaitingSignature':
      return (
        <PendingStep
          title="Approve in your wallet"
          caption="Your wallet app should have opened. Approve the transaction there, then come back."
        />
      )
    case 'confirming':
      return (
        <PendingStep
          title="Confirming on Monad…"
          caption="Usually a couple of seconds."
          transactionHash={transactionState.transactionHash}
        />
      )
    case 'succeeded':
      return (
        <SucceededStep
          title={confirmation.successTitle}
          confirmation={confirmation}
          transactionHash={transactionState.transactionHash}
          onDonePress={onClosePress}
        />
      )
    case 'failed':
      return (
        <FailedStep
          errorCode={transactionState.errorCode}
          onRetryPress={onConfirmPress}
          onClosePress={onClosePress}
        />
      )
    default: {
      const unhandledState: never = transactionState
      throw new Error(`Unhandled transaction state: ${JSON.stringify(unhandledState)}`)
    }
  }
}

/** design-system.md §9: the transaction's state as tiny metadata, `STEP 1 OF 2 • AWAITING SIGNATURE`. */
function describeTransactionPhase(transactionState: SneakerGameTransactionState): string[] {
  switch (transactionState.phase) {
    case 'idle':
      return ['Review']
    case 'awaitingSignature':
      return ['Step 1 of 2', 'Awaiting signature']
    case 'confirming':
      return ['Step 2 of 2', 'Confirming']
    case 'succeeded':
      return ['Confirmed on Monad']
    case 'failed':
      return ['Not sent']
    default: {
      const unhandledState: never = transactionState
      throw new Error(`Unhandled transaction state: ${JSON.stringify(unhandledState)}`)
    }
  }
}
