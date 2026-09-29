import {
  BaseError,
  ContractFunctionRevertedError,
  encodeFunctionData,
  type Hash,
  type Hex,
  keccak256,
  NonceTooLowError,
  type PublicClient,
  type TransactionReceipt,
  TransactionReceiptNotFoundError,
  WaitForTransactionReceiptTimeoutError,
} from 'viem'
import type { ChainClients } from '../plugins/chain-clients'
import type { ChainTransactionCall } from './chain-transaction-calls'

// Monad produces a block about every 0.4 s, so poll well below viem's 4 s default.
const RECEIPT_POLLING_INTERVAL_MILLISECONDS = 500
// Short enough that the job moves on and renews its lease; a missed receipt is re-checked next run.
const RECEIPT_WAIT_TIMEOUT_MILLISECONDS = 20_000

export type SignedChainTransaction = {
  transactionHash: Hash
  senderNonce: number
  signedTransaction: Hex
}

export type ChainTransactionSigningResult =
  | { outcome: 'signed'; signedChainTransaction: SignedChainTransaction }
  | { outcome: 'reverted'; revertReason: string }

/**
 * Simulates the call (contract calls only), then signs it at the game server's
 * next nonce, without broadcasting. A predictable revert comes back as
 * `reverted` and costs no gas. Any other failure (RPC down, no MON for gas) throws.
 */
export async function simulateAndSignChainTransaction(
  { publicClient, gameServerWalletClient }: ChainClients,
  call: ChainTransactionCall,
): Promise<ChainTransactionSigningResult> {
  const { account } = gameServerWalletClient

  if (call.contractCall !== null) {
    try {
      await publicClient.simulateContract({
        account,
        address: call.to,
        abi: call.contractCall.abi,
        functionName: call.contractCall.functionName,
        args: call.contractCall.args,
        value: call.valueWei,
      })
    } catch (error) {
      const revertReason = findRevertReason(error)
      if (revertReason === null) throw error
      return { outcome: 'reverted', revertReason }
    }
  }

  const senderNonce = await publicClient.getTransactionCount({
    address: account.address,
    blockTag: 'pending',
  })
  const transactionRequest = await gameServerWalletClient.prepareTransactionRequest({
    to: call.to,
    value: call.valueWei,
    nonce: senderNonce,
    ...(call.contractCall === null
      ? {}
      : {
          data: encodeFunctionData({
            abi: call.contractCall.abi,
            functionName: call.contractCall.functionName,
            args: call.contractCall.args,
          }),
        }),
  })
  const signedTransaction = await gameServerWalletClient.signTransaction(transactionRequest)
  return {
    outcome: 'signed',
    signedChainTransaction: {
      transactionHash: keccak256(signedTransaction),
      senderNonce,
      signedTransaction,
    },
  }
}

/**
 * Sends signed bytes to the network. Safe to repeat: a node that already has the
 * transaction, or has already mined it, answers "nonce too low" / "already
 * known", which is ignored here and settled by the receipt check.
 */
export async function broadcastSignedTransaction(
  publicClient: PublicClient,
  signedTransaction: Hex,
): Promise<void> {
  try {
    await publicClient.sendRawTransaction({ serializedTransaction: signedTransaction })
  } catch (error) {
    if (!isNonceAlreadyUsedError(error)) throw error
  }
}

/** The receipt if the transaction is mined, otherwise `null`. */
export async function findChainTransactionReceipt(
  publicClient: PublicClient,
  transactionHash: Hash,
): Promise<TransactionReceipt | null> {
  try {
    return await publicClient.getTransactionReceipt({ hash: transactionHash })
  } catch (error) {
    if (error instanceof TransactionReceiptNotFoundError) return null
    throw error
  }
}

/** Waits a bounded time for the receipt. `null` means "not yet", not "failed". */
export async function waitForChainTransactionReceipt(
  publicClient: PublicClient,
  transactionHash: Hash,
): Promise<TransactionReceipt | null> {
  try {
    return await publicClient.waitForTransactionReceipt({
      hash: transactionHash,
      pollingInterval: RECEIPT_POLLING_INTERVAL_MILLISECONDS,
      timeout: RECEIPT_WAIT_TIMEOUT_MILLISECONDS,
    })
  } catch (error) {
    if (error instanceof WaitForTransactionReceiptTimeoutError) return null
    throw error
  }
}

/** How many of the sender's transactions are mined. Nonces below it are used up for good. */
export function readConfirmedNonce(publicClient: PublicClient, address: Hex): Promise<number> {
  return publicClient.getTransactionCount({ address, blockTag: 'latest' })
}

/** `StarterSneakerAlreadyClaimed(0x…)` for a custom error, the reason string otherwise. */
function findRevertReason(error: unknown): string | null {
  if (!(error instanceof BaseError)) return null
  const revertError = error.walk((cause) => cause instanceof ContractFunctionRevertedError)
  if (!(revertError instanceof ContractFunctionRevertedError)) return null
  if (revertError.data !== undefined) {
    const errorArguments = (revertError.data.args ?? []).map(String).join(', ')
    return `${revertError.data.errorName}(${errorArguments})`
  }
  return revertError.reason ?? revertError.shortMessage
}

function isNonceAlreadyUsedError(error: unknown): boolean {
  return (
    error instanceof BaseError &&
    error.walk((cause) => cause instanceof NonceTooLowError) instanceof NonceTooLowError
  )
}
