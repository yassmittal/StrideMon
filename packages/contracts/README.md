# @stridemon/contracts

The three StrideMon contracts on Monad (Foundry, Solidity 0.8.37, OpenZeppelin 5.7):

| Contract | Is | Holds |
|----------|----|-------|
| `SneakerNft` | ERC-721 + Enumerable, on-chain JSON `tokenURI` with an SVG `image` | every Sneaker's level, efficiency, durability and energy |
| `SneakerArtRenderer` | draws the Sneaker's SVG (D-030), swappable by the admin | nothing |
| `StrideToken` | ERC-20 + Permit, 18 decimals (`Stride` / `STRIDE`) | rewards |
| `SneakerGame` | the rules: starter mint, settlement, repair, upgrade | `GAME_ROLE` on the NFT, `MINTER_ROLE` + `BURNER_ROLE` on the token |

Design: [`docs/architecture/smart-contracts.md`](../../docs/architecture/smart-contracts.md).
Formulas and numbers: [`docs/architecture/game-rules.md`](../../docs/architecture/game-rules.md).

## Setup

Needs **Foundry ≥ 1.8** (`foundryup -i v1.8.3`); older versions don't model Monad
execution (D-016). Dependencies come from Soldeer, not git submodules:

```bash
forge soldeer install
```

## Commands

Run from `packages/contracts` (or use the root `bun run contracts:*` scripts):

```bash
forge build
forge test                                            # unit, fuzz and invariant tests
forge coverage --no-match-coverage "(script|test)/"  # src only
forge fmt && forge lint
```

If a test result looks stale after an edit, run `forge clean` first. Foundry 1.8.3's
build cache has been seen to skip a changed file.

`test/GameMath.t.sol` reads `packages/shared/src/game-rules/game-rule-fixtures.json`,
the same vectors the TypeScript mirror tests. `test/DeployGame.t.sol` pins the
deployed initial config to that file's `gameConfig`.

## Deploy (Monad testnet)

Keys live in `.env` (gitignored; see `.env.example`). Fund both addresses from
<https://faucet.monad.xyz>. Monad charges the full gas limit, and the deploy uses
about 7.5M gas, so give the deployer about 1.5 MON.

```bash
set -a && source .env && set +a
forge script script/DeployGame.s.sol --rpc-url monad_testnet --broadcast \
  --verify --verifier sourcify --verifier-url https://sourcify-api-monad.blockvision.org/
cd ../.. && bun run chain:export-abis   # ABIs + addresses → packages/chain
```

The script wires every role and writes `deployments/10143.json`. If verification
didn't finish, verify each contract by hand. Constructor arguments come from the broadcast file:

```bash
forge verify-contract <address> <ContractName> --chain 10143 --watch \
  --verifier sourcify --verifier-url https://sourcify-api-monad.blockvision.org/ \
  --guess-constructor-args --rpc-url monad_testnet
```

### Deployed addresses (chain 10143)

