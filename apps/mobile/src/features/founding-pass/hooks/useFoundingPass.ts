import { foundingPassAbi, sneakerNftAbi } from '@stridemon/chain'
import { getAddress } from 'viem'
import { useReadContract } from 'wagmi'
import { contractAddresses } from '../../../lib/chain/contract-addresses'
import { monadChain } from '../../../lib/chain/monad-chain'

// A Founder Sneaker mint lands in a few seconds; look again soon while it's on its way.
const FOUNDER_SNEAKER_POLL_INTERVAL_MILLISECONDS = 3_000

/** The wallet's pass as the chain has it. The token id is the design number (D-041). */
export type HeldFoundingPass = {
  designNumber: number
  passTokenId: bigint
  /** The mint order: "Founder 42". */
  founderNumber: number
  hasGoldFrame: boolean
  isLaced: boolean
  /** `null` until the pass's Founder Sneaker is minted. */
  founderSneakerTokenId: bigint | null
}

export type FoundingPassState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'none' }
  | { status: 'held'; foundingPass: HeldFoundingPass }

type UseFoundingPassOptions = {
  /** Look for a pass every few seconds, for the gate while someone mints on the website. */
  passPollIntervalMilliseconds?: number | false
  /** Re-read the pass every few seconds while it's unlaced, for the run summary's laced moment. */
  lacingPollIntervalMilliseconds?: number | false
}

/**
 * The wallet's Founding Pass, read from `FoundingPass` and `SneakerNft` (the chain is the source
 * of truth, D-046). One pass per wallet, so it reads the first one. Polls for the Founder Sneaker
 * while the pass has none, since Home is then waiting for its mint.
 */
export function useFoundingPass(
  walletAddress: string | undefined,
  {
    passPollIntervalMilliseconds = false,
    lacingPollIntervalMilliseconds = false,
  }: UseFoundingPassOptions = {},
): { foundingPassState: FoundingPassState; refetch: () => Promise<void> } {
  const ownerAddress = walletAddress === undefined ? undefined : getAddress(walletAddress)

  const passCountQuery = useReadContract({
    address: contractAddresses.foundingPass,
    abi: foundingPassAbi,
    functionName: 'balanceOf',
    args: ownerAddress === undefined ? undefined : [ownerAddress],
    chainId: monadChain.id,
    query: {
      enabled: ownerAddress !== undefined,
      refetchInterval: (query) => (query.state.data === 0n ? passPollIntervalMilliseconds : false),
    },
  })
  const holdsPass = passCountQuery.data !== undefined && passCountQuery.data > 0n

  const passTokenIdQuery = useReadContract({
    address: contractAddresses.foundingPass,
    abi: foundingPassAbi,
    functionName: 'tokenOfOwnerByIndex',
    args: ownerAddress === undefined ? undefined : [ownerAddress, 0n],
    chainId: monadChain.id,
    query: { enabled: holdsPass },
  })
  const passTokenId = holdsPass ? passTokenIdQuery.data : undefined

  const passRecordQuery = useReadContract({
    address: contractAddresses.foundingPass,
    abi: foundingPassAbi,
    functionName: 'passOf',
    args: passTokenId === undefined ? undefined : [passTokenId],
    chainId: monadChain.id,
    query: {
      enabled: passTokenId !== undefined,
      refetchInterval: (query) =>
        query.state.data?.isLaced === false ? lacingPollIntervalMilliseconds : false,
    },
  })

  const founderSneakerQuery = useReadContract({
    address: contractAddresses.sneakerNft,
    abi: sneakerNftAbi,
    functionName: 'founderSneakerTokenIdOf',
    args: passTokenId === undefined ? undefined : [passTokenId],
    chainId: monadChain.id,
    query: {
      enabled: passTokenId !== undefined,
      refetchInterval: (query) =>
        query.state.data === 0n ? FOUNDER_SNEAKER_POLL_INTERVAL_MILLISECONDS : false,
    },
  })

  async function refetch() {
    const { data: passCount } = await passCountQuery.refetch()
    if (passCount === undefined || passCount === 0n) return
    await Promise.all([
      passTokenIdQuery.refetch(),
      passRecordQuery.refetch(),
      founderSneakerQuery.refetch(),
    ])
  }

  if (
    passCountQuery.isError ||
    passTokenIdQuery.isError ||
    passRecordQuery.isError ||
    founderSneakerQuery.isError
  ) {
    return { foundingPassState: { status: 'error' }, refetch }
  }
  if (passCountQuery.data === 0n) return { foundingPassState: { status: 'none' }, refetch }

  const passRecord = passRecordQuery.data
  const founderSneakerTokenId = founderSneakerQuery.data
  if (
    passTokenId === undefined ||
    passRecord === undefined ||
    founderSneakerTokenId === undefined
  ) {
    return { foundingPassState: { status: 'loading' }, refetch }
  }
  return {
    foundingPassState: {
      status: 'held',
      foundingPass: {
        // At most 1,000, so it fits a number.
        designNumber: Number(passTokenId),
        passTokenId,
        founderNumber: passRecord.founderNumber,
        hasGoldFrame: passRecord.hasGoldFrame,
        isLaced: passRecord.isLaced,
        // Token ids start at 1, so 0 means none yet.
        founderSneakerTokenId: founderSneakerTokenId === 0n ? null : founderSneakerTokenId,
      },
    },
    refetch,
  }
}
