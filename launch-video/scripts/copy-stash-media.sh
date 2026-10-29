#!/usr/bin/env bash
# The Stash film's media (docs/stash-video-prompt.md). Run from launch-video/:
# `bash scripts/copy-stash-media.sh`. Needs ffmpeg, curl and uv.
#
#   1. Its music, the reference's own (../nailpaints.mp4, untracked), untouched, to
#      public/audio/stash-music.wav. Unlicensed (CREDITS.md).
#   2. The six Sneakers' laced art (src/stash/content.ts), copied as is from the website's art to
#      public/stash/. Never edited: DESIGNS_FROZEN_ON.
#   3. The cleaned reference and the case track: scripts/build-stash-plates.py
#      (public/stash/reference.mp4 and src/stash/tracks.ts). About ten minutes on the CPU.
# Read only: nothing in website/ changes. public/stash/ and public/audio/ are gitignored.
set -euo pipefail

REFERENCE_FILE=../nailpaints.mp4
OUTPUT_DIRECTORY=public/stash
DESIGN_NUMBERS=(137 220 110 363 82 713)

if [ ! -s "$REFERENCE_FILE" ]; then
  echo "No $REFERENCE_FILE: the Stash film's hook, case and music can't be made." >&2
  exit 1
fi

mkdir -p "$OUTPUT_DIRECTORY" public/audio
ffmpeg -nostdin -v error -y -i "$REFERENCE_FILE" -vn -c:a pcm_s16le -ar 48000 -ac 2 \
  public/audio/stash-music.wav
for design_number in "${DESIGN_NUMBERS[@]}"; do
  padded_number=$(printf '%04d' "$design_number")
  cp "../website/public/pass-art/laced/$padded_number.svg" "$OUTPUT_DIRECTORY/sneaker-$padded_number.svg"
done
uv run --no-project --python 3.11 --with onnxruntime --with opencv-python-headless \
  --with pillow --with numpy python scripts/build-stash-plates.py
# The generated track, in the repo's own format (biome.json at the root).
(cd .. && bunx biome format --write launch-video/src/stash/tracks.ts >/dev/null)
echo "Copied the music and the six Sneakers, and built the cleaned reference and the case track."
