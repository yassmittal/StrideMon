# @stridemon/contracts

The three StrideMon contracts on Monad (Foundry, Solidity 0.8.37, OpenZeppelin 5.7):

| Contract | Is | Holds |
|----------|----|-------|
| `SneakerNft` | ERC-721 + Enumerable, on-chain JSON `tokenURI` | every Sneaker's level, efficiency, durability and energy |
| `SoleToken` | ERC-20 + Permit, 18 decimals (`Sole` / `SOLE`) | rewards |
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

Deployed 2026-09-29 and verified (Sourcify `exact_match`). The source of truth is
`deployments/10143.json`, mirrored into `@stridemon/chain`.

| Contract | Address |
|----------|---------|
| `SneakerNft` | [`0x082072B5831009e289FAdd27266e0b8E5B57BDec`](https://testnet.monadvision.com/address/0x082072B5831009e289FAdd27266e0b8E5B57BDec) |
| `SoleToken` | [`0xEd340b84E676a4De68a86a3B0d45a86fcE202bb3`](https://testnet.monadvision.com/address/0xEd340b84E676a4De68a86a3B0d45a86fcE202bb3) |
| `SneakerGame` | [`0xc4d59c0625C079332f4762ca0Fdc8e9FE439AEa7`](https://testnet.monadvision.com/address/0xc4d59c0625C079332f4762ca0Fdc8e9FE439AEa7) |

Admin and pauser: deployer `0xFCe46e8CAFcf766003897e2aD6ab7a4d0E8befD6`. `GAME_SERVER_ROLE`:
`0xa7a04224FEBE644C7d4d99Cfc8dd694270C7Cf1F`. The deploy cost about 0.77 MON.

## Manual loop

The whole game loop through `cast`: mint → settle → upgrade → settle → repair →
transfer. The deployer plays (it already has MON for gas), the game server settles,
and the Sneaker ends up in a fresh wallet. Run the blocks in order in one shell,
from `packages/contracts`.

Last run on testnet 2026-09-29 against the addresses above, with every number as
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
SOLE_TOKEN=$(jq -r .soleToken $DEPLOYMENT)
SNEAKER_GAME=$(jq -r .sneakerGame $DEPLOYMENT)
PLAYER=$DEPLOYER_ADDRESS
PLAYER_PRIVATE_KEY=$DEPLOYER_PRIVATE_KEY
RECEIVER=$(cast wallet new --json | jq -r '.data[0].address')
SETTLEMENT_SIGNATURE="settleSession((bytes32,uint256,address,uint32,uint32))"

show_sneaker() {
  cast call $SNEAKER_NFT "tokenURI(uint256)(string)" $1 | tr -d '"' \
    | sed 's|^data:application/json;base64,||' | base64 --decode | jq -c .
}
show_sole_balance() {
  cast call $SOLE_TOKEN "balanceOf(address)(uint256)" $1 | cut -d' ' -f1 | xargs cast from-wei
}
```

**2. The game server mints the starter Sneaker**

```bash
cast send $SNEAKER_GAME "mintStarterSneaker(address)" $PLAYER --private-key $GAME_SERVER_PRIVATE_KEY
TOKEN_ID=$(cast call $SNEAKER_NFT "tokenOfOwnerByIndex(address,uint256)(uint256)" $PLAYER 0)
show_sneaker $TOKEN_ID                                  # Level 1, Efficiency 10, Durability 100
cast call $SNEAKER_GAME "currentEnergy(uint256)(uint16)" $TOKEN_ID   # 10
```

**3. Settle a 10-minute activity session: 50 SOLE, 3 durability**

```bash
cast call $SNEAKER_GAME "previewSessionReward(uint256,uint32)(uint256,uint16,uint16)" $TOKEN_ID 10
SESSION_ID=$(cast keccak "manual-loop-$(date +%s)-first")
cast send $SNEAKER_GAME $SETTLEMENT_SIGNATURE "($SESSION_ID,$TOKEN_ID,$PLAYER,10,830)" \
  --private-key $GAME_SERVER_PRIVATE_KEY
show_sole_balance $PLAYER                                # 50.000000000000000000
show_sneaker $TOKEN_ID                                   # Durability 97

# The same session can't be settled twice: reverts SessionAlreadySettled(sessionId)
cast call --from $GAME_SERVER_ADDRESS $SNEAKER_GAME $SETTLEMENT_SIGNATURE \
  "($SESSION_ID,$TOKEN_ID,$PLAYER,10,830)" || echo "replay rejected ✓"
```

**4. Upgrade: burns 50 SOLE, level 2, efficiency 12** (the demo check: compare `show_sneaker` before and after)

```bash
cast call $SNEAKER_GAME "quoteUpgradeCost(uint256)(uint256)" $TOKEN_ID   # 50e18
cast send $SNEAKER_GAME "upgrade(uint256)" $TOKEN_ID --private-key $PLAYER_PRIVATE_KEY
show_sneaker $TOKEN_ID                                   # Level 2, Efficiency 12, Durability 97
show_sole_balance $PLAYER                                # 0.000000000000000000
```

**5. Wait for one energy point (30 minutes), then settle 1 minute: 6 SOLE**

```bash
sleep 1800
cast call $SNEAKER_GAME "currentEnergy(uint256)(uint16)" $TOKEN_ID   # 1
SESSION_ID=$(cast keccak "manual-loop-$(date +%s)-second")
cast send $SNEAKER_GAME $SETTLEMENT_SIGNATURE "($SESSION_ID,$TOKEN_ID,$PLAYER,1,83)" \
  --private-key $GAME_SERVER_PRIVATE_KEY
show_sole_balance $PLAYER                                # 6.000000000000000000
```

**6. Repair: 4 points × 0.8 SOLE = 3.2 SOLE, durability back to 100**

```bash
cast call $SNEAKER_GAME "quoteRepairCost(uint256)(uint256)" $TOKEN_ID    # 3.2e18
cast send $SNEAKER_GAME "repair(uint256)" $TOKEN_ID --private-key $PLAYER_PRIVATE_KEY
show_sneaker $TOKEN_ID                                   # Level 2, Efficiency 12, Durability 100
show_sole_balance $PLAYER                                # 2.800000000000000000
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
