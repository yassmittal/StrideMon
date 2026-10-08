# Smart Contracts

Foundry project in `packages/contracts`, using Solidity (latest stable 0.8.x,
pinned in `foundry.toml`) and OpenZeppelin Contracts v5 via Soldeer. It is
deployed to **Monad testnet** until Phase 10.

Confirmed at Phase 1 start (D-016): chain id 10143, Foundry ≥ 1.8 with
`network = "monad"`, `evm_version = "cancun"`, and verification on MonadVision
through Sourcify. The chain definition lives in `packages/chain/src/monad-chains.ts`.

## Three contracts, three responsibilities

(Plus `SneakerArtRenderer`, which draws the Sneaker's picture for `SneakerNft`, D-030. The
Founding Pass adds a fourth, separate contract: see "The Founding Pass" below, D-041.)

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
       │      SneakerNft      │   │ StrideToken (STRIDE) │
       │  ERC-721             │   │  ERC-20 (18 dec.)    │
       │  stats + energy      │   │  mint / burn gated   │
       │  on-chain tokenURI   │   │                      │
       └──────────────────────┘   └──────────────────────┘
          the asset (permanent)      the currency (permanent)
```

**Why split the rules from the asset:** `SneakerNft` and `StrideToken` hold
players' property and should never need redeploying. `SneakerGame` holds rules,
which will change. To change the rules, deploy a new `SneakerGame`, grant it the
roles and revoke them from the old one. Nobody's Sneaker or balance moves.

## `SneakerNft`

ERC-721 + ERC721Enumerable + AccessControl. Name `StrideMon Sneaker`, symbol
`SNEAKER`, both passed to the constructor by `DeployGame.s.sol`. Token ids start
at 1. `mint` uses `_mint`, not `_safeMint`: the game mints to player wallets, and
skipping the receiver callback keeps external calls out of the mint path.

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
| `tokenURI(uint256 tokenId)` | public view | Base64 JSON built on-chain from attributes: Level, Efficiency, Durability, and an SVG `image` |
| `imageSvg(uint256 tokenId) → string` | public view | The raw SVG from `artRenderer` (the app draws this) |
| `setArtRenderer(ISneakerArtRenderer artRenderer)` | `DEFAULT_ADMIN_ROLE` | Swap the picture without touching any Sneaker (D-030) |

Events: `SneakerMinted(tokenId, owner, attributes)`, `SneakerAttributesUpdated(tokenId, attributes)`,
`ArtRendererUpdated(artRenderer)`, plus ERC-4906 `MetadataUpdate(tokenId)` on every stat change
and `BatchMetadataUpdate` on a renderer change, so explorers and wallets refresh the picture.
The constructor takes the renderer as a fourth argument and rejects the zero address
(`InvalidArtRenderer()`).

The NFT contract holds **no game logic**, not even energy regeneration. It
stores what it's given, and `SneakerGame` interprets it. That is also why
`tokenURI` doesn't show energy: the stored value is stale until `SneakerGame`
applies regeneration, so marketplaces would show the wrong number.

## `SneakerArtRenderer` (D-030)

`renderImageSvg(uint256 tokenId, SneakerAttributes attributes) → string`, pure. It draws a
400 × 400 SVG in the design-system look: the `darkPanel` background, "+" corner marks, a thin
white line drawing of the Sneaker with a lime stripe, and lime speed lines behind the heel.

| Reflects | How |
|----------|-----|
| Token id | `#0004` top right, under `STRIDEMON` top left |
| Level | 30 ticks, the first `level` of them lime; one speed line per level, up to 5 |
| Durability | A lime bar out of 100. The lime fades from full to 40% as durability drops, so a worn Sneaker looks dimmer |

The 30 and 100 are the launch `maxLevel` and `maxDurability` (named constants; values above
them are drawn full). Text uses a generic monospace stack (`'IBM Plex Mono', ui-monospace,
monospace`) on the root `<svg>`, so no font is fetched. Everything is plain paths, rects and text,
with no filters, gradients or CSS, so `react-native-svg` draws it exactly like a browser.

## `StrideToken`

ERC-20 + ERC20Permit + AccessControl.

| Function | Access |
|----------|--------|
| `mint(address to, uint256 amount)` | `MINTER_ROLE` (SneakerGame) |
| `burnFrom(address account, uint256 amount)` | `BURNER_ROLE` (SneakerGame) |

`SneakerGame` only ever burns from `msg.sender` (the player calling `repair` or
`upgrade`). The player therefore needs **no separate approve transaction**, and
nobody else can burn their tokens. Unit tests must pin this invariant.

