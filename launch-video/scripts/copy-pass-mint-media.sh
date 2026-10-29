#!/usr/bin/env bash
# The Pass mint film's media. Run from launch-video/: `bash scripts/copy-pass-mint-media.sh`.
# Needs ffmpeg and uv.
#
#   1. The desktop recording, ../desktopFounderPassMint.mp4 (untracked: Yash's screen recording of
#      minting #0039 on the local stack, 1920 × 1080, 60 fps, silent), re-encoded to
#      public/pass-mint/recording.mp4 with a keyframe every 6 frames, because the film remaps its
#      time (speed ramps and a rewind) and seeks to a new frame on every film frame.
#   2. #0039's gallery card, copied as is from the website's art (never edited: DESIGNS_FROZEN_ON).
#   3. The redaction boxes (the email and the autofill list): scripts/track-pass-mint-redactions.py
#      writes src/pass-mint/redactions.ts.
# The music is levelled by scripts/fetch-audio.sh (pass-mint-music.wav).
# Read only: nothing in website/ changes. public/pass-mint/ is gitignored.
set -euo pipefail

RECORDING_FILE=../desktopFounderPassMint.mp4
CARD_FILE=../website/public/pass-art/cards/0039.svg
OUTPUT_DIRECTORY=public/pass-mint

if [ ! -s "$RECORDING_FILE" ]; then
  echo "No $RECORDING_FILE: the Pass mint film's footage can't be made." >&2
  exit 1
fi

mkdir -p "$OUTPUT_DIRECTORY"
ffmpeg -nostdin -v error -y -i "$RECORDING_FILE" -an \
  -c:v libx264 -preset slow -crf 14 -g 6 -keyint_min 6 -sc_threshold 0 -pix_fmt yuv420p \
  -movflags +faststart "$OUTPUT_DIRECTORY/recording.mp4"
cp "$CARD_FILE" "$OUTPUT_DIRECTORY/card-0039.svg"
uv run --no-project --with opencv-python-headless==4.12.0.88 --with numpy \
  python scripts/track-pass-mint-redactions.py "$RECORDING_FILE"
echo "Copied the recording and #0039's card, and tracked the redactions."
