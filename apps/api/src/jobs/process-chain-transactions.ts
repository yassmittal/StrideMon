import type { StrideMonContractAddresses } from '@stridemon/chain'
import { getErrorMessage } from '@stridemon/shared/errors'
import type { FastifyBaseLogger } from 'fastify'
import type { Db } from 'mongodb'
import { type Hash, type Hex, isHex } from 'viem'
import type { ChainClients } from '../plugins/chain-clients'
import {
  type ChainTransactionDocument,
  findOldestQueuedChainTransaction,
  listSubmittedChainTransactions,
  markChainTransactionFailed,
  markChainTransactionSubmitted,
  recordChainTransactionBroadcast,
  recordChainTransactionError,
  requeueChainTransaction,
} from '../repositories/chain-transactions-repository'
import { buildChainTransactionCall } from '../services/chain-transaction-calls'
import {
  broadcastSignedTransaction,
  findChainTransactionReceipt,
  readConfirmedNonce,
  simulateAndSignChainTransaction,
  waitForChainTransactionReceipt,
} from '../services/chain-transaction-sender'
import { recordReceiptOutcome, recordSimulatedRevert } from './record-receipt-outcome'

export const PROCESS_CHAIN_TRANSACTIONS_JOB_NAME = 'processChainTransactions'

// Bounds one run, so the runner renews its lease and a shutdown never waits long.
const MAX_QUEUED_TRANSACTIONS_PER_RUN = 20
// OpenZeppelin Pausable's revert while `SneakerGame` is paused, as `findRevertReason` formats it.
const GAME_PAUSED_REVERT_REASON = 'EnforcedPause()'

export type ProcessChainTransactionsOptions = {
  database: Db
  chainClients: ChainClients
  contractAddresses: StrideMonContractAddresses
  /** Renews this process's job lease. `false` means another process holds it: stop at once. */
  renewJobLease: () => Promise<boolean>
  log: FastifyBaseLogger
}

/**
 * Drains the outbox, one transaction and one nonce at a time (backend-api.md → The
 * transaction outbox, D-019):
 * 1. Settle every `submitted` record by its receipt. Until they have all landed,
 *    nothing new is signed.
 * 2. Then take `queued` records oldest first: simulate → sign → save → broadcast →
 *    wait for the receipt.
 *
 * A transient failure stops the run and leaves the record for the next one.
 */
export async function processChainTransactions(
  options: ProcessChainTransactionsOptions,
): Promise<void> {
  for (const chainTransaction of await listSubmittedChainTransactions(options.database)) {
    if (!(await options.renewJobLease())) return
    const hasLanded = await runStep(options, chainTransaction, settleSubmittedChainTransaction)
    if (!hasLanded) return
  }

  for (let runIndex = 0; runIndex < MAX_QUEUED_TRANSACTIONS_PER_RUN; runIndex++) {
    if (!(await options.renewJobLease())) return
    const chainTransaction = await findOldestQueuedChainTransaction(options.database)
    if (chainTransaction === null) return
    const hasLanded = await runStep(options, chainTransaction, sendQueuedChainTransaction)
    if (!hasLanded) return
  }
}

type ChainTransactionStep = (
  options: ProcessChainTransactionsOptions,
  chainTransaction: ChainTransactionDocument,
) => Promise<boolean>

/** Runs one step, turning an unexpected error into `lastError` and "stop this run". */
async function runStep(
  options: ProcessChainTransactionsOptions,
  chainTransaction: ChainTransactionDocument,
  step: ChainTransactionStep,
): Promise<boolean> {
  try {
    return await step(options, chainTransaction)
  } catch (error) {
    options.log.warn(
      { err: error, chainTransactionId: chainTransaction._id.toHexString() },
      'Chain transaction step failed; retrying next run',
    )
    await recordChainTransactionError(options.database, {
      chainTransactionId: chainTransaction._id,
      lastError: getErrorMessage(error),
      now: new Date(),
    })
    return false
  }
}

/**
 * Recovery for a record that was signed and saved: re-check it by receipt, and
 * only re-broadcast the saved bytes if its nonce is still unused. Never re-signs
 * while the saved transaction could still land.
 */
