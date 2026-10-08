// The site's own chain reads (D-045): a wallet's pass and a minted pass's picture, straight from
// `FoundingPass`, so they're the truth. Imported on demand, so viem stays out of the gallery.

import { createPublicClient, http } from 'viem'
import { foundingPassContract } from '@/content/contracts'
import { foundingPassReadAbi } from '@/content/founding-pass-abi'
import { monadRpcUrl } from '@/content/site'
import type { HeldFoundingPass } from './pass-mint-readiness'

const publicClient = createPublicClient({ transport: http(monadRpcUrl, { timeout: 15_000 }) })

/** The pass this wallet holds (one per wallet), or `null`. */
export async function readHeldFoundingPass(
  walletAddress: `0x${string}`,
): Promise<HeldFoundingPass | null> {
  const heldPassCount = await publicClient.readContract({
    address: foundingPassContract.address,
    abi: foundingPassReadAbi,
    functionName: 'balanceOf',
    args: [walletAddress],
  })
  if (heldPassCount === 0n) return null
  const tokenId = await publicClient.readContract({
    address: foundingPassContract.address,
    abi: foundingPassReadAbi,
    functionName: 'tokenOfOwnerByIndex',
    args: [walletAddress, 0n],
  })
  const passRecord = await publicClient.readContract({
    address: foundingPassContract.address,
    abi: foundingPassReadAbi,
    functionName: 'passOf',
    args: [tokenId],
  })
  return {
    walletAddress,
    // The token id is the design number: at most 1,000.
    designNumber: Number(tokenId),
    founderNumber: passRecord.founderNumber,
    hasGoldFrame: passRecord.hasGoldFrame,
    isLaced: passRecord.isLaced,
  }
}

/** The minted card exactly as wallets and MonadVision show it (`FOUNDER 042`, the frame). */
export function readMintedPassSvg(designNumber: number): Promise<string> {
  return publicClient.readContract({
    address: foundingPassContract.address,
    abi: foundingPassReadAbi,
    functionName: 'imageSvg',
    args: [BigInt(designNumber)],
  })
}
