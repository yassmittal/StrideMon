#!/usr/bin/env bash
# The Dial film's media (docs/dial-video-prompt.md). Run from launch-video/:
# `bash scripts/copy-dial-media.sh`. Needs ffmpeg, curl and uv.
#
#   1. Its music: the reference's own track (../iphone.mp4, untracked), with one loop added so it
#      carries the longer end card, to public/audio/dial-music.wav. Unlicensed (CREDITS.md).
#   2. The ten laced Sneakers (src/dial/content.ts), copied as they are from the website's art to
#      public/dial/sneakers/. Never edited: DESIGNS_FROZEN_ON.
#   3. The clean plates: scripts/build-dial-plates.py (public/dial/plates/).
# Read only: nothing in website/ changes. public/dial/ and public/audio/ are gitignored.
set -euo pipefail

REFERENCE_FILE=../iphone.mp4
SNEAKER_DIRECTORY=../website/public/pass-art/laced
OUTPUT_DIRECTORY=public/dial
DESIGN_NUMBERS=(0049 0137 0868 0429 0289 0498 0224 0542 0184 0020)

# The track repeats every 8 beats (4.904 s at 97.9 BPM, measured by its own self-similarity). It
# plays as it is up to just before its last hit (9.45 s), then 6 more beats taken from one period
# earlier (4.546–8.224 s), then the last hit and its stop (9.45–9.75 s). So the hit lands at
# 13.13 s, on the end card, and the joins fall on the beat. 10 ms crossfades at each join.
MUSIC_FILTER="[0:a]atrim=0:9.45,asetpts=PTS-STARTPTS[intro];\
[1:a]atrim=4.546:8.224,asetpts=PTS-STARTPTS[loop];\
[2:a]atrim=9.45:9.75,asetpts=PTS-STARTPTS[ending];\
[intro][loop]acrossfade=d=0.01:c1=tri:c2=tri[joined];\
[joined][ending]acrossfade=d=0.01:c1=tri:c2=tri[music]"

if [ ! -s "$REFERENCE_FILE" ]; then
  echo "No $REFERENCE_FILE: the Dial film's plates and music can't be made." >&2
  exit 1
fi

mkdir -p "$OUTPUT_DIRECTORY/sneakers" public/audio
# The reference is read three times, once per piece: one input split three ways stalls
# acrossfade, which waits for the whole first piece, and the music comes out short.
ffmpeg -nostdin -v error -y -i "$REFERENCE_FILE" -i "$REFERENCE_FILE" -i "$REFERENCE_FILE" -filter_complex "$MUSIC_FILTER" -map "[music]" \
  -c:a pcm_s16le -ar 48000 -ac 2 public/audio/dial-music.wav
for design_number in "${DESIGN_NUMBERS[@]}"; do
  cp "$SNEAKER_DIRECTORY/$design_number.svg" "$OUTPUT_DIRECTORY/sneakers/$design_number.svg"
done
uv run --no-project --python 3.11 --with onnxruntime --with pillow --with numpy \
  python scripts/build-dial-plates.py
echo "Made the music, copied the ten Sneakers and built the plates."
