#!/usr/bin/env bash
# The Showroom film's media (docs/showroom-video-prompt.md). Run from launch-video/:
# `bash scripts/copy-showroom-media.sh`. Needs ffmpeg, rsvg-convert (brew install librsvg) and bun.
#
#   1. The reference, ../hyperSpeedCameraman.mp4 (untracked), copied to public/showroom/reference.mp4:
#      the film plays its frames 0–86 as the hook.
#   2. Its music, untouched, to public/audio/showroom-music.wav. Unlicensed (CREDITS.md).
#   3. The film's Sneakers (src/showroom/sneakers.ts), rasterised from the laced art at
#      SNEAKER_WIDTH into public/showroom/sneakers/NNNN.png. Never edited: DESIGNS_FROZEN_ON.
# Read only: nothing in website/ changes. public/showroom/ and public/audio/ are gitignored.
set -euo pipefail

REFERENCE_FILE=../hyperSpeedCameraman.mp4
LACED_SOURCE_DIRECTORY=../website/public/pass-art/laced
OUTPUT_DIRECTORY=public/showroom
SNEAKER_WIDTH=1000

if [ ! -s "$REFERENCE_FILE" ]; then
  echo "No $REFERENCE_FILE: the Showroom film's hook and music can't be made." >&2
  exit 1
fi

mkdir -p "$OUTPUT_DIRECTORY/sneakers" public/audio
cp "$REFERENCE_FILE" "$OUTPUT_DIRECTORY/reference.mp4"
ffmpeg -nostdin -v error -y -i "$REFERENCE_FILE" -vn -c:a pcm_s16le -ar 48000 -ac 2 \
  public/audio/showroom-music.wav

DESIGN_NUMBERS=$(bun --eval "
  const { SHOWROOM_DESIGN_NUMBERS } = await import('./src/showroom/sneakers.ts')
  console.log(SHOWROOM_DESIGN_NUMBERS.map((designNumber) => String(designNumber).padStart(4, '0')).join(' '))
")
for DESIGN_NUMBER in $DESIGN_NUMBERS; do
  rsvg-convert -w "$SNEAKER_WIDTH" "$LACED_SOURCE_DIRECTORY/$DESIGN_NUMBER.svg" \
    -o "$OUTPUT_DIRECTORY/sneakers/$DESIGN_NUMBER.png"
done
echo "Copied the reference, its music and $(echo "$DESIGN_NUMBERS" | wc -w | tr -d ' ') Sneakers."
