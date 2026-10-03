import { sneakerGameAbi, sneakerNftAbi } from '@stridemon/chain'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useRef, useState } from 'react'
import type { Address } from 'viem'
import { useAccount, usePublicClient, useWriteContract } from 'wagmi'
import { contractAddresses } from '../../../lib/chain/contract-addresses'
import { hasViemErrorNamed } from '../../../lib/chain/error-chain'
import { invalidateChainReads } from '../../../lib/chain/invalidate-chain-reads'
import { isWalletRejection } from '../../../lib/chain/is-wallet-rejection'
import { monadChain } from '../../../lib/chain/monad-chain'
import type {
  SneakerGameCall,
  SneakerGameTransactionErrorCode,
  SneakerGameTransactionState,
} from '../sneaker-game-transaction-state'

type ChainReader = NonNullable<ReturnType<typeof usePublicClient>>

/**
 * The one hook for player transactions (mobile-app.md → Wallet and chain): check gas →
 * the wallet signs → wait for the receipt → re-read the chain. Repair, upgrade and
 * transfer are thin wrappers around it (D-027).
 */
export function useSneakerGameTransaction() {
  const { address: walletAddress } = useAccount()
  const chainReader = usePublicClient({ chainId: monadChain.id })
  const { writeContractAsync } = useWriteContract()
  const queryClient = useQueryClient()
  const [transactionState, setTransactionState] = useState<SneakerGameTransactionState>({
    phase: 'idle',
  })
  // A double tap must not open the wallet twice.
  const isSubmittingRef = useRef(false)

  const submit = useCallback(
    async (sneakerGameCall: SneakerGameCall) => {
      if (isSubmittingRef.current) return
      if (walletAddress === undefined || chainReader === undefined) {
        setTransactionState({ phase: 'failed', errorCode: 'WALLET_NOT_CONNECTED' })
        return
      }

      isSubmittingRef.current = true
      try {
        if (!(await canPayGas({ chainReader, walletAddress, sneakerGameCall }))) {
          setTransactionState({ phase: 'failed', errorCode: 'NOT_ENOUGH_GAS' })
          return
        }

        setTransactionState({ phase: 'awaitingSignature' })
        const walletCall = { account: walletAddress, chainId: monadChain.id } as const
        const transactionHash =
          sneakerGameCall.functionName === 'transfer'
            ? await writeContractAsync({
                ...toTransferContractCall({ transferCall: sneakerGameCall, walletAddress }),
                ...walletCall,
              })
            : await writeContractAsync({
                ...toSneakerGameContractCall(sneakerGameCall),
                ...walletCall,
              })

        setTransactionState({ phase: 'confirming', transactionHash })
        const receipt = await chainReader.waitForTransactionReceipt({ hash: transactionHash })
        await invalidateChainReads(queryClient)
        setTransactionState(
          receipt.status === 'success'
            ? { phase: 'succeeded', transactionHash }
            : { phase: 'failed', errorCode: 'CHAIN_REJECTED' },
        )
      } catch (error) {
        const errorCode = toTransactionErrorCode(error)
        if (errorCode === 'TRANSACTION_FAILED') {
          console.error('Sneaker transaction failed unexpectedly', sneakerGameCall, error)
        }
        // A refusal usually means the stats or balance on screen were stale.
        if (errorCode === 'CHAIN_REJECTED') void invalidateChainReads(queryClient)
        setTransactionState({ phase: 'failed', errorCode })
      } finally {
        isSubmittingRef.current = false
      }
    },
    [walletAddress, chainReader, writeContractAsync, queryClient],
  )

  /** Back to idle, for the next confirmation. Ignored while the wallet or chain is busy. */
  const reset = useCallback(() => {
    if (isSubmittingRef.current) return
    setTransactionState({ phase: 'idle' })
  }, [])

  return { transactionState, submit, reset }
}

type TransferCall = Extract<SneakerGameCall, { functionName: 'transfer' }>
type SneakerGameContractCall = Exclude<SneakerGameCall, TransferCall>

// Two builders, not one: viem can't type a call whose ABI is a union of two contracts.
function toSneakerGameContractCall({ functionName, sneakerTokenId }: SneakerGameContractCall) {
  return {
    address: contractAddresses.sneakerGame,
    abi: sneakerGameAbi,
    functionName,
    args: [sneakerTokenId],
  } as const
}

function toTransferContractCall({
  transferCall,
  walletAddress,
}: {
  transferCall: TransferCall
  walletAddress: Address
}) {
  return {
    address: contractAddresses.sneakerNft,
    abi: sneakerNftAbi,
    functionName: 'safeTransferFrom',
    args: [walletAddress, transferCall.recipientWalletAddress, transferCall.sneakerTokenId],
  } as const
}

/**
 * Whether the wallet's MON covers the fee before the wallet opens, so the player
 * reads a plain reason instead of a wallet error. Monad charges the full gas
 * limit, so the estimate is priced at the max fee. The estimate also simulates
 * the call, so a call the contract would refuse throws here, before signing.
 */
async function canPayGas({
  chainReader,
  walletAddress,
  sneakerGameCall,
}: {
  chainReader: ChainReader
  walletAddress: Address
  sneakerGameCall: SneakerGameCall
}): Promise<boolean> {
  const [gasUnits, feesPerGas, monBalanceWei] = await Promise.all([
    sneakerGameCall.functionName === 'transfer'
      ? chainReader.estimateContractGas({
          ...toTransferContractCall({ transferCall: sneakerGameCall, walletAddress }),
          account: walletAddress,
        })
      : chainReader.estimateContractGas({
          ...toSneakerGameContractCall(sneakerGameCall),
          account: walletAddress,
        }),
    chainReader.estimateFeesPerGas(),
    chainReader.getBalance({ address: walletAddress }),
  ])
  return monBalanceWei >= gasUnits * feesPerGas.maxFeePerGas
}

function toTransactionErrorCode(error: unknown): SneakerGameTransactionErrorCode {
  if (isWalletRejection(error)) return 'WALLET_REJECTED'
  if (hasViemErrorNamed(error, 'InsufficientFundsError')) return 'NOT_ENOUGH_GAS'
  if (hasViemErrorNamed(error, 'ContractFunctionRevertedError')) return 'CHAIN_REJECTED'
  return 'TRANSACTION_FAILED'
}
