import { type Db, ObjectId } from 'mongodb'
import type { TransactionReceipt } from 'viem'
import {
  mintStarterSneakerPayloadSchema,
  sendGasDripPayloadSchema,
  settleSessionPayloadSchema,
} from '../lib/chain-transactions/chain-transaction-payloads'
import { readSessionSettledEvent } from '../lib/chain-transactions/read-session-settled-event'
import {
  markActivitySessionRejected,
  markActivitySessionSettled,
} from '../repositories/activity-sessions-repository'
import {
  type ChainTransactionDocument,
  markChainTransactionConfirmed,
  markChainTransactionFailed,
} from '../repositories/chain-transactions-repository'
import {
  markUserReceivedGasDrip,
  markUserReceivedStarterSneaker,
} from '../repositories/users-repository'
import type { ProcessChainTransactionsOptions } from './process-chain-transactions'

/**
 * Writes what the receipt says. A success also applies the record's side effect
 * (the user's onboarding flag) before it is marked `confirmed`.
 */
export async function recordReceiptOutcome(
  options: Pick<ProcessChainTransactionsOptions, 'database' | 'log'>,
  chainTransaction: ChainTransactionDocument,
  receipt: TransactionReceipt,
): Promise<void> {
  const chainTransactionId = chainTransaction._id
  const now = new Date()

  if (receipt.status === 'reverted') {
    options.log.error(
      {
        chainTransactionId: chainTransactionId.toHexString(),
        transactionHash: receipt.transactionHash,
      },
      'Chain transaction reverted on-chain',
    )
    await markChainTransactionFailed(options.database, {
      chainTransactionId,
      lastError: `Reverted on-chain in block ${receipt.blockNumber}`,
      now,
    })
    return
  }

  // Side effect first: if the process dies before `confirmed` is written, the
  // next run finds the receipt again and repeats this idempotent write.
  await applyConfirmedSideEffect(options.database, chainTransaction, receipt, now)
  await markChainTransactionConfirmed(options.database, { chainTransactionId, now })
  options.log.info(
    {
      chainTransactionId: chainTransactionId.toHexString(),
      kind: chainTransaction.kind,
      transactionHash: receipt.transactionHash,
    },
    'Chain transaction confirmed',
  )
}

/**
 * A settlement the simulation refused because the Sneaker changed hands mid-run
 * rejects the session (phase 5). Any other revert leaves it `settling` (D-026).
 */
export async function recordSimulatedRevert(
  database: Db,
  { kind, payload }: ChainTransactionDocument,
  revertReason: string,
): Promise<void> {
  if (kind !== 'settleSession' || !revertReason.startsWith('NotSneakerOwner(')) return
  const { activitySessionId } = settleSessionPayloadSchema.parse(payload)
  await markActivitySessionRejected(database, {
    activitySessionId: new ObjectId(activitySessionId),
    rejectionReason: 'SNEAKER_TRANSFERRED_DURING_SESSION',
    now: new Date(),
  })
}

async function applyConfirmedSideEffect(
  database: Db,
  { _id: chainTransactionId, kind, payload }: ChainTransactionDocument,
  receipt: TransactionReceipt,
  now: Date,
): Promise<void> {
  switch (kind) {
    case 'mintStarterSneaker': {
      const { walletAddress } = mintStarterSneakerPayloadSchema.parse(payload)
      await markUserReceivedStarterSneaker(database, { walletAddress, now })
      return
    }
    case 'sendGasDrip': {
      const { walletAddress } = sendGasDripPayloadSchema.parse(payload)
      await markUserReceivedGasDrip(database, { walletAddress, now })
      return
    }
    case 'settleSession': {
      const { activitySessionId, onChainSessionId } = settleSessionPayloadSchema.parse(payload)
      const sessionSettled = readSessionSettledEvent(receipt.logs, onChainSessionId)
      if (sessionSettled === null) {
        throw new Error(`No SessionSettled event in ${receipt.transactionHash}`)
      }
      await markActivitySessionSettled(database, {
        activitySessionId: new ObjectId(activitySessionId),
        settlement: {
          chainTransactionId,
          transactionHash: receipt.transactionHash,
          rewardAmountWei: sessionSettled.rewardAmountWei.toString(),
          durabilityLoss: sessionSettled.durabilityLoss,
          rewardedMinutes: sessionSettled.rewardedMinutes,
          settledAt: now,
        },
        now,
      })
      return
    }
    default: {
      const unhandledKind: never = kind
      throw new Error(`Unhandled chain transaction kind: ${String(unhandledKind)}`)
    }
  }
}