Redeployed 2026-10-03 for Phase 8.3 (the Sneaker image, D-030) and verified (Sourcify
`exact_match`). The source of truth is `deployments/10143.json`, mirrored into `@stridemon/chain`
(the renderer's address stays in the JSON only: nothing off-chain calls it).

| Contract | Address |
|----------|---------|
| `SneakerArtRenderer` | [`0x7e01732461C1879915C35E56e73Fd8569B289ADa`](https://testnet.monadvision.com/address/0x7e01732461C1879915C35E56e73Fd8569B289ADa) |
| `SneakerNft` | [`0xC116917b06BD9079C87334ED5499054b1B54Fa80`](https://testnet.monadvision.com/address/0xC116917b06BD9079C87334ED5499054b1B54Fa80) |
| `StrideToken` | [`0xe52DC9df236a6A4F8653432cE6Fd94Dd41e76CC0`](https://testnet.monadvision.com/address/0xe52DC9df236a6A4F8653432cE6Fd94Dd41e76CC0) |
| `SneakerGame` | [`0x36cf91880F0fb41Eeda9fe79e7C5c2BE953f45B9`](https://testnet.monadvision.com/address/0x36cf91880F0fb41Eeda9fe79e7C5c2BE953f45B9) |

The first deployment (2026-09-29, `SneakerNft` `0x082072B5…`, no image) is abandoned; its
Sneakers stay on-chain but the app no longer reads them.

Admin and pauser: deployer `0xFCe46e8CAFcf766003897e2aD6ab7a4d0E8befD6`. `GAME_SERVER_ROLE`:
`0xa7a04224FEBE644C7d4d99Cfc8dd694270C7Cf1F`. The first deploy cost about 0.77 MON, the 8.3
redeploy (four contracts) about 0.96 MON.

To change the art later, deploy a new renderer and point `SneakerNft` at it (no redeploy, no reset):

```bash
forge create src/SneakerArtRenderer.sol:SneakerArtRenderer --rpc-url monad_testnet \
  --private-key $DEPLOYER_PRIVATE_KEY --broadcast
cast send $SNEAKER_NFT "setArtRenderer(address)" <new renderer> \
  --private-key $DEPLOYER_PRIVATE_KEY --rpc-url monad_testnet
```

## Demo tooling (D-033)

Two Foundry scripts for the live demo, run from the repo root through their wrappers. They sign
with `DEPLOYER_PRIVATE_KEY`, always target `monad_testnet`, and simulate only with `--dry-run`.
The steps around them are in [`docs/demo-script.md`](../../docs/demo-script.md).

| Wrapper | Script | Does |
|---------|--------|------|
| `scripts/prepare-demo-wallets` | `PrepareDemoWallets.s.sol` | Mints wallet A any STRIDE it lacks for its next upgrade plus 10 (granting and revoking `MINTER_ROLE` in the same run), tops A and B up to 1 MON below 0.5, prints both |
| `scripts/demo-energy-config apply\|revert` | `DemoEnergyConfig.s.sol` | Sets `energyRegenerationSeconds` to 60, or back to the launch 30 minutes |

## Manual loop

The whole game loop through `cast`: mint → settle → upgrade → settle → repair →
transfer. The deployer plays (it already has MON for gas), the game server settles,
and the Sneaker ends up in a fresh wallet. Run the blocks in order in one shell,
from `packages/contracts`.

Last run on testnet 2026-09-29 against the first deployment, with every number as
commented below. Transactions: mint `0x13e004cd…`, settle `0xb25f066b…`, upgrade
`0x7e4b320b…`, settle `0x19f2672e…`, repair `0x99fabcfa…`, transfer `0xb5bd2117…`
(Sneaker #1, now owned by `0x7D1F6Cb4449F6BB40804647c94C65381d6f1C0D1`).

**1. Environment and helpers**

```bash
set -a && source .env && set +a
export ETH_RPC_URL=$MONAD_RPC_URL   # cast reads this, so no --rpc-url below
DEPLOYMENT=deployments/10143.json
```

```bash
SNEAKER_NFT=$(jq -r .sneakerNft $DEPLOYMENT)
STRIDE_TOKEN=$(jq -r .strideToken $DEPLOYMENT)
SNEAKER_GAME=$(jq -r .sneakerGame $DEPLOYMENT)
PLAYER=$DEPLOYER_ADDRESS
PLAYER_PRIVATE_KEY=$DEPLOYER_PRIVATE_KEY
RECEIVER=$(cast wallet new --json | jq -r '.data[0].address')
SETTLEMENT_SIGNATURE="settleSession((bytes32,uint256,address,uint32,uint32))"

show_sneaker() {
  cast call $SNEAKER_NFT "tokenURI(uint256)(string)" $1 | tr -d '"' \
    | sed 's|^data:application/json;base64,||' | base64 --decode | jq -c 'del(.image)'
}
show_stride_balance() {
  cast call $STRIDE_TOKEN "balanceOf(address)(uint256)" $1 | cut -d' ' -f1 | xargs cast from-wei
}
```

**2. The game server mints the starter Sneaker**

```bash
cast send $SNEAKER_GAME "mintStarterSneaker(address)" $PLAYER --private-key $GAME_SERVER_PRIVATE_KEY
TOKEN_ID=$(cast call $SNEAKER_NFT "tokenOfOwnerByIndex(address,uint256)(uint256)" $PLAYER 0)
show_sneaker $TOKEN_ID                                  # Level 1, Efficiency 10, Durability 100
cast call $SNEAKER_GAME "currentEnergy(uint256)(uint16)" $TOKEN_ID   # 10
```

**3. Settle a 10-minute activity session: 50 STRIDE, 3 durability**

```bash
cast call $SNEAKER_GAME "previewSessionReward(uint256,uint32)(uint256,uint16,uint16)" $TOKEN_ID 10
SESSION_ID=$(cast keccak "manual-loop-$(date +%s)-first")
cast send $SNEAKER_GAME $SETTLEMENT_SIGNATURE "($SESSION_ID,$TOKEN_ID,$PLAYER,10,830)" \
  --private-key $GAME_SERVER_PRIVATE_KEY
show_stride_balance $PLAYER                                # 50.000000000000000000
show_sneaker $TOKEN_ID                                   # Durability 97

# The same session can't be settled twice: reverts SessionAlreadySettled(sessionId)
cast call --from $GAME_SERVER_ADDRESS $SNEAKER_GAME $SETTLEMENT_SIGNATURE \
  "($SESSION_ID,$TOKEN_ID,$PLAYER,10,830)" || echo "replay rejected ✓"
```

**4. Upgrade: burns 50 STRIDE, level 2, efficiency 12** (the demo check: compare `show_sneaker` before and after)

```bash
cast call $SNEAKER_GAME "quoteUpgradeCost(uint256)(uint256)" $TOKEN_ID   # 50e18
cast send $SNEAKER_GAME "upgrade(uint256)" $TOKEN_ID --private-key $PLAYER_PRIVATE_KEY
show_sneaker $TOKEN_ID                                   # Level 2, Efficiency 12, Durability 97
show_stride_balance $PLAYER                                # 0.000000000000000000
```

**5. Wait for one energy point (30 minutes), then settle 1 minute: 6 STRIDE**

```bash
sleep 1800
cast call $SNEAKER_GAME "currentEnergy(uint256)(uint16)" $TOKEN_ID   # 1
SESSION_ID=$(cast keccak "manual-loop-$(date +%s)-second")
cast send $SNEAKER_GAME $SETTLEMENT_SIGNATURE "($SESSION_ID,$TOKEN_ID,$PLAYER,1,83)" \
  --private-key $GAME_SERVER_PRIVATE_KEY
show_stride_balance $PLAYER                                # 6.000000000000000000
```

**6. Repair: 4 points × 0.8 STRIDE = 3.2 STRIDE, durability back to 100**

```bash
cast call $SNEAKER_GAME "quoteRepairCost(uint256)(uint256)" $TOKEN_ID    # 3.2e18
cast send $SNEAKER_GAME "repair(uint256)" $TOKEN_ID --private-key $PLAYER_PRIVATE_KEY
show_sneaker $TOKEN_ID                                   # Level 2, Efficiency 12, Durability 100
show_stride_balance $PLAYER                                # 2.800000000000000000
```

**7. Transfer: the stats travel with the Sneaker, and the old owner can't settle**

```bash
cast send $SNEAKER_NFT "transferFrom(address,address,uint256)" $PLAYER $RECEIVER $TOKEN_ID \
  --private-key $PLAYER_PRIVATE_KEY
cast call $SNEAKER_NFT "ownerOf(uint256)(address)" $TOKEN_ID      # $RECEIVER
show_sneaker $TOKEN_ID                                   # unchanged: Level 2, Efficiency 12

# A session the old owner ran now reverts NotSneakerOwner(tokenId, player)
cast call --from $GAME_SERVER_ADDRESS $SNEAKER_GAME $SETTLEMENT_SIGNATURE \
  "($(cast keccak manual-loop-after-transfer),$TOKEN_ID,$PLAYER,5,415)" || echo "old owner rejected ✓"
```
