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
| `mintFounderSneaker(to, attributes, foundingPassTokenId) → tokenId` | `GAME_ROLE` | A Founder Sneaker, one per pass (D-042, see "Founder Sneakers" below) |
| `moveFounderSneaker(uint256 tokenId, address newOwner)` | `GAME_ROLE` | The lost-wallet move for a Founder Sneaker |
| `foundingPassTokenIdOf(sneakerTokenId)`, `founderSneakerTokenIdOf(foundingPassTokenId)` | public view | The link between a Founder Sneaker and its pass (0 for none) |

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

`renderImageSvg(uint256 tokenId, SneakerAttributes attributes, uint256 foundingPassTokenId) →
string`, view. For a normal Sneaker (`foundingPassTokenId` 0) it draws a 400 × 400 SVG in the
design-system look: the `darkPanel` background, "+" corner marks, a thin white line drawing of
the Sneaker with a lime stripe, and lime speed lines behind the heel. A Founder Sneaker is drawn
in its pass's design instead (D-042, see "Founder Sneakers" below). The constructor takes the
`FoundingPass` it reads.

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
| `GAME_SERVER_ROLE` | API relayer key | `mintStarterSneaker`, `mintFounderSneaker`, `settleSession` |
| `PAUSER_ROLE` | deployer / ops key | `pause`, `unpause` |
| `RECOVERY_ROLE` | deployer, never the game server | `recoverFounderSneaker` (D-041, D-042) |

Pausing stops every player-facing state change: `mintStarterSneaker`, `mintFounderSneaker`,
`settleSession`, `repair` and `upgrade`. Views and `recoverFounderSneaker` keep working.

Functions:

| Function | Caller | Does |
|----------|--------|------|
| `mintStarterSneaker(address player)` | game server | One per address (`hasClaimedStarterSneaker`). Mints with starter attributes. |
| `mintFounderSneaker(uint256 foundingPassTokenId)` | game server | The pass's one Founder Sneaker, with starter attributes, to whoever holds the pass. Marks that wallet's starter as claimed |
| `recoverFounderSneaker(uint256 foundingPassTokenId)` | recovery (deployer) | Moves the Founder Sneaker to whoever holds the pass now, stats intact |
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

## The Founding Pass (D-041, D-042)

Built in Part 2 of [`../founding-pass/`](../founding-pass/README.md), from the brief's §10.1
([`../founding-pass-brief.md`](../founding-pass-brief.md)). D-042 has the choices made on the
way.

```text
        ┌───────────────────────────┐  artRenderer   ┌─────────────────────────────┐
        │       FoundingPass        │ ─────────────→ │   FoundingPassArtRenderer   │
        │  ERC-721 + ERC-5192       │                │   the 1,000 designs (pure)  │
        │  one per wallet, locked   │                └─────────────────────────────┘
        └───▲───────────────▲───────┘                              ▲
  ownerOf   │               │ passOf, artRenderer                  │ draws the shoe
            │               │                                      │
   ┌────────┴─────┐   ┌─────┴───────────────────────────────────────┴──┐
   │ SneakerGame  │   │ SneakerArtRenderer: normal Sneakers in D-030's  │
   │ Founder mint │   │ line art, Founder Sneakers in their pass's      │
   │ and recovery │   │ design (SneakerNft's renderer)                  │
   └──────────────┘   └─────────────────────────────────────────────────┘
```

### `FoundingPass`

ERC-721 + ERC721Enumerable + ERC-5192 (soulbound) + ERC-4906 + AccessControl, `StrideMon Founding
Pass` / `PASS`. Its own contract and its own deploy script (`DeployFoundingPass.s.sol`), so a
game redeploy never touches it.

