#!/usr/bin/env bash
# Contact sheets of a render: one frame every 0.5 s, 30 tiles (15 s) per sheet, each tile
# stamped with its time. Run from launch-video/: `bash scripts/contact-sheet.sh <video> <out dir>`.
set -euo pipefail

VIDEO_FILE=${1:?usage: bash scripts/contact-sheet.sh <video> <out dir>}
OUTPUT_DIRECTORY=${2:?usage: bash scripts/contact-sheet.sh <video> <out dir>}
FRAMES_PER_TILE=30
SHEET_SECONDS=15
TILE_WIDTH_PIXELS=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "$VIDEO_FILE" |
  awk -F, '{ print ($1 > $2) ? 320 : ($1 * 5 == $2 * 4 ? 216 : 180) }')
FONT_FILE=/System/Library/Fonts/Menlo.ttc

mkdir -p "$OUTPUT_DIRECTORY"
for startSeconds in 0 15 30; do
  endSeconds=$((startSeconds + SHEET_SECONDS))
  ffmpeg -nostdin -v error -y -ss "$startSeconds" -t "$SHEET_SECONDS" -i "$VIDEO_FILE" \
    -vf "select='not(mod(n\,$FRAMES_PER_TILE))',scale=$TILE_WIDTH_PIXELS:-2,drawtext=fontfile=$FONT_FILE:text='%{eif\:t+$startSeconds\:d}.%{eif\:mod(t*10\,10)\:d}s':x=w-tw-6:y=h-th-6:fontsize=16:fontcolor=white:box=1:boxcolor=0x00000099:boxborderw=3,tile=6x5" \
    -frames:v 1 -fps_mode passthrough \
    "$OUTPUT_DIRECTORY/contact-$(printf '%02d' "$startSeconds")-$(printf '%02d' "$endSeconds").png"
done
ls -1 "$OUTPUT_DIRECTORY"/contact-*.png
