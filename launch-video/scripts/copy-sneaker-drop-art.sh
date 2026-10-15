#!/usr/bin/env bash
# The Sneaker drop film's art, into public/pass-art/ (gitignored). Run from launch-video/:
# `bash scripts/copy-sneaker-drop-art.sh`. Needs rsvg-convert (brew install librsvg) and ffmpeg.
#
#   1. The 1,000 laced Sneakers, the contract renderer's own output
#      (../website/public/pass-art/laced/, FoundingPassArtRenderer.renderSneakerMarkup). The film's
#      single shoes and splits draw these as vectors.
#   2. #0020 Earthshine's Founder Sneaker picture as minted (level 1, durability 100), cut out of
#      the committed sheet ../packages/contracts/art/founding-pass/previews/8-founder-sneakers.svg,
#      where SneakerArtRenderer drew it (D-042). Byte for byte, only its outer width and height
#      dropped so it scales.
#   3. The flood's sprite atlas: every laced Sneaker rasterised once at TILE_WIDTH × TILE_HEIGHT,
#      tiled 40 across in design order (design n at index n − 1), so the flood's 1,000 shoes are
#      one image rather than 1,000 live SVGs. It also feeds scripts/pick-sneaker-drop-designs.ts.
# Read only: nothing in website/ or packages/ changes. Never edit the copies: DESIGNS_FROZEN_ON.
set -euo pipefail

LACED_SOURCE_DIRECTORY=../website/public/pass-art/laced
FOUNDER_SNEAKER_SHEET=../packages/contracts/art/founding-pass/previews/8-founder-sneakers.svg
OUTPUT_DIRECTORY=public/pass-art
TILE_WIDTH=160
TILE_HEIGHT=96
ATLAS_COLUMN_COUNT=40
DESIGN_COUNT=1000

mkdir -p "$OUTPUT_DIRECTORY/laced" "$OUTPUT_DIRECTORY/founder-sneakers" "$OUTPUT_DIRECTORY/atlas"
cp "$LACED_SOURCE_DIRECTORY"/*.svg "$OUTPUT_DIRECTORY/laced/"

# The sheet nests each picture as its own <svg>…</svg>; the first one headed #0020 is the minted one.
bun --eval "
  const sheet = await Bun.file('$FOUNDER_SNEAKER_SHEET').text()
  const pictures = sheet.split('<svg width=').slice(1).map((part) => '<svg width=' + part.split('</svg>')[0] + '</svg>')
  const minted = pictures.find((picture) => picture.includes('>#0020<') && picture.includes('LEVEL'))
  if (minted === undefined) throw new Error('No #0020 picture in the sheet')
  if (!minted.includes('>01 / 30<') || !minted.includes('>100 / 100<')) throw new Error('The first #0020 picture is not the minted one')
  await Bun.write('$OUTPUT_DIRECTORY/founder-sneakers/founder-sneaker-0020-minted.svg',
    minted.replace(/^<svg width=\"1000\" height=\"1000\" /, '<svg '))
"

TILE_DIRECTORY=$OUTPUT_DIRECTORY/atlas/tiles
mkdir -p "$TILE_DIRECTORY"
seq 1 "$DESIGN_COUNT" | xargs -P 8 -I{} sh -c '
  number=$(printf "%04d" {})
  rsvg-convert -w '"$TILE_WIDTH"' -h '"$TILE_HEIGHT"' -b none "'"$OUTPUT_DIRECTORY"'/laced/$number.svg" -o "'"$TILE_DIRECTORY"'/$number.png"'
ffmpeg -nostdin -v error -y -framerate 1 -start_number 1 -i "$TILE_DIRECTORY/%04d.png" \
  -vf "tile=${ATLAS_COLUMN_COUNT}x$((DESIGN_COUNT / ATLAS_COLUMN_COUNT))" -frames:v 1 \
  -pix_fmt rgba "$OUTPUT_DIRECTORY/atlas/laced-atlas.png"
rm -r "$TILE_DIRECTORY"

ls "$OUTPUT_DIRECTORY/laced" | wc -l | xargs echo "laced Sneakers:"
ls -1 "$OUTPUT_DIRECTORY/founder-sneakers" "$OUTPUT_DIRECTORY/atlas"
