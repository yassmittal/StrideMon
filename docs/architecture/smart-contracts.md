# Smart Contracts

Foundry project in `packages/contracts`, using Solidity (latest stable 0.8.x,
pinned in `foundry.toml`) and OpenZeppelin Contracts v5 via Soldeer. It is
deployed to **Monad testnet** until Phase 10.

> Verify at Phase 1 start: Monad testnet chain id (10143 at time of writing),
> the public RPC URL, the block explorer and its contract-verification method.
> Record them in `packages/chain/src/monad-chains.ts`, not in this doc.

## Three contracts, three responsibilities

```text
                 ┌──────────────────────────┐
                 │       SneakerGame        │   the rules
                 │  settleSession           │   (replaceable)
                 │  repair / upgrade        │
                 │  mintStarterSneaker      │
                 │  quote* view functions   │
                 └─────┬──────────────┬─────┘
      GAME_ROLE on     │              │    MINTER_ROLE + BURNER_ROLE on
                       ↓              ↓
       ┌──────────────────────┐   ┌──────────────────────┐
       │      SneakerNft      │   │   SoleToken (SOLE)   │
       │  ERC-721             │   │  ERC-20 (18 dec.)    │
       │  stats + energy      │   │  mint / burn gated   │
       │  on-chain tokenURI   │   │                      │
       └──────────────────────┘   └──────────────────────┘
          the asset (permanent)      the currency (permanent)
```

**Why split the rules from the asset:** `SneakerNft` and `SoleToken` hold
players' property and should never need redeploying. `SneakerGame` holds rules,
which will change. To change the rules, deploy a new `SneakerGame`, grant it the
roles and revoke them from the old one. Nobody's Sneaker or balance moves.

## `SneakerNft`

ERC-721 + ERC721Enumerable + AccessControl.

`ERC721Enumerable` lets the app and API list "Sneakers owned by this wallet"
straight from the chain (`tokenOfOwnerByIndex`) without running an indexer. It
costs a little extra gas per transfer, which is negligible on Monad. If an
indexer arrives later (Phase 10), this can be revisited.

```solidity
struct SneakerAttributes {
    uint16 level;
    uint16 efficiency;
    uint16 durability;
    uint16 storedEnergy;
    uint64 energyUpdatedAt;
}
```

| Function | Access | Purpose |
|----------|--------|---------|
| `mint(address to, SneakerAttributes attributes) → tokenId` | `GAME_ROLE` | New Sneaker |
| `setAttributes(uint256 tokenId, SneakerAttributes attributes)` | `GAME_ROLE` | The only way stats change |
| `getAttributes(uint256 tokenId) → SneakerAttributes` | public view | Raw storage |
| `tokenURI(uint256 tokenId)` | public view | Base64 JSON built on-chain from attributes (SVG image in Phase 8) |

Events: `SneakerMinted(tokenId, owner, attributes)`, `SneakerAttributesUpdated(tokenId, attributes)`.

The NFT contract holds **no game logic**, not even energy regeneration. It
stores what it's given, and `SneakerGame` interprets it.

## `SoleToken`

ERC-20 + ERC20Permit + AccessControl.

| Function | Access |
|----------|--------|
| `mint(address to, uint256 amount)` | `MINTER_ROLE` (SneakerGame) |
| `burnFrom(address account, uint256 amount)` | `BURNER_ROLE` (SneakerGame) |

`SneakerGame` only ever burns from `msg.sender` (the player calling `repair` or
`upgrade`). The player therefore needs **no separate approve transaction**, and
nobody else can burn their tokens. Unit tests must pin this invariant.

Name `Sole`, symbol `SOLE`, 18 decimals. The name and symbol are passed to the
constructor by `DeployGame.s.sol`, not hardcoded in the contract.

## `SneakerGame`

AccessControl + Pausable + ReentrancyGuard.

Roles:

| Role | Held by | Can |
|------|---------|-----|
| `DEFAULT_ADMIN_ROLE` | deployer (testnet), multisig (mainnet) | grant roles, `setGameConfig` |
| `GAME_SERVER_ROLE` | API relayer key | `mintStarterSneaker`, `settleSession` |
| `PAUSER_ROLE` | deployer / ops key | `pause`, `unpause` |

Functions:

