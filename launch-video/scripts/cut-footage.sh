#!/usr/bin/env bash
# Cuts the film's footage from the raw Android screen recordings in ../website/media-source/
# (gitignored) into constant-60-fps intermediates in public/footage/ (gitignored too).
# Run from launch-video/: `bash scripts/cut-footage.sh`. Needs ffmpeg.
#
# Every in and out point is logged in FOOTAGE.md. The recordings are BT.601 at a variable
# ~24 fps; Remotion must never read them directly. Each intermediate is BT.709, 60 fps, no audio,
# with the status bar and the Expo dev-client gear painted over in the screen's own background.
set -euo pipefail

SOURCE_DIRECTORY=../website/media-source
OUTPUT_DIRECTORY=public/footage

# The recordings are 586 × 1280. Status bar: clock, alarm, SIM, battery (rows 20–41).
STATUS_BAR_HEIGHT_PIXELS=58
# The dev-client gear, top right: 77 px across at x 485–561, y 71–148, plus a margin.
GEAR_BOX="x=480:y=66:w=86:h=88"

RUN_SCREEN_BACKGROUND=0x000000
LIGHT_SCREEN_BACKGROUND=0xEFF0F9

ENCODE=(-an -c:v libx264 -preset slow -crf 10 -pix_fmt yuv420p
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv -movflags +faststart)

# Decode BT.601 to RGB, paint in RGB (so the colours match exactly), then encode as BT.709.
build_frame_filter() {
  local backgroundColor=$1 shouldPaintGear=$2
  local paint="drawbox=x=0:y=0:w=iw:h=${STATUS_BAR_HEIGHT_PIXELS}:color=${backgroundColor}:t=fill"
  if [ "$shouldPaintGear" = yes ]; then
    paint="${paint},drawbox=${GEAR_BOX}:color=${backgroundColor}:t=fill"
  fi
  echo "fps=60,scale=in_color_matrix=bt601:in_range=tv:out_range=pc,format=gbrp,${paint},scale=out_color_matrix=bt709:in_range=pc:out_range=tv,format=yuv420p"
}

# name | source | start (s) | end (s) | background | paint the gear
# app-home-level-02 keeps the gear: it overlaps the card's top edge, and the film crops below it.
SEGMENTS="
walk-run-screen|video2|184.00|250.70|${RUN_SCREEN_BACKGROUND}|yes
stop-tap|video2|252.80|255.00|${RUN_SCREEN_BACKGROUND}|yes
settling|video2|256.52|259.00|${LIGHT_SCREEN_BACKGROUND}|yes
metamask-confirm|video2|397.00|404.00|${RUN_SCREEN_BACKGROUND}|no
app-home-level-02|video2|427.00|429.50|${LIGHT_SCREEN_BACKGROUND}|no
monadvision-level-02|video2|441.00|443.50|${RUN_SCREEN_BACKGROUND}|no
"

mkdir -p "$OUTPUT_DIRECTORY"
while IFS='|' read -r name source startSeconds endSeconds backgroundColor shouldPaintGear; do
  [ -z "$name" ] && continue
  ffmpeg -nostdin -v error -y -ss "$startSeconds" -to "$endSeconds" \
    -i "$SOURCE_DIRECTORY/$source.mp4" \
    -vf "$(build_frame_filter "$backgroundColor" "$shouldPaintGear")" \
    "${ENCODE[@]}" "$OUTPUT_DIRECTORY/$name.mp4"
  echo "$OUTPUT_DIRECTORY/$name.mp4"
done <<<"$SEGMENTS"
