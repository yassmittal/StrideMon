# Sourced by the scripts that sign with the deployer key: the demo scripts (D-033) and the
# lost-wallet move (D-042). Loads packages/contracts/.env and the testnet addresses from
# deployments/10143.json, then runs from packages/contracts.

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT/packages/contracts"
set -a && source .env && set +a

DEPLOYMENT=deployments/10143.json
export SNEAKER_GAME_ADDRESS="$(jq -r .sneakerGame "$DEPLOYMENT")"
export SNEAKER_NFT_ADDRESS="$(jq -r .sneakerNft "$DEPLOYMENT")"
export STRIDE_TOKEN_ADDRESS="$(jq -r .strideToken "$DEPLOYMENT")"
export FOUNDING_PASS_ADDRESS="$(jq -r .foundingPass "$DEPLOYMENT")"

# Always Monad testnet, never a local Anvil (D-019). --dry-run simulates without sending.
FORGE_SCRIPT_FLAGS=(--rpc-url monad_testnet --broadcast)
for argument in "$@"; do
  if [[ "$argument" == "--dry-run" ]]; then
    FORGE_SCRIPT_FLAGS=(--rpc-url monad_testnet)
  fi
done
