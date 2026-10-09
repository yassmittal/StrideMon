// Copied from packages/contracts/deployments/10143.json (D-035: the site doesn't import
// @stridemon/chain). A redeploy must update these too.
export const monadTestnetChainId = 10143

export const explorerName = 'MonadVision'

export type ContractAddress = `0x${string}`

export type DeployedContract = {
  name: string
  standard: string
  role: string
  address: ContractAddress
}

export const sneakerNftContract: DeployedContract = {
  name: 'SneakerNft',
  standard: 'ERC-721',
  role: 'The Sneaker you own',
  address: '0x6BE031Ff15F944c226832b6D0B99C03662b29337',
}

export const deployedContracts: readonly DeployedContract[] = [
  sneakerNftContract,
  {
    name: 'StrideToken',
    standard: 'ERC-20',
    role: 'STRIDE, the reward token',
    address: '0xaa665bB572A1375c624ae0affbCa28bF64D3B7c5',
  },
  {
    name: 'SneakerGame',
    standard: 'Rules',
    role: 'Energy, rewards, repair and upgrade',
    address: '0x4DD989bc2844cEa9a5eb53b3c52bd86FD6bB8f8D',
  },
  {
    name: 'SneakerArtRenderer',
    standard: 'SVG',
    role: 'Draws the Sneaker’s picture',
    address: '0xFd44910b780Df3e111EC79835D28CF4919329669',
  },
]

/**
 * The Founding Pass (D-041, D-042), from `deployments/10143.json`. Part 10 deploys a fresh one:
 * update it then.
 */
export const foundingPassContract: DeployedContract = {
  name: 'FoundingPass',
  standard: 'ERC-721',
  role: 'The Founding Pass: one of one, can’t be sent or sold',
  // A local run points the site at its own Anvil's pass (D-045, `pass:local-stack`).
  address:
    readContractAddress(process.env.NEXT_PUBLIC_FOUNDING_PASS_ADDRESS) ??
    '0xAA2b4891a5057aBafD645986ff5493A4F1027080',
}

/** The contracts the On-chain list and the footer show (D-050 adds the pass). */
export const listedContracts: readonly DeployedContract[] = [
  ...deployedContracts,
  foundingPassContract,
]

function readContractAddress(addressText: string | undefined): ContractAddress | null {
  return addressText !== undefined && /^0x[0-9a-fA-F]{40}$/.test(addressText)
    ? (addressText as ContractAddress)
    : null
}

/** A token's page on MonadVision, which shows its owner and picture. */
export function buildExplorerTokenUrl(contractAddress: ContractAddress, tokenId: number): string {
  return `https://testnet.monadvision.com/nft/${contractAddress}/${tokenId}`
}

export function buildExplorerAddressUrl(address: ContractAddress): string {
  return `https://testnet.monadvision.com/address/${address}`
}

/** A transaction on MonadVision: the mint, from the moment it's signed (D-045). */
export function buildExplorerTransactionUrl(transactionHash: `0x${string}`): string {
  return `https://testnet.monadvision.com/tx/${transactionHash}`
}

export function shortenAddress(address: ContractAddress): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export const onChainContent = {
  heading: 'Everything that matters lives on Monad.',
  intro: `Five verified contracts on Monad testnet (chain ${monadTestnetChainId}).`,
  artHeading: 'The picture is on-chain too',
  artText:
    'The Sneaker’s picture is an SVG drawn by a contract, so the app, MonadVision and MetaMask show the same image. The app and the explorer redraw it when you repair or upgrade.',
} as const