Name `Stride`, symbol `STRIDE`, 18 decimals. The name and symbol are passed to the
constructor by `DeployGame.s.sol`, not hardcoded in the contract.

## `SneakerGame`

AccessControl + Pausable + ReentrancyGuardTransient. OpenZeppelin 5.x deprecates
the storage-based `ReentrancyGuard`, and Monad supports Cancun's transient storage.

Roles:

| Role | Held by | Can |
|------|---------|-----|
| `DEFAULT_ADMIN_ROLE` | deployer (testnet), multisig (mainnet) | grant roles, `setGameConfig` |
| `GAME_SERVER_ROLE` | API relayer key | `mintStarterSneaker`, `settleSession` |
| `PAUSER_ROLE` | deployer / ops key | `pause`, `unpause` |

Pausing stops every state-changing function: `mintStarterSneaker`,
`settleSession`, `repair` and `upgrade`. Views keep working.

Functions:

| Function | Caller | Does |
|----------|--------|------|
| `mintStarterSneaker(address player)` | game server | One per address (`hasClaimedStarterSneaker`). Mints with starter attributes. |
| `settleSession(SessionSettlement settlement)` | game server | See below |
| `repair(uint256 tokenId)` | Sneaker owner | Burns `quoteRepairCost`, restores durability |
| `upgrade(uint256 tokenId)` | Sneaker owner | Burns `quoteUpgradeCost`, level +1, efficiency + gain |
| `currentEnergy(uint256 tokenId) → uint16` | view | Lazy regeneration (see `game-rules.md`) |
| `quoteRepairCost(uint256 tokenId) → uint256` | view | The mobile app shows exactly this. 0 at full durability |
| `quoteUpgradeCost(uint256 tokenId) → uint256` | view | Same. Reverts `SneakerAtMaxLevel` at max level |
| `previewSessionReward(tokenId, activeMinutes) → (rewardAmountWei, durabilityLoss, rewardedMinutes)` | view | Same math as `settleSession`, without side effects |
| `setGameConfig(GameConfig config)` | admin | Tune numbers from `game-rules.md` |
| `getGameConfig() → GameConfig` | view | The config in force |

```solidity
struct GameConfig {                            // initial values from game-rules.md
    uint16  maxLevel;                            // 30
    uint16  maxEnergy;                           // 10
    uint16  maxDurability;                       // 100
    uint16  starterEfficiency;                   // 10
    uint16  efficiencyGainPerLevel;              // 2
    uint16  durabilityLossPerMinuteBasisPoints;  // 3_000
    uint32  energyRegenerationSeconds;           // 1_800
    uint256 rewardPerEfficiencyMinuteWei;        // 0.5 STRIDE
    uint256 repairCostPerPointWei;               // 0.7 STRIDE (at level 1)
    uint256 repairCostPerPointIncreasePerLevelWei; // 0.1 STRIDE
    uint256 upgradeCostPerLevelWei;              // 50 STRIDE
}
```

`setGameConfig` (and the constructor) reject a config that would break the math
or make the game unplayable, with `InvalidGameConfig()`: zero
`energyRegenerationSeconds`, `maxEnergy`, `maxDurability` or `starterEfficiency`,
or `maxLevel` below the starter level (1). Every accepted config emits
`GameConfigUpdated(config)`.

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
5. Mint `reward` to `player` (skipped when it is 0).
6. Emit `SessionSettled(sessionId, tokenId, player, rewardedMinutes, distanceMeters, rewardAmountWei, durabilityLoss)`.

`repair` emits `SneakerRepaired(tokenId, owner, durabilityRestored, repairCostWei)`
and `upgrade` emits `SneakerUpgraded(tokenId, owner, newLevel, newEfficiency, upgradeCostWei)`.
If the owner's STRIDE balance is short, OpenZeppelin's `ERC20InsufficientBalance`
bubbles up.

Custom errors, not revert strings: `SessionAlreadySettled(bytes32)`,
`NotSneakerOwner(uint256 tokenId, address caller)`, `SneakerAtMaxLevel(uint256)`,
`StarterSneakerAlreadyClaimed(address)`, `NothingToRepair(uint256)`,
`InvalidGameConfig()`.

## The Founding Pass (planned, D-041)

Not built yet. Parts 1b and 2 of [`../founding-pass/`](../founding-pass/README.md) build it, and
the brief's §10.1 ([`../founding-pass-brief.md`](../founding-pass-brief.md)) has the full
interface. When they land, this section replaces the plan with what was built.