| Function | Access | Does |
|----------|--------|------|
| `DESIGN_COUNT` | constant | 1,000. **The token id is the design number** (1 to 1,000) |
| `mint(address to, uint256 designNumber) → PassRecord` | `MINTER_ROLE` (game server) | Records the founder number (`++mintedCount`, the mint order) and rolls the gold frame (1 in 10, D-042). Emits `FoundingPassMinted` and ERC-5192 `Locked` |
| `setLaced(uint256 tokenId)` | `MINTER_ROLE` | Once, after the holder's first settled walk. Laces the pass and its Founder Sneaker's picture. Emits `FoundingPassLaced` and `MetadataUpdate` |
| `recoverFoundingPass(uint256 tokenId, address newOwner)` | `RECOVERY_ROLE` (deployer) | The lost-wallet move. The record (founder number, frame, laced) stays with the token |
| `passOf(uint256 tokenId) → PassRecord` | view | `(founderNumber, hasGoldFrame, isLaced)`. The design comes from the art renderer |
| `mintedBitmap() → uint256[4]` | view | Which designs are minted, in one call. Bit *n* is design *n*, bit 0 is never set |
| `mintedCount()` | view | Passes minted so far |
| `locked(uint256 tokenId)` | view | Always true (ERC-5192) |
| `imageSvg(uint256 tokenId)`, `tokenURI(uint256 tokenId)` | view | The card from the art renderer, and on-chain JSON with its attributes: template, family, colourway, each option, rarity, founder number, frame, stage, and the lace colour once laced |
| `setArtRenderer(IFoundingPassArtRenderer)` | `DEFAULT_ADMIN_ROLE` | Swap the pass art (and with it every Founder Sneaker's shoe) |

- **Transfers and approvals revert** with `FoundingPassIsSoulbound()`: `transferFrom`, both
  `safeTransferFrom`s, `approve` and `setApprovalForAll`. Only `recoverFoundingPass` moves a pass.
- **Errors:** `InvalidDesign(designNumber)` outside 1 to 1,000, `PassAlreadyMinted(designNumber)`,
  `FoundingPassAlreadyHeld(wallet)` (from `mint` and `recoverFoundingPass`),
  `FoundingPassAlreadyLaced(tokenId)`, `FoundingPassIsSoulbound()`, `InvalidArtRenderer()`.
- **Events:** `FoundingPassMinted(tokenId, owner, founderNumber, hasGoldFrame)`,
  `FoundingPassLaced(tokenId)`, `FoundingPassRecovered(tokenId, previousOwner, newOwner)`,
  `ArtRendererUpdated(artRenderer)`, plus `Locked`, `MetadataUpdate` and `BatchMetadataUpdate`.

### `FoundingPassArtRenderer`

Built in Part 1b: the only implementation of the pass art. Pure functions, no storage, about
66 KB with the attribute labels (under Monad's 128 KB, so nothing split). It implements `IFoundingPassArtRenderer`
(declared in `FoundingPass.sol`).

| Function | Returns |
|----------|---------|
| `renderDesignPreviewSvg(designNumber)` | The gallery's card: available, unlaced, no founder number, no frame |
| `renderPassSvg(tokenId, PassRecord)` | A minted pass: `FOUNDER 042`, laced, gold frame, as its record says |
| `renderSneakerMarkup(DesignLayers, isLaced, clipPathId)` | The shoe alone in its 1000 × 600 space, for the Founder Sneaker's picture to place |
| `readSneakerOutline(templateIndex)` | The silhouette and heel tab's path data and the silhouette's top, so a picture can draw a rim round the shoe and centre it |
| `readDesignLayers`, `readDesignName`, `readDesignRarity`, `readDesignTraits` | A design's row, its name (a Legendary's hand-picked one), its rarity, and its layers' labels for the attributes |

Errors: `InvalidDesignNumber(designNumber)` outside 1 to 1,000, `InvalidDesignLayers()` for
layers the art data doesn't have. `PassRecord` is `(uint32 founderNumber, bool hasGoldFrame,
bool isLaced)`, the record `FoundingPass` keeps per token.

The data is generated from the art system in `packages/contracts/art/founding-pass` by its build
script, and never edited by hand: `founding-pass-art/FoundingPassArtData.sol` (each template's
shapes, the colours, the name and label words) and `founding-pass-art/FoundingPassDesigns.sol`
(the design table, 8 bytes per design). Both are libraries compiled into the renderer.
`FoundingPassArtTypes.sol` holds the shared enums and structs. A card costs at most about 100,000
gas to draw. The same SVG rules as D-030 apply.

### Founder Sneakers (D-042)

A Founder Sneaker is an ordinary Sneaker in `SneakerNft` (same stats, same game rules) that
remembers its pass. One per pass, minted to the pass holder, and it can't be sent.

- **`SneakerNft`** keeps the link both ways: `foundingPassTokenIdOf(sneakerTokenId)` (0 for a
  normal Sneaker) and `founderSneakerTokenIdOf(foundingPassTokenId)` (0 if none yet).
  `mintFounderSneaker(to, attributes, foundingPassTokenId)` (`GAME_ROLE`) refuses a second one
  for a pass (`FounderSneakerAlreadyMinted(foundingPassTokenId)`) and emits
  `FounderSneakerMinted(tokenId, foundingPassTokenId)`. A Founder Sneaker's `transferFrom`,
  `safeTransferFrom` and `approve` revert `FounderSneakerNotTransferable(tokenId)`.
  `moveFounderSneaker(tokenId, newOwner)` (`GAME_ROLE`, Founder Sneakers only, else
  `NotFounderSneaker(tokenId)`) is the recovery's way to move one, and emits
  `FounderSneakerMoved(tokenId, previousOwner, newOwner)`. `tokenURI` adds a `Founding Pass`
  trait for a Founder Sneaker.
- **`SneakerGame`** gets `mintFounderSneaker(foundingPassTokenId)` (`GAME_SERVER_ROLE`, paused
  stops it): starter stats, to whoever holds the pass, and it marks that wallet's starter as
  claimed. `recoverFounderSneaker(foundingPassTokenId)` (`RECOVERY_ROLE`, works while paused)
  moves the Founder Sneaker to whoever holds the pass now, and marks that wallet's starter as
  claimed too. Errors: `NoFounderSneaker(foundingPassTokenId)`,
  `FounderSneakerAlreadyWithPass(foundingPassTokenId)`. A pass that was never minted reverts
  with ERC-721's `ERC721NonexistentToken`.
- **`SneakerArtRenderer`** draws both kinds. `renderImageSvg(tokenId, attributes,
  foundingPassTokenId)`: 0 draws D-030's line art, unchanged. A pass token id draws the Founder
  Sneaker: the same 400 × 400 dark square, with the pass's shoe from `renderSneakerMarkup` (laced
  when the pass is) inside a light rim, its name, `FOUNDER SNEAKER` and the pass number, and the
  level ticks and durability bar. A gold-framed pass turns the corner marks gold.

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
│   ├── SneakerArtRenderer.sol    the on-chain SVG (D-030), Founder Sneakers too (D-042)
│   ├── FoundingPass.sol          the Founding Pass (D-041), and IFoundingPassArtRenderer
│   ├── FoundingPassArtRenderer.sol  the Founding Pass art (D-041)
│   ├── founding-pass-art/        its types, and its generated data and design table
│   └── libraries/
│       └── GameMath.sol          pure functions: energy, reward, costs
├── art/founding-pass/            the pass art system, generator and review sheets (TypeScript)
├── deployments/
│   └── <chainId>.json            chain id, addresses, deployer, game server (both deploy scripts)
├── script/
│   ├── DeployFoundingPass.s.sol  the pass art renderer and FoundingPass, wires their roles
│   ├── DeployGame.s.sol          the Sneaker renderer, NFT, token and game, wires roles
│   ├── RecoverFoundingPass.s.sol the lost-wallet move: a pass and its Founder Sneaker (D-041)
│   ├── RenderPassArt.s.sol       draws the pass art and Founder Sneakers to art/founding-pass/rendered (simulation only)
│   └── UpdateGameConfig.s.sol    (added the first time the config is retuned)
└── test/
    ├── SneakerNft.t.sol
    ├── SneakerArtRenderer.t.sol
    ├── FoundingPassArtRenderer.t.sol  every design renders, states, names, gas, size
    ├── FoundingPass.t.sol        soulbound, one per design and wallet, roles, laced, bitmap, recovery
    ├── SneakerGameFounderSneaker.t.sol  one per pass, not transferable, recovery, the picture
    ├── RecoverFoundingPass.t.sol the script moves both, and skips what's done
    ├── StrideToken.t.sol
    ├── SneakerGame.t.sol         starter mint, settlement, views, config, pause
    ├── SneakerGameRepairUpgrade.t.sol
    ├── GameMath.t.sol            reads packages/shared/.../game-rule-fixtures.json, plus fuzz
    ├── DeployGame.t.sol          role wiring (game and pass); initial config == fixture config
    ├── helpers/                  GameTestBase (deploys via both scripts), fixture reader
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
2. **The Founding Pass first** (once: a game redeploy never touches it), from
   `packages/contracts`: `forge script script/DeployFoundingPass.s.sol --rpc-url monad_testnet
   --broadcast --verify --verifier sourcify --verifier-url https://sourcify-api-monad.blockvision.org/`.
   It deploys `FoundingPassArtRenderer` and `FoundingPass`, grants `MINTER_ROLE` to the game
   server and `RECOVERY_ROLE` to the deployer, and writes their addresses into
   `deployments/<chainId>.json`, keeping the keys already there.
3. **Then the game**, with `FOUNDING_PASS_ADDRESS` set to that `FoundingPass`:
   `forge script script/DeployGame.s.sol --rpc-url monad_testnet --broadcast --verify --verifier sourcify --verifier-url https://sourcify-api-monad.blockvision.org/`.
   The script deploys `SneakerArtRenderer` first (pointed at the pass) and passes it to
   `SneakerNft`, then grants roles: `GAME_ROLE` on the NFT, `MINTER_ROLE`/`BURNER_ROLE` on the
   token, `GAME_SERVER_ROLE` to the API relayer address, and `PAUSER_ROLE` and `RECOVERY_ROLE`
   to the deployer.
4. The script writes `deployments/<chainId>.json`, the pass's two addresses included.
   `bun run chain:export-abis` copies the ABIs and addresses into `packages/chain`.
5. Check the verified source on MonadVision so judges can read it. If
   `--verify` failed, rerun `forge verify-contract <address> <Contract> --chain 10143
   --verifier sourcify --verifier-url https://sourcify-api-monad.blockvision.org/`
   for each contract.
