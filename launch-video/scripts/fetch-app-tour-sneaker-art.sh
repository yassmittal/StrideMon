#!/usr/bin/env bash
# Reads Sneaker #3's pictures for the App tour film from the live SneakerArtRenderer with read-only
# eth_calls (`cast call`, no transaction) and saves them in public/sneaker/ with the existing naming.
# Run from launch-video/: `bash scripts/fetch-app-tour-sneaker-art.sh`. Needs Foundry's cast.
#
# #3 is the submission reel's starter Sneaker (FACTS.md §15). renderImageSvg is a pure function of
# the token id and the attributes passed in, so it draws the reel's #3 at any level and durability.
# The 8.3 renderer drew the same picture (FACTS.md §8: its #2 files differ only in the id), and
# the level-1 picture matches the reel's card at 10.5 s within 2 px.
set -euo pipefail

RPC_URL=https://testnet-rpc.monad.xyz
# packages/contracts/deployments/10143.json, sneakerArtRenderer (D-042).
RENDERER_ADDRESS=$(jq -r .sneakerArtRenderer ../packages/contracts/deployments/10143.json)
OUTPUT_DIRECTORY=public/sneaker
TOKEN_ID=3
# Stored energy 10 and updated-at 0: the picture doesn't draw energy. Pass 0 = not a Founder Sneaker.
STORED_ENERGY=10

# level | efficiency | durability. Level 1 at 100 is the new starter (Home); level 1 at 99 is after
# the run, before the repair; level 2 at 100 is after the upgrade.
STATES="
1|10|100
1|10|99
2|12|100
"

mkdir -p "$OUTPUT_DIRECTORY"
while IFS='|' read -r level efficiency durability; do
  [ -z "$level" ] && continue
  fileName=$(printf 'sneaker-%04d-level-%02d-durability-%03d.svg' "$TOKEN_ID" "$level" "$durability")
  cast call "$RENDERER_ADDRESS" \
    "renderImageSvg(uint256,(uint16,uint16,uint16,uint16,uint64),uint256)(string)" \
    "$TOKEN_ID" "($level,$efficiency,$durability,$STORED_ENERGY,0)" 0 --rpc-url "$RPC_URL" |
    # cast prints the string quoted, with its inner quotes escaped.
    sed -e 's/^"//' -e 's/"$//' -e 's/\\"/"/g' |
    # One line with no trailing newline, like the #2 files.
    tr -d '\n' >"$OUTPUT_DIRECTORY/$fileName"
  echo "$OUTPUT_DIRECTORY/$fileName"
done <<<"$STATES"
