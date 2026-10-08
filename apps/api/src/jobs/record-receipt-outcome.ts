import { type Db, ObjectId } from 'mongodb'
import type { TransactionReceipt } from 'viem'
import {
  mintFounderSneakerPayloadSchema,
  mintFoundingPassPayloadSchema,
  mintStarterSneakerPayloadSchema,
  sendGasDripPayloadSchema,
  settleSessionPayloadSchema,
} from '../lib/chain-transactions/chain-transaction-payloads'
import { readSessionSettledEvent } from '../lib/chain-transactions/read-session-settled-event'
import { readFoundingPassMintedEvent } from '../lib/founding-pass/read-founding-pass-minted-event'
import { toPassMintFailureCode } from '../lib/founding-pass/to-pass-mint-failure-code'
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
  markFoundingPassMintConfirmed,
  markFoundingPassMintFailed,
} from '../repositories/founding-pass-mints-repository'
import {
  markUserReceivedGasDrip,
  markUserReceivedStarterSneaker,
} from '../repositories/users-repository'
import { enqueueFoundingPassLacingIfDue } from './enqueue-founding-pass-lacing'
import type { ProcessChainTransactionsOptions } from './process-chain-transactions'

type ReceiptOutcomeOptions = Pick<
  ProcessChainTransactionsOptions,
  'database' | 'chainClients' | 'contractAddresses' | 'log'
>

/**
 * Writes what the receipt says. A success also applies the record's side effect
 * (the user's onboarding flag) before it is marked `confirmed`.
 */
export async function recordReceiptOutcome(
  options: ReceiptOutcomeOptions,
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
    await applyFailedSideEffect(options.database, chainTransaction, null)
    return
  }

  // Side effect first: if the process dies before `confirmed` is written, the
  // next run finds the receipt again and repeats this idempotent write.
  await applyConfirmedSideEffect(options, chainTransaction, receipt, now)
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

/** What a revert the simulation predicted means for the record's own data. */
export async function recordSimulatedRevert(
  database: Db,
  chainTransaction: ChainTransactionDocument,
  revertReason: string,
): Promise<void> {
  await applyFailedSideEffect(database, chainTransaction, revertReason)
}

/**
 * A settlement refused because the Sneaker changed hands mid-run rejects the session (phase 5);
 * any other revert leaves it `settling` (D-026). A refused pass mint fails its mint, which frees
 * the design, email and wallet (D-043). `revertReason` is `null` for an on-chain revert.
 */
async function applyFailedSideEffect(
  database: Db,
  { kind, payload }: ChainTransactionDocument,
  revertReason: string | null,
): Promise<void> {
  if (kind === 'mintFoundingPass') {
    const { mintId } = mintFoundingPassPayloadSchema.parse(payload)
    await markFoundingPassMintFailed(database, {
      mintId: new ObjectId(mintId),
      failureCode: toPassMintFailureCode(revertReason),
      now: new Date(),
    })
    return
  }
  if (kind !== 'settleSession' || !revertReason?.startsWith('NotSneakerOwner(')) return
  const { activitySessionId } = settleSessionPayloadSchema.parse(payload)
  await markActivitySessionRejected(database, {
    activitySessionId: new ObjectId(activitySessionId),
    rejectionReason: 'SNEAKER_TRANSFERRED_DURING_SESSION',
    now: new Date(),
  })
}

async function applyConfirmedSideEffect(
  options: ReceiptOutcomeOptions,
  { _id: chainTransactionId, kind, payload }: ChainTransactionDocument,
  receipt: TransactionReceipt,
  now: Date,
): Promise<void> {
  const { database } = options
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
      // The holder's first settled walk laces their pass (D-041).
      await enqueueFoundingPassLacingIfDue({
        database,
        publicClient: options.chainClients.publicClient,
        contractAddresses: options.contractAddresses,
        walletAddress: settleSessionPayloadSchema.parse(payload).walletAddress,
        now,
      })
      return
    }
    case 'mintFoundingPass': {
      const { mintId, designNumber } = mintFoundingPassPayloadSchema.parse(payload)
      const foundingPassMinted = readFoundingPassMintedEvent(receipt.logs, designNumber)
      if (foundingPassMinted === null) {
        throw new Error(`No FoundingPassMinted event in ${receipt.transactionHash}`)
      }
      await markFoundingPassMintConfirmed(database, {
        mintId: new ObjectId(mintId),
        founderNumber: foundingPassMinted.founderNumber,
        hasGoldFrame: foundingPassMinted.hasGoldFrame,
        transactionHash: receipt.transactionHash,
        now,
      })
      return
    }
    case 'mintFounderSneaker': {
      // A founder's Founder Sneaker is their free Sneaker (D-042).
      const { walletAddress } = mintFounderSneakerPayloadSchema.parse(payload)
      await markUserReceivedStarterSneaker(database, { walletAddress, now })
      return
    }
    case 'laceFoundingPass':
      // The chain holds the laced state; nothing to copy.
      return
    default: {
      const unhandledKind: never = kind
      throw new Error(`Unhandled chain transaction kind: ${String(unhandledKind)}`)
    }
  }
}
