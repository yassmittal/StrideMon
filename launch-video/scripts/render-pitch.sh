#!/usr/bin/env bash
# The Metropolis pitch video (Pitch16x9). Run from launch-video/ after scripts/pitch-voice.ts:
#
#   bash scripts/render-pitch.sh preview   # out/pitch/preview-lowres.mp4 (960 × 540) + contact sheets
#   bash scripts/render-pitch.sh final     # out/pitch/stridemon-pitch-16x9.mp4 (1920 × 1080)
#
# The final mix is −16 LUFS, −1.5 dBTP (two-pass loudnorm, linear), AAC 48 kHz.
set -euo pipefail

MODE=${1:?usage: bash scripts/render-pitch.sh preview|final}
WORK=out/work/pitch
OUT=out/pitch
MUSIC_SOURCE=../website/media-source/bransboynd-fresh-457883.mp3
MUSIC_START_SECONDS=6.4
mkdir -p "$WORK" "$OUT" public/pitch

# The music bed: "Fresh" by Bransboynd (Pixabay), from the same point as the website's demo,
# levelled to −16 LUFS. PitchFilm plays it low under the voice and fades it out.
if [ ! -f public/pitch/music.wav ]; then
  ffmpeg -nostdin -v error -y -ss "$MUSIC_START_SECONDS" -t 120 -i "$MUSIC_SOURCE" \
    -af "loudnorm=I=-16:TP=-1.5:LRA=11" -ar 48000 -ac 2 public/pitch/music.wav
fi
[ -f public/pitch/reel.mp4 ] || ffmpeg -nostdin -v error -y -i ../website/media-source/submission-reel.mp4 \
  -an -c:v libx264 -preset fast -crf 14 -g 10 -pix_fmt yuv420p -r 30 public/pitch/reel.mp4

if [ "$MODE" = preview ]; then
  bunx remotion render Pitch16x9 "$OUT/preview-lowres.mp4" --scale=0.5 --crf 26
  bash scripts/contact-sheet.sh "$OUT/preview-lowres.mp4" "$OUT/sheets"
  exit 0
fi

bunx remotion render Pitch16x9 "$WORK/picture.mp4" \
  --codec h264 --crf 16 --pixel-format yuv420p --color-space bt709 --muted
bunx remotion render Pitch16x9 "$WORK/mix.wav" --codec wav

LOUDNORM="loudnorm=I=-16:TP=-1.5:LRA=11"
MEASURED=$(ffmpeg -nostdin -i "$WORK/mix.wav" -af "$LOUDNORM:print_format=json" -f null - 2>&1 |
  sed -n '/^{/,/^}/p')
read_value() { echo "$MEASURED" | grep "\"$1\"" | sed -E 's/.*: "([^"]*)".*/\1/'; }
ffmpeg -nostdin -v error -y -i "$WORK/mix.wav" -af "$LOUDNORM:measured_I=$(read_value input_i):measured_TP=$(read_value input_tp):measured_LRA=$(read_value input_lra):measured_thresh=$(read_value input_thresh):offset=$(read_value target_offset):linear=true:print_format=summary,aresample=48000" \
  "$WORK/mix-normalised.wav"

ffmpeg -nostdin -v error -y -i "$WORK/picture.mp4" -i "$WORK/mix-normalised.wav" \
  -map 0:v:0 -map 1:a:0 -c:v copy \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv \
  -c:a aac -b:a 192k -ar 48000 -ac 2 -movflags +faststart -shortest "$OUT/stridemon-pitch-16x9.mp4"

ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate \
  -of compact "$OUT/stridemon-pitch-16x9.mp4"
ffmpeg -nostdin -i "$OUT/stridemon-pitch-16x9.mp4" -af ebur128=peak=true -f null - 2>&1 |
  grep -E '^\s+(I|Peak):' | tail -2
bash scripts/contact-sheet.sh "$OUT/stridemon-pitch-16x9.mp4" "$OUT/sheets-final"
