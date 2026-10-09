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
  address: '0x6A9B08943f60F0bb779Bd229f907f92CB8002062',
}

export const deployedContracts: readonly DeployedContract[] = [
  sneakerNftContract,
  {
    name: 'StrideToken',
    standard: 'ERC-20',
    role: 'STRIDE, the reward token',
    address: '0xf835cd7F9cBf44D76c2d7CE0643B4858437485f3',
  },
  {
    name: 'SneakerGame',
    standard: 'Rules',
    role: 'Energy, rewards, repair and upgrade',
    address: '0x846cd7B8D213Bf516020f22343A69168B81fDE52',
  },
  {
    name: 'SneakerArtRenderer',
    standard: 'SVG',
    role: 'Draws the Sneaker’s picture',
    address: '0x080Dbf4DD14F0C54E8bA0192c2A315ADA3Bbf229',
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
