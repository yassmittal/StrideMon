#!/usr/bin/env bash
# The Rain film's media (docs/rain-video-prompt.md). Run from launch-video/:
# `bash scripts/copy-rain-media.sh`. Needs ffmpeg, curl, uv and macOS's Arial.
#
#   1. The reference, ../keywordType.mp4 (untracked), copied to public/rain/reference.mp4: the film
#      plays its frames 0-218 (the rain hook and the start of the typing) as they are.
#   2. Its music, untouched, to public/audio/rain-music.wav. Unlicensed (CREDITS.md).
#   3. The five Sneakers that stand where the car stood, copied as they are from the website's
#      laced art to public/rain/sneakers/. Never edited: DESIGNS_FROZEN_ON.
#   4. The typing plates, the car plates and every track: scripts/build-rain-plates.py
#      (public/rain/plates/ and src/rain/tracks.ts).
# Read only: nothing in website/ changes. public/rain/ and public/audio/ are gitignored.
set -euo pipefail

REFERENCE_FILE=../keywordType.mp4
SNEAKER_DIRECTORY=../website/public/pass-art/laced
OUTPUT_DIRECTORY=public/rain
# Keep in step with rainShots in src/rain/content.ts.
DESIGN_NUMBERS=(0500 0159 0185 0279 0678)

if [ ! -s "$REFERENCE_FILE" ]; then
  echo "No $REFERENCE_FILE: the Rain film's hook, plates and music can't be made." >&2
  exit 1
fi

mkdir -p "$OUTPUT_DIRECTORY/sneakers" public/audio
cp "$REFERENCE_FILE" "$OUTPUT_DIRECTORY/reference.mp4"
ffmpeg -nostdin -v error -y -i "$REFERENCE_FILE" -vn -c:a pcm_s16le -ar 48000 -ac 2 \
  public/audio/rain-music.wav
for design_number in "${DESIGN_NUMBERS[@]}"; do
  cp "$SNEAKER_DIRECTORY/$design_number.svg" "$OUTPUT_DIRECTORY/sneakers/$design_number.svg"
done
uv run --no-project --python 3.11 --with onnxruntime --with opencv-python-headless \
  --with pillow --with numpy python scripts/build-rain-plates.py
echo "Copied the reference, its music and the Sneakers, and built the plates and tracks."
