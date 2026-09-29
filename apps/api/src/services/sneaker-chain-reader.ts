import { type StrideMonContractAddresses, sneakerGameAbi, sneakerNftAbi } from '@stridemon/chain'
import type { Address, PublicClient } from 'viem'

/** A Sneaker as the chain has it right now. Never stored in Mongo (data-model.md). */
export type SneakerState = {
  sneakerTokenId: bigint
  level: number
  efficiency: number
  durability: number
  /** Stored energy; `currentEnergy` has regeneration applied. */
  storedEnergy: number
  /** Unix seconds that regeneration counts from. */
  energyUpdatedAt: bigint
  currentEnergy: number
}

type ChainReaderContext = {
  publicClient: PublicClient
  contractAddresses: StrideMonContractAddresses
}

/**
 * Every Sneaker the wallet owns, in enumeration order. `SneakerNft` is
 * ERC721Enumerable, so this is `balanceOf` plus one `tokenOfOwnerByIndex` each.
 */
export async function listSneakerTokenIdsOwnedBy(
  { publicClient, contractAddresses }: ChainReaderContext,
  walletAddress: Address,
): Promise<bigint[]> {
  const ownedSneakerCount = await publicClient.readContract({
    address: contractAddresses.sneakerNft,
    abi: sneakerNftAbi,
    functionName: 'balanceOf',
    args: [walletAddress],
  })
  const ownerIndexes = Array.from({ length: Number(ownedSneakerCount) }, (_, index) =>
    BigInt(index),
  )
  return Promise.all(
    ownerIndexes.map((ownerIndex) =>
      publicClient.readContract({
        address: contractAddresses.sneakerNft,
        abi: sneakerNftAbi,
        functionName: 'tokenOfOwnerByIndex',
        args: [walletAddress, ownerIndex],
      }),
    ),
  )
}

/** The Sneaker's stored stats plus its energy with regeneration applied. */
export async function readSneakerState(
  { publicClient, contractAddresses }: ChainReaderContext,
  sneakerTokenId: bigint,
): Promise<SneakerState> {
  const [attributes, currentEnergy] = await Promise.all([
    publicClient.readContract({
      address: contractAddresses.sneakerNft,
      abi: sneakerNftAbi,
      functionName: 'getAttributes',
      args: [sneakerTokenId],
    }),
    publicClient.readContract({
      address: contractAddresses.sneakerGame,
      abi: sneakerGameAbi,
      functionName: 'currentEnergy',
      args: [sneakerTokenId],
    }),
  ])
  return {
    sneakerTokenId,
    level: attributes.level,
    efficiency: attributes.efficiency,
    durability: attributes.durability,
    storedEnergy: attributes.storedEnergy,
    energyUpdatedAt: attributes.energyUpdatedAt,
    currentEnergy,
  }
}
