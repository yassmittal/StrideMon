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
  address: '0xC116917b06BD9079C87334ED5499054b1B54Fa80',
}

export const deployedContracts: readonly DeployedContract[] = [
  sneakerNftContract,
  {
    name: 'StrideToken',
    standard: 'ERC-20',
    role: 'STRIDE, the reward token',
    address: '0xe52DC9df236a6A4F8653432cE6Fd94Dd41e76CC0',
  },
  {
    name: 'SneakerGame',
    standard: 'Rules',
    role: 'Energy, rewards, repair and upgrade',
    address: '0x36cf91880F0fb41Eeda9fe79e7C5c2BE953f45B9',
  },
  {
    name: 'SneakerArtRenderer',
    standard: 'SVG',
    role: 'Draws the Sneaker’s picture',
    address: '0x7e01732461C1879915C35E56e73Fd8569B289ADa',
  },
]

export function buildExplorerAddressUrl(address: ContractAddress): string {
  return `https://testnet.monadvision.com/address/${address}`
}

export function shortenAddress(address: ContractAddress): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export const onChainContent = {
  heading: 'Everything that matters lives on Monad.',
  intro: `Four verified contracts on Monad testnet (chain ${monadTestnetChainId}).`,
  artHeading: 'The picture is on-chain too',
  artText:
    'The Sneaker’s picture is an SVG drawn by a contract, so the app, MonadVision and MetaMask show the same image. The app and the explorer redraw it when you repair or upgrade.',
} as const
