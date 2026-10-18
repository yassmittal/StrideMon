#!/usr/bin/env bash
# Cuts the App tour film's footage from the submission reel (../website/media-source/, gitignored)
# into constant-60-fps intermediates in public/footage/app-tour/ (gitignored too).
# Run from launch-video/: `bash scripts/cut-app-tour-footage.sh`. Needs ffmpeg.
#
# Every shot is logged in FOOTAGE.md ("The App tour film"), with its privacy pass. The reel is
# 720 × 1560, 30 fps, BT.709, already cropped to the app (no status bar, no dev gear), so nothing is
# painted over: each shot is only re-timed to 60 fps (frames repeated, never blended) and encoded
# near-losslessly, so Remotion never seeks in the long-GOP reel. src/app-tour/footage.ts mirrors
# this list.
set -euo pipefail

SOURCE_FILE=../website/media-source/submission-reel.mp4
OUTPUT_DIRECTORY=public/footage/app-tour

ENCODE=(-an -c:v libx264 -preset slow -crf 10 -pix_fmt yuv420p
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv -movflags +faststart)

# name | start (s) | end (s), in the reel. Each starts on a reel frame (a multiple of 1/30 s).
# The repair's "Confirming on Monad…" (40.37–40.57 s) isn't cut: it still shows the app switch, so
# the film rebuilds it.
SHOTS="
minting|6.500|9.467
home|10.100|11.200
home-scroll|14.100|15.600
run|16.500|25.100
stop-press|25.600|26.400
stop-spinner|27.400|28.367
settling|28.400|30.967
summary|31.000|34.500
sneaker-tab|34.700|36.467
repair-review|36.500|37.500
repair-done|40.600|42.600
"

mkdir -p "$OUTPUT_DIRECTORY"
while IFS='|' read -r name startSeconds endSeconds; do
  [ -z "$name" ] && continue
  # -ss after -i decodes from the start, so the first frame is exactly the requested one.
  ffmpeg -nostdin -v error -y -i "$SOURCE_FILE" -ss "$startSeconds" -to "$endSeconds" \
    -vf "fps=60:round=down,setpts=PTS-STARTPTS" "${ENCODE[@]}" "$OUTPUT_DIRECTORY/$name.mp4"
  echo "$OUTPUT_DIRECTORY/$name.mp4"
done <<<"$SHOTS"
