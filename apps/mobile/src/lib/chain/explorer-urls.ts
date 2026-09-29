import { contractAddresses } from './contract-addresses'
import { monadChain } from './monad-chain'

const EXPLORER_BASE_URL = monadChain.blockExplorers.default.url

/** The transaction's page on the block explorer (MonadVision on testnet). */
export function buildTransactionExplorerUrl(transactionHash: string): string {
  return `${EXPLORER_BASE_URL}/tx/${transactionHash}`
}

/** The Sneaker's NFT page on the block explorer: owner, token id and on-chain metadata. */
export function buildSneakerExplorerUrl(sneakerTokenId: bigint): string {
  return `${EXPLORER_BASE_URL}/nft/${contractAddresses.sneakerNft}/${sneakerTokenId}`
}
