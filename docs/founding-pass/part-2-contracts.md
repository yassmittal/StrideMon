# Part 2: Contracts

**Goal:** `FoundingPass` is live on Monad testnet, and the game contracts are redeployed so a
pass holder can get a Founder Sneaker: linked to the pass, drawn in its design, and impossible to
send.

## Read first

- The brief §7 and §10.1, D-041
- `docs/architecture/smart-contracts.md`, `docs/architecture/game-rules.md`
- `packages/contracts/README.md` (deploy, verify, `chain:export-abis`), and `CLAUDE.md`'s
  contract notes: never broadcast `DeployGame.s.sol` to a local Anvil (it shares chain id 10143
  with the testnet and would overwrite `deployments/10143.json`)

## Build

1. **`FoundingPass`**, as in brief §10.1: ERC-721, soulbound (ERC-5192) and AccessControl, with:
   - the token id equal to the design number
   - `mint` by `MINTER_ROLE`, which records the founder number and rolls the gold frame (on-chain
     randomness is fine for something cosmetic)
   - `setLaced`, `passOf` and `mintedBitmap`
   - one pass per wallet
   - `tokenURI` and `imageSvg` through the Part 1b renderer
   - the lost-wallet move, if Part 0 said yes
2. **Founder Sneakers in the game.** Redeploying is fine, since there are no users.
   - `SneakerNft` remembers which pass each Founder Sneaker belongs to (none for a normal
     Sneaker).
   - Founder Sneakers can't be transferred: the transfer reverts with a clear custom error.
     Normal Sneakers transfer as today (Phase 7).
   - `SneakerGame` mints **one Founder Sneaker per pass**, to the pass holder. The starter rule
     for everyone else stays as it is.
   - **The Founder Sneaker's art:** a new Sneaker renderer draws a Founder Sneaker in its pass's
     design, laced when the pass is, with its level and durability. Normal Sneakers keep
     today's line art. The app shows the art on a dark hero panel, so design it for that (check
     `SneakerCard`). Render preview PNGs and get Yash's ok on the look before deploying.
3. **Deploy**, after asking Yash:
   - `DeployFoundingPass.s.sol`, and the game redeploy with every role wired
   - verify everything on MonadVision (Sourcify)
   - run `bun run chain:export-abis` and update the addresses in `packages/contracts/README.md`
   - reset the local test database if the game contracts changed (as D-038 did; keep the
     waitlist)
   - a test mint from the deployer: one pass and its Founder Sneaker. Check both images on
     MonadVision.

## Tests

- Pass transfers and approvals revert. Each design mints once, and each wallet holds one pass.
- Roles, `setLaced` only once, and `mintedBitmap`.
- One Founder Sneaker per pass. Founder Sneakers can't be transferred, and normal ones still can.
- The Founder Sneaker image follows its pass, laced included.
- Fuzz the design number. Keep the existing game tests and invariants passing.

## Done when

`forge test` passes. Both contracts and the redeployed game are verified on MonadVision. The test
pass and its Founder Sneaker show the right images there. The ABIs and addresses are exported.
Mark Part 2 **Done**, then stop.
