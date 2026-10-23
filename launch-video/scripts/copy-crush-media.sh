#!/usr/bin/env bash
# The Crush film's media (docs/crush-video-prompt.md). Run from launch-video/:
# `bash scripts/copy-crush-media.sh`. Needs ffmpeg, curl and uv.
#
#   1. The reference, ../inspiration.mp4 (untracked), copied to public/crush/reference.mp4: the film
#      plays its frames 0–263 as the hook.
#   2. Its music, untouched, to public/audio/crush-music.wav. Unlicensed (CREDITS.md).
#   3. #0137's laced Sneaker, copied as is from the website's art to public/crush/sneaker-0137.svg.
#      Never edited: DESIGNS_FROZEN_ON.
#   4. The clean plates and camera tracks: scripts/build-crush-plates.py (public/crush/plates/ and
#      src/crush/tracks.ts).
# Read only: nothing in website/ changes. public/crush/ and public/audio/ are gitignored.
set -euo pipefail

REFERENCE_FILE=../inspiration.mp4
SNEAKER_FILE=../website/public/pass-art/laced/0137.svg
OUTPUT_DIRECTORY=public/crush

if [ ! -s "$REFERENCE_FILE" ]; then
  echo "No $REFERENCE_FILE: the Crush film's hook, plates and music can't be made." >&2
  exit 1
fi

mkdir -p "$OUTPUT_DIRECTORY" public/audio
cp "$REFERENCE_FILE" "$OUTPUT_DIRECTORY/reference.mp4"
ffmpeg -nostdin -v error -y -i "$REFERENCE_FILE" -vn -c:a pcm_s16le -ar 48000 -ac 2 \
  public/audio/crush-music.wav
cp "$SNEAKER_FILE" "$OUTPUT_DIRECTORY/sneaker-0137.svg"
uv run --no-project --python 3.11 --with onnxruntime --with opencv-python-headless \
  --with pillow --with numpy python scripts/build-crush-plates.py
echo "Copied the reference, its music and #0137, and built the plates and tracks."
