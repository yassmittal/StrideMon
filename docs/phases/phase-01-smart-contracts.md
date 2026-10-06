# Phase 1 — Smart Contracts

**Goal:** all three contracts written, fully tested, deployed and verified on
Monad testnet. The whole game loop (mint → settle → repair → upgrade → transfer)
works through `cast`, before a single screen exists.

**Why this comes before any app work:** everything about the Sneaker is on-chain
(D-005), so the contracts *are* the game. The app and the API are clients of them.

**Read first:** `architecture/smart-contracts.md`, `architecture/game-rules.md`, `architecture/security.md` → Smart contracts.

**Confirm before writing code:** which EVM version Monad testnet supports
(`foundry.toml` pins `cancun`, see D-015; raise it only if Monad documents
support), and which explorer and verification method Monad testnet uses (viem's
chain definition points at `testnet.monadexplorer.com`).

> Confirmed 2026-09-29, recorded in D-016: `cancun` stays. Monad needs Foundry ≥ 1.8
> with `network = "monad"`. The explorer is MonadVision (the old
> `testnet.monadexplorer.com` redirects there), and verification goes through
> Sourcify with no API key.

## Deliverables

### `packages/contracts`
- `libraries/GameMath.sol`: pure functions for current energy, rewarded minutes, reward, durability loss, repair cost and upgrade cost.
- `SneakerNft.sol`: ERC-721, `SneakerAttributes` storage, `GAME_ROLE`-gated `mint` and `setAttributes`, and an on-chain JSON `tokenURI` (text attributes only; art comes in Phase 8).
- `StrideToken.sol`: ERC-20 + Permit, with `MINTER_ROLE`/`BURNER_ROLE`, and name `Stride` and symbol `STRIDE` passed as constructor args (18 decimals).
- `SneakerGame.sol`: every function in the contracts doc, `GameConfig`, roles, `Pausable`, `ReentrancyGuard` and custom errors.
- `script/DeployGame.s.sol`: deploys, wires all roles, grants `GAME_SERVER_ROLE` to the relayer address from env, and writes `deployments/<chainId>.json`.
- Tests:
  - every function's happy path and every custom error
  - `GameMath.t.sol` reads the shared `game-rule-fixtures.json`
  - fuzz tests on energy regeneration and reward bounds
  - invariants: burns only from `msg.sender`, and reward supply = minted − burned
  - settlement can't be replayed; a transfer mid-session makes settlement revert

### `packages/shared`
- `game-rules/game-rule-fixtures.json` with the MVP examples from `game-rules.md`, plus edge cases (zero energy, max level, durability floor).
- `game-rules/*.ts`: the TypeScript mirror, with tests that pass the same fixtures.

### `packages/chain`
- `scripts/export-abis` (root script `chain:export-abis`): copies ABIs from Foundry `out/` into `src/abis/*.ts` as `as const`, and addresses from `deployments/` into `contract-addresses.ts`.

### Ops
- A deployer key and a game-server key, both funded from the testnet faucet.
- Deploy and verify on the explorer. Record the addresses in `packages/chain`.

## Out of scope
Marketplace contract (Phase 9), SVG art (Phase 8), upgradeable proxies (not planned; the contracts are split instead).

## Definition of done
- [x] `forge test` passes, and `forge coverage` shows all branches of `SneakerGame` and `GameMath` covered.
- [x] The shared fixtures pass in both Solidity and TypeScript.
- [x] The contracts are verified and readable on the Monad testnet explorer.
- [x] A scripted `cast` walkthrough (saved as `packages/contracts/README.md` → "Manual loop") mints, settles, repairs, upgrades and transfers on testnet.
- [x] `@stridemon/chain` exports typed ABIs and addresses, and a typo in a function name fails `tsc`.

## Demo check
Open the explorer and show a Sneaker's `tokenURI` attributes before and after an upgrade.

> Done 2026-09-29: deployed and verified on Monad testnet (addresses in
> `packages/contracts/README.md` and `@stridemon/chain`). The Manual loop ran on testnet,
> and Sneaker #1's `tokenURI` went from Level 1 / Efficiency 10 to Level 2 / Efficiency 12.
