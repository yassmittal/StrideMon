import { readFile } from 'node:fs/promises'
import {
  monadTestnet,
  type StrideMonContractAddresses,
  sneakerGameAbi,
  sneakerNftAbi,
  soleTokenAbi,
} from '@stridemon/chain'
import { FIXTURE_GAME_CONFIG } from '@stridemon/shared/game-rules/fixtures'
import {
  type Abi,
  type Address,
  createPublicClient,
  createWalletClient,
  type Hash,
  type Hex,
  http,
  isHex,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

// Anvil's default dev accounts #0 and #1: public, well-known keys that only ever
// hold Anvil's fake ETH. Never use them on a real network.
const ANVIL_DEPLOYER_PRIVATE_KEY =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
export const ANVIL_GAME_SERVER_PRIVATE_KEY =
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'

const FOUNDRY_OUT_URL = new URL('../../../../packages/contracts/out/', import.meta.url)

// Same names and symbols as DeployGame.s.sol.
const SNEAKER_NFT_NAME = 'StrideMon Sneaker'
const SNEAKER_NFT_SYMBOL = 'SNEAKER'
const SOLE_TOKEN_NAME = 'Sole'
const SOLE_TOKEN_SYMBOL = 'SOLE'

/**
 * Deploys SneakerNft, SoleToken and SneakerGame to a test Anvil and wires the same
 * roles as `DeployGame.s.sol`, with the game config from the shared fixtures
 * (which `DeployGame.t.sol` pins the real deploy to). Uses Foundry's `out/`, so run
 * `bun run contracts:build` first.
 *
 * Not `forge script`: the test Anvil shares chain id 10143 with the testnet, and a
 * broadcast would overwrite `deployments/10143.json` (D-019).
 */
export async function deployTestContracts(rpcUrl: string): Promise<StrideMonContractAddresses> {
  const deployerAccount = privateKeyToAccount(ANVIL_DEPLOYER_PRIVATE_KEY)
  const gameServerAddress = privateKeyToAccount(ANVIL_GAME_SERVER_PRIVATE_KEY).address
  const publicClient = createPublicClient({ chain: monadTestnet, transport: http(rpcUrl) })
  const deployerWalletClient = createWalletClient({
    account: deployerAccount,
    chain: monadTestnet,
    transport: http(rpcUrl),
  })

  async function deploy(
    contractName: string,
    abi: Abi,
    args: readonly unknown[],
  ): Promise<Address> {
    const transactionHash = await deployerWalletClient.deployContract({
      abi,
      bytecode: await readCreationBytecode(contractName),
      args,
    })
    const receipt = await publicClient.waitForTransactionReceipt({ hash: transactionHash })
    if (receipt.contractAddress == null) throw new Error(`${contractName} deployed no contract`)
    return receipt.contractAddress
  }

  async function confirm(transactionHash: Hash): Promise<void> {
    const receipt = await publicClient.waitForTransactionReceipt({ hash: transactionHash })
    if (receipt.status !== 'success')
      throw new Error(`Test deploy step reverted: ${transactionHash}`)
  }

  const adminAddress = deployerAccount.address
  const sneakerNft = await deploy('SneakerNft', sneakerNftAbi, [
    SNEAKER_NFT_NAME,
    SNEAKER_NFT_SYMBOL,
    adminAddress,
  ])
  const soleToken = await deploy('SoleToken', soleTokenAbi, [
    SOLE_TOKEN_NAME,
    SOLE_TOKEN_SYMBOL,
    adminAddress,
  ])
  const sneakerGame = await deploy('SneakerGame', sneakerGameAbi, [
    adminAddress,
    sneakerNft,
    soleToken,
    FIXTURE_GAME_CONFIG,
  ])

  // The five grants in DeployGame.s.sol → deployGame, in the same order.
  const [gameRole, minterRole, burnerRole, gameServerRole, pauserRole] = await Promise.all([
    publicClient.readContract({
      address: sneakerNft,
      abi: sneakerNftAbi,
      functionName: 'GAME_ROLE',
    }),
    publicClient.readContract({
      address: soleToken,
      abi: soleTokenAbi,
      functionName: 'MINTER_ROLE',
    }),
    publicClient.readContract({
      address: soleToken,
      abi: soleTokenAbi,
      functionName: 'BURNER_ROLE',
    }),
    publicClient.readContract({
      address: sneakerGame,
      abi: sneakerGameAbi,
      functionName: 'GAME_SERVER_ROLE',
    }),
    publicClient.readContract({
      address: sneakerGame,
      abi: sneakerGameAbi,
      functionName: 'PAUSER_ROLE',
    }),
  ])
  await confirm(
    await deployerWalletClient.writeContract({
      address: sneakerNft,
      abi: sneakerNftAbi,
      functionName: 'grantRole',
      args: [gameRole, sneakerGame],
    }),
  )
  await confirm(
    await deployerWalletClient.writeContract({
      address: soleToken,
      abi: soleTokenAbi,
      functionName: 'grantRole',
      args: [minterRole, sneakerGame],
    }),
  )
  await confirm(
    await deployerWalletClient.writeContract({
      address: soleToken,
      abi: soleTokenAbi,
      functionName: 'grantRole',
      args: [burnerRole, sneakerGame],
    }),
  )
  await confirm(
    await deployerWalletClient.writeContract({
      address: sneakerGame,
      abi: sneakerGameAbi,
      functionName: 'grantRole',
      args: [gameServerRole, gameServerAddress],
    }),
  )
  await confirm(
    await deployerWalletClient.writeContract({
      address: sneakerGame,
      abi: sneakerGameAbi,
      functionName: 'grantRole',
      args: [pauserRole, adminAddress],
    }),
  )

  return { sneakerNft, soleToken, sneakerGame }
}

async function readCreationBytecode(contractName: string): Promise<Hex> {
  const artifactUrl = new URL(`${contractName}.sol/${contractName}.json`, FOUNDRY_OUT_URL)
  let artifactText: string
  try {
    artifactText = await readFile(artifactUrl, 'utf8')
  } catch (error) {
    throw new Error(
      `No Foundry artifact for ${contractName}. Run \`bun run contracts:build\` first.`,
      { cause: error },
    )
  }
  const artifact: unknown = JSON.parse(artifactText)
  const bytecode =
    typeof artifact === 'object' &&
    artifact !== null &&
    'bytecode' in artifact &&
    typeof artifact.bytecode === 'object' &&
    artifact.bytecode !== null &&
    'object' in artifact.bytecode
      ? artifact.bytecode.object
      : undefined
  if (typeof bytecode !== 'string' || !isHex(bytecode)) {
    throw new Error(`${contractName}'s artifact has no creation bytecode`)
  }
  return bytecode
}
