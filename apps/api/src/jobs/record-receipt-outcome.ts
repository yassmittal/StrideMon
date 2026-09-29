import type { Db } from 'mongodb'
import type { TransactionReceipt } from 'viem'
import {
  mintStarterSneakerPayloadSchema,
  sendGasDripPayloadSchema,
} from '../lib/chain-transactions/chain-transaction-payloads'
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
  await applyConfirmedSideEffect(options.database, chainTransaction, now)
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

async function applyConfirmedSideEffect(
  database: Db,
  { kind, payload }: ChainTransactionDocument,
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
    default: {
      const unhandledKind: never = kind
      throw new Error(`Unhandled chain transaction kind: ${String(unhandledKind)}`)
    }
  }
}