async function settleSubmittedChainTransaction(
  options: ProcessChainTransactionsOptions,
  chainTransaction: ChainTransactionDocument,
): Promise<boolean> {
  const { transactionHash, senderNonce, signedTransaction } = readSubmittedFields(chainTransaction)
  const { publicClient, gameServerWalletClient } = options.chainClients

  // Nonce before receipt: if the nonce is used and our receipt is still missing
  // after that, another transaction took the nonce and ours can never be mined.
  const confirmedNonce = await readConfirmedNonce(
    publicClient,
    gameServerWalletClient.account.address,
  )
  const receipt = await findChainTransactionReceipt(publicClient, transactionHash)
  if (receipt !== null) {
    await recordReceiptOutcome(options, chainTransaction, receipt)
    return true
  }

  if (confirmedNonce > senderNonce) {
    options.log.warn(
      { chainTransactionId: chainTransaction._id.toHexString(), senderNonce },
      'Another transaction used this nonce; signing it again',
    )
    await requeueChainTransaction(options.database, {
      chainTransactionId: chainTransaction._id,
      lastError: `Nonce ${senderNonce} was used by another transaction`,
      now: new Date(),
    })
    return true
  }

  await broadcastAndRecord(options, chainTransaction, signedTransaction)
  return waitForReceiptAndRecord(options, chainTransaction, transactionHash)
}

async function sendQueuedChainTransaction(
  options: ProcessChainTransactionsOptions,
  chainTransaction: ChainTransactionDocument,
): Promise<boolean> {
  const call = buildChainTransactionCall(chainTransaction, options.contractAddresses)
  const signingResult = await simulateAndSignChainTransaction(options.chainClients, call)

  if (signingResult.outcome === 'reverted') {
    // A paused game is maintenance (D-032): stay queued, and go through after `unpause`.
    if (signingResult.revertReason === GAME_PAUSED_REVERT_REASON) {
      throw new Error('SneakerGame is paused; waiting for unpause')
    }
    options.log.warn(
      {
        chainTransactionId: chainTransaction._id.toHexString(),
        revertReason: signingResult.revertReason,
      },
      'Chain transaction would revert; not sending it',
    )
    await markChainTransactionFailed(options.database, {
      chainTransactionId: chainTransaction._id,
      lastError: `Simulation reverted: ${signingResult.revertReason}`,
      now: new Date(),
    })
    await recordSimulatedRevert(options.database, chainTransaction, signingResult.revertReason)
    return true
  }

  const { transactionHash, senderNonce, signedTransaction } = signingResult.signedChainTransaction
  // Saved before it leaves the process (D-019): a crash after this is recovered by receipt.
  const wasSaved = await markChainTransactionSubmitted(options.database, {
    chainTransactionId: chainTransaction._id,
    transactionHash,
    senderNonce,
    signedTransaction,
    now: new Date(),
  })
  if (!wasSaved) {
    throw new Error('The chain transaction left `queued` while it was being signed')
  }

  await broadcastAndRecord(options, chainTransaction, signedTransaction)
  return waitForReceiptAndRecord(options, chainTransaction, transactionHash)
}

async function broadcastAndRecord(
  options: ProcessChainTransactionsOptions,
  chainTransaction: ChainTransactionDocument,
  signedTransaction: Hex,
): Promise<void> {
  await broadcastSignedTransaction(options.chainClients.publicClient, signedTransaction)
  await recordChainTransactionBroadcast(options.database, {
    chainTransactionId: chainTransaction._id,
    now: new Date(),
  })
}

/** `true` once the outcome is recorded; `false` if the receipt hasn't arrived yet. */
async function waitForReceiptAndRecord(
  options: ProcessChainTransactionsOptions,
  chainTransaction: ChainTransactionDocument,
  transactionHash: Hash,
): Promise<boolean> {
  const receipt = await waitForChainTransactionReceipt(
    options.chainClients.publicClient,
    transactionHash,
  )
  if (receipt === null) return false
  await recordReceiptOutcome(options, chainTransaction, receipt)
  return true
}

function readSubmittedFields(chainTransaction: ChainTransactionDocument): {
  transactionHash: Hash
  senderNonce: number
  signedTransaction: Hex
} {
  const { transactionHash, senderNonce, signedTransaction } = chainTransaction
  if (transactionHash === null || senderNonce === null || signedTransaction === null) {
    throw new Error('A submitted chain transaction is missing its hash, nonce or signed bytes')
  }
  return {
    transactionHash: toHex(transactionHash),
    senderNonce,
    signedTransaction: toHex(signedTransaction),
  }
}

function toHex(value: string): Hex {
  if (!isHex(value)) throw new Error(`Expected 0x-prefixed hex, got ${value.slice(0, 10)}…`)
  return value
}