**`FoundingPass`** (new, its own contract and its own deploy script, so a game redeploy never
touches it): ERC-721 + ERC-5192 (soulbound) + AccessControl, `StrideMon Founding Pass` / `PASS`.

| Piece | What it is |
|-------|------------|
| Token id | the design number, 1 to 1,000. Each design mints once |
| `mint(to, designNumber)` | `MINTER_ROLE` (the game-server key). Records the founder number (the mint order) and rolls the gold frame, about 1 in 10, from on-chain randomness (cosmetic). One pass per wallet |
| `setLaced(tokenId)` | `MINTER_ROLE`, once: after the holder's first settled walk |
| `passOf`, `mintedBitmap` | the per-mint record, and which of the 1,000 are minted in one call |
| `recoverFoundingPass(tokenId, newOwner)` | `RECOVERY_ROLE` (the deployer key): the lost-wallet move, record kept |
| Transfers and approvals | revert. `locked()` is always true |
| `tokenURI`, `imageSvg` | drawn by a swappable `FoundingPassArtRenderer`, like D-030 |

**`FoundingPassArtRenderer`** (new): the gallery's preview card, the minted card (founder number,
laced, gold frame), and the shoe on its own for the Founder Sneaker. It holds the frozen design
table and the name words, including the ten Legendaries' hand-picked names. If one contract
passes Monad's 128 KB, the drawing, the art data and the design table split.

**Founder Sneakers** (the game contracts are redeployed for them; there are no users yet):

- **`SneakerNft`** records which pass a Founder Sneaker belongs to (none for a normal Sneaker).
  A Founder Sneaker can't be transferred, with its own custom error. Normal Sneakers transfer as
  in Phase 7.
- **`SneakerGame`** mints one Founder Sneaker per pass, to the pass holder (`GAME_SERVER_ROLE`).
  The starter rule for everyone else stays. `RECOVERY_ROLE` moves a Founder Sneaker with its
  pass, stats intact.
- **A new Sneaker renderer** draws a Founder Sneaker in its pass's design, laced when the pass
  is, and normal Sneakers in today's line art (set with `setArtRenderer`).

New roles: `MINTER_ROLE` and `RECOVERY_ROLE` on `FoundingPass`, and `RECOVERY_ROLE` on
`SneakerGame`. Who holds which is in `security.md`.

## Project layout

```text
packages/contracts/
├── foundry.toml
├── src/
│   ├── SneakerNft.sol
│   ├── StrideToken.sol
│   ├── SneakerGame.sol
│   ├── SneakerArtRenderer.sol    the on-chain SVG (D-030)
│   └── libraries/
│       └── GameMath.sol          pure functions: energy, reward, costs
├── deployments/
│   └── <chainId>.json            chain id, addresses, deployer, game server (written by DeployGame)
├── script/
│   ├── DeployGame.s.sol          deploys all three, wires roles, writes addresses JSON
│   └── UpdateGameConfig.s.sol    (added the first time the config is retuned)
└── test/
    ├── SneakerNft.t.sol
    ├── SneakerArtRenderer.t.sol
    ├── StrideToken.t.sol
    ├── SneakerGame.t.sol         starter mint, settlement, views, config, pause
    ├── SneakerGameRepairUpgrade.t.sol
    ├── GameMath.t.sol            reads packages/shared/.../game-rule-fixtures.json, plus fuzz
    ├── DeployGame.t.sol          role wiring; initial config == fixture config
    ├── helpers/                  GameTestBase (deploys via DeployGame), fixture reader
    └── invariants/
        ├── StrideSupply.invariant.t.sol
        └── StrideSupplyHandler.sol
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

1. Fund the deployer and game-server keys from the Monad testnet faucet. The
   keys live in `packages/contracts/.env` (gitignored; `.env.example` lists the
   variables).
2. From `packages/contracts`:
   `forge script script/DeployGame.s.sol --rpc-url monad_testnet --broadcast --verify --verifier sourcify --verifier-url https://sourcify-api-monad.blockvision.org/`.
3. The script deploys `SneakerArtRenderer` first and passes it to `SneakerNft`, then grants roles: `GAME_ROLE` on the NFT, `MINTER_ROLE`/`BURNER_ROLE`
   on the token, and `GAME_SERVER_ROLE` to the API relayer address.
4. The script writes `deployments/<chainId>.json`. `bun run chain:export-abis`
   copies the ABIs and addresses into `packages/chain`.
5. Check the verified source on MonadVision so judges can read it. If
   `--verify` failed, rerun `forge verify-contract <address> <Contract> --chain 10143
   --verifier sourcify --verifier-url https://sourcify-api-monad.blockvision.org/`
   for each contract.