| Function | Caller | Does |
|----------|--------|------|
| `mintStarterSneaker(address player)` | game server | One per address (`hasClaimedStarterSneaker`). Mints with starter attributes. |
| `settleSession(SessionSettlement settlement)` | game server | See below |
| `repair(uint256 tokenId)` | Sneaker owner | Burns `quoteRepairCost`, restores durability |
| `upgrade(uint256 tokenId)` | Sneaker owner | Burns `quoteUpgradeCost`, level +1, efficiency + gain |
| `currentEnergy(uint256 tokenId) → uint16` | view | Lazy regeneration (see `game-rules.md`) |
| `quoteRepairCost(uint256 tokenId) → uint256` | view | The mobile app shows exactly this |
| `quoteUpgradeCost(uint256 tokenId) → uint256` | view | Same |
| `previewSessionReward(tokenId, activeMinutes) → (reward, durabilityLoss, rewardedMinutes)` | view | Same math as `settleSession`, without side effects |
| `setGameConfig(GameConfig config)` | admin | Tune numbers from `game-rules.md` |

```solidity
struct SessionSettlement {
    bytes32 sessionId;       // keccak256 of the Mongo activitySession id
    uint256 tokenId;
    address player;          // wallet that ran the session
    uint32  activeMinutes;   // validated by the API
    uint32  distanceMeters;  // validated by the API, recorded in the event
}
```

`settleSession` must, in order:

1. Require that `sessionId` has not been settled (`isSessionSettled[sessionId]`), then mark it.
2. Require `ownerOf(tokenId) == player`. A Sneaker transferred mid-run doesn't pay out.
3. Compute `rewardedMinutes`, `reward` and `durabilityLoss` using the **same
   internal function** as `previewSessionReward`.
4. Write the new attributes (energy spent, durability reduced) to `SneakerNft`.
5. Mint `reward` to `player`.
6. Emit `SessionSettled(sessionId, tokenId, player, rewardedMinutes, distanceMeters, reward, durabilityLoss)`.

Custom errors, not revert strings: `SessionAlreadySettled(bytes32)`,
`NotSneakerOwner(uint256 tokenId, address caller)`, `SneakerAtMaxLevel(uint256)`,
`StarterSneakerAlreadyClaimed(address)`, `NothingToRepair(uint256)`, …

## Project layout

```text
packages/contracts/
├── foundry.toml
├── src/
│   ├── SneakerNft.sol
│   ├── SoleToken.sol
│   ├── SneakerGame.sol
│   └── libraries/
│       └── GameMath.sol          pure functions: energy, reward, costs
├── script/
│   ├── DeployGame.s.sol          deploys all three, wires roles, writes addresses JSON
│   └── UpdateGameConfig.s.sol
└── test/
    ├── SneakerNft.t.sol
    ├── SoleToken.t.sol
    ├── SneakerGame.t.sol
    ├── GameMath.t.sol            reads packages/shared/.../game-rule-fixtures.json
    └── invariants/
        └── SoleSupply.invariant.t.sol
```

`GameMath` is a library of pure functions. Keeping the math out of storage-touching
code makes it trivially testable against the shared fixtures.

## Solidity conventions

- NatSpec (`/// @notice`, `/// @param`) on every external and public function.
- Custom errors, and events named in the past tense (`SessionSettled`, not `SettleSession`).
- Checks → effects → interactions, plus `nonReentrant` on every state-changing
  external function in `SneakerGame`.
- No magic numbers. Every tunable value lives in `GameConfig`, and every fixed
  value is a named `constant`.
- Units are part of the name: `energyRegenerationSeconds`, `rewardPerEfficiencyMinuteWei`.
- `forge fmt` enforced, and `forge test` plus `forge coverage` on every change.

## Deployment flow (testnet)

1. Fund the deployer and game-server keys from the Monad testnet faucet.
2. `forge script script/DeployGame.s.sol --rpc-url monad_testnet --broadcast --verify`.
3. The script grants roles: `GAME_ROLE` on the NFT, `MINTER_ROLE`/`BURNER_ROLE`
   on the token, and `GAME_SERVER_ROLE` to the API relayer address.
4. The script writes `deployments/<chainId>.json`. `bun run chain:export-abis`
   copies the ABIs and addresses into `packages/chain`.
5. Verify the source on the explorer so judges can read it.
