#!/usr/bin/env bash
# Copies the Founding Pass art the waitlist film shows into public/pass-art/ (gitignored).
# Run from launch-video/: `bash scripts/copy-pass-art.sh`. Needs bun.
#
# The cards are the gallery's own SVGs (../website/public/pass-art/cards/, drawn by
# FoundingPassArtRenderer); the Founder Sneaker pictures are SneakerArtRenderer's previews
# (../packages/contracts/art/founding-pass/previews/). Which ones: src/waitlist/pass-art.ts.
# Read only: nothing in website/ or packages/ changes.
set -euo pipefail

CARD_SOURCE_DIRECTORY=../website/public/pass-art/cards
FOUNDER_SNEAKER_SOURCE_DIRECTORY=../packages/contracts/art/founding-pass/previews
OUTPUT_DIRECTORY=public/pass-art

mkdir -p "$OUTPUT_DIRECTORY/cards" "$OUTPUT_DIRECTORY/founder-sneakers"

# remotion's staticFile needs a Remotion context, so read the plain lists through a stub.
read_list() {
  bun --eval "
    const source = await Bun.file('src/waitlist/pass-art.ts').text()
    const pick = (name) => source.match(new RegExp(name + '[^=]*= (\\\\[[^\\\\]]*\\\\]|\\\\{[^}]*\\\\}|\\\\d+)'))[1]
    const numbers = [...new Set([...JSON.parse(pick('GRID_DESIGN_NUMBERS').replace(/,\\s*\\]/, ']')),
      Number(pick('HERO_DESIGN_NUMBER')), Number(pick('LEGENDARY_DESIGN_NUMBER'))])]
    if ('$1' === 'cards') console.log(numbers.map((n) => String(n).padStart(4, '0')).join('\n'))
    else console.log([...pick('founderSneakerFileNames').matchAll(/'([^']+\\.svg)'/g)].map((m) => m[1]).join('\n'))
  "
}

for designNumber in $(read_list cards); do
  cp "$CARD_SOURCE_DIRECTORY/$designNumber.svg" "$OUTPUT_DIRECTORY/cards/"
done
for fileName in $(read_list founder-sneakers); do
  cp "$FOUNDER_SNEAKER_SOURCE_DIRECTORY/$fileName" "$OUTPUT_DIRECTORY/founder-sneakers/"
done

ls "$OUTPUT_DIRECTORY/cards" | wc -l | xargs echo "cards:"
ls -1 "$OUTPUT_DIRECTORY/founder-sneakers"
