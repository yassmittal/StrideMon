import { sneakerNftAbi } from '@stridemon/chain'
import { useReadContract } from 'wagmi'
import { contractAddresses } from '../../../lib/chain/contract-addresses'
import { monadChain } from '../../../lib/chain/monad-chain'

/**
 * The Sneaker's picture as SVG markup, from `SneakerNft.imageSvg`: the same art its
 * `tokenURI` gives explorers and wallets (D-030). `invalidateChainReads` refreshes it
 * after a settlement, repair or upgrade.
 */
export function useSneakerImageSvg(sneakerTokenId: bigint | undefined) {
  return useReadContract({
    address: contractAddresses.sneakerNft,
    abi: sneakerNftAbi,
    functionName: 'imageSvg',
    args: sneakerTokenId === undefined ? undefined : [sneakerTokenId],
    chainId: monadChain.id,
    query: { enabled: sneakerTokenId !== undefined },
  })
}
