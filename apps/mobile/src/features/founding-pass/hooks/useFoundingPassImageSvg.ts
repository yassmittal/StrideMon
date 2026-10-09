import { foundingPassAbi } from '@stridemon/chain'
import { useReadContract } from 'wagmi'
import { contractAddresses } from '../../../lib/chain/contract-addresses'
import { monadChain } from '../../../lib/chain/monad-chain'

/**
 * The pass's card as SVG markup, from `FoundingPass.imageSvg`: what wallets and MonadVision show,
 * with `FOUNDER 042`, the gold frame if it rolled, and the laces once laced.
 */
export function useFoundingPassImageSvg(passTokenId: bigint | undefined) {
  return useReadContract({
    address: contractAddresses.foundingPass,
    abi: foundingPassAbi,
    functionName: 'imageSvg',
    args: passTokenId === undefined ? undefined : [passTokenId],
    chainId: monadChain.id,
    query: { enabled: passTokenId !== undefined },
  })
}
