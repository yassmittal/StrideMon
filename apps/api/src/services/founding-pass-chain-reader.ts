import { foundingPassAbi, type StrideMonContractAddresses, sneakerNftAbi } from '@stridemon/chain'
import type { Address, PublicClient } from 'viem'
import { toMintedDesignNumbers } from '../lib/founding-pass/minted-designs'

type ChainReaderContext = {
  publicClient: PublicClient
  contractAddresses: StrideMonContractAddresses
}

/** Which passes are minted, as the chain has it right now. */
export type FoundingPassCollectionState = {
  mintedCount: number
  /** Ascending. */
  mintedDesignNumbers: number[]
}

/** What the mint added to a pass (`FoundingPass.passOf`). */
export type FoundingPassRecord = {
  founderNumber: number
  hasGoldFrame: boolean
  isLaced: boolean
}

/** `mintedCount()` and `mintedBitmap()`, read together. */
export async function readFoundingPassCollectionState({
  publicClient,
  contractAddresses,
}: ChainReaderContext): Promise<FoundingPassCollectionState> {
  const [mintedCount, mintedBitmapWords] = await Promise.all([
    publicClient.readContract({
      address: contractAddresses.foundingPass,
      abi: foundingPassAbi,
      functionName: 'mintedCount',
    }),
    publicClient.readContract({
      address: contractAddresses.foundingPass,
      abi: foundingPassAbi,
      functionName: 'mintedBitmap',
    }),
  ])
  // At most 1,000, so the count always fits a number.
  return {
    mintedCount: Number(mintedCount),
    mintedDesignNumbers: toMintedDesignNumbers(mintedBitmapWords),
  }
}

/** The pass this wallet holds (one per wallet), or `null`. */
export async function findFoundingPassTokenIdHeldBy(
  { publicClient, contractAddresses }: ChainReaderContext,
  walletAddress: Address,
): Promise<bigint | null> {
  const heldPassCount = await publicClient.readContract({
    address: contractAddresses.foundingPass,
    abi: foundingPassAbi,
    functionName: 'balanceOf',
    args: [walletAddress],
  })
  if (heldPassCount === 0n) return null
  return publicClient.readContract({
    address: contractAddresses.foundingPass,
    abi: foundingPassAbi,
    functionName: 'tokenOfOwnerByIndex',
    args: [walletAddress, 0n],
  })
}

export async function readFoundingPassRecord(
  { publicClient, contractAddresses }: ChainReaderContext,
  foundingPassTokenId: bigint,
): Promise<FoundingPassRecord> {
  const passRecord = await publicClient.readContract({
    address: contractAddresses.foundingPass,
    abi: foundingPassAbi,
    functionName: 'passOf',
    args: [foundingPassTokenId],
  })
  return {
    founderNumber: passRecord.founderNumber,
    hasGoldFrame: passRecord.hasGoldFrame,
    isLaced: passRecord.isLaced,
  }
}

/** The pass's Founder Sneaker, or `null` before it's minted. */
export async function findFounderSneakerTokenId(
  { publicClient, contractAddresses }: ChainReaderContext,
  foundingPassTokenId: bigint,
): Promise<bigint | null> {
  const sneakerTokenId = await publicClient.readContract({
    address: contractAddresses.sneakerNft,
    abi: sneakerNftAbi,
    functionName: 'founderSneakerTokenIdOf',
    args: [foundingPassTokenId],
  })
  return sneakerTokenId === 0n ? null : sneakerTokenId
}
