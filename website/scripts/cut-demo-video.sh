#!/usr/bin/env bash
# Cuts the raw Android screen recordings in media-source/ (gitignored) into the landing page's
# demo video, its poster, and the How it works walk loop, all in public/videos/.
# Run from website/: `bash scripts/cut-demo-video.sh`. Needs ffmpeg, ffprobe, bc and cwebp.
#
# Sources (2026-10-05): video2.mp4 is sign-in → walk → reward → repair → upgrade (wallet A),
# video1.mp4 is the transfer to wallet B. Both 586 × 1280, ~24 fps variable, silent.
set -euo pipefail

SOURCE_DIRECTORY=media-source
OUTPUT_DIRECTORY=public/videos
WORK_DIRECTORY=$(mktemp -d)
trap 'rm -rf "$WORK_DIRECTORY"' EXIT

DEMO_CRF=23
LOOP_CRF=22
FADE_SECONDS=0.2
WEB_ENCODE=(-an -c:v libx264 -profile:v high -preset slow -pix_fmt yuv420p -r 30 -movflags +faststart)

# The demo crops the status bar (top 48 px: clock, battery) and scales to 540 × 1136, 30 fps.
DEMO_FRAME_FILTER="crop=586:1232:0:48,scale=540:-2:flags=lanczos,fps=30,format=yuv420p"

# chapter | source | start (s) | end (s) | speed | hold the last frame (s, optional)
# Cut around: notifications, the notification shade, the app switcher and home screen, MetaMask's
# account settings, the Expo dev menu, a failed and a cancelled transfer, and the gear button lit
# blue after the dev menu (video2 to 144.1 s and 189.9 s).
DEMO_SEGMENTS="
1|video2|5.5|7.5|1
1|video2|7.5|10.5|1
1|video2|15.0|17.0|1
1|video2|20.5|22.5|1
1|video2|25.5|27.0|1
2|video2|31.5|35.0|1
3|video2|68.5|70.5|1
3|video2|74.0|76.5|1
3|video2|144.5|174.0|10
3|video2|190.2|253.0|10
4|video2|253.0|255.0|1
4|video2|256.0|262.5|1
5|video2|324.5|328.8|1
5|video2|360.3|362.5|1
5|video2|382.5|386.0|1
5|video2|402.5|406.3|1
5|video2|410.5|414.5|1
5|video2|426.0|429.0|1
6|video1|2.0|5.5|1
6|video1|9.0|14.8|1
6|video1|93.0|96.5|1
6|video1|98.0|101.5|1
6|video1|115.7|117.2|1
6|video1|161.4|163.4|1|2
"

mkdir -p "$OUTPUT_DIRECTORY"

# 1. Each segment to a near-lossless intermediate. `-nostdin` keeps ffmpeg from eating the list.
segmentIndex=0
while IFS='|' read -r chapter source startSeconds endSeconds speed holdSeconds; do
  [ -z "$chapter" ] && continue
  segmentIndex=$((segmentIndex + 1))
  durationSeconds=$(echo "$endSeconds - $startSeconds" | bc)
  segmentFile=$(printf "%s/segment-%02d.mp4" "$WORK_DIRECTORY" "$segmentIndex")
  ffmpeg -nostdin -v error -y -ss "$startSeconds" -t "$durationSeconds" \
    -i "$SOURCE_DIRECTORY/$source.mp4" -an \
    -vf "setpts=(PTS-STARTPTS)/$speed,$DEMO_FRAME_FILTER,tpad=stop_mode=clone:stop_duration=${holdSeconds:-0}" \
    -c:v libx264 -preset veryfast -crf 12 -r 30 "$segmentFile"
  echo "file '$segmentFile'" >> "$WORK_DIRECTORY/chapter-$chapter.txt"
done <<< "$DEMO_SEGMENTS"

# 2. Hard cuts inside a chapter.
for listFile in "$WORK_DIRECTORY"/chapter-*.txt; do
  ffmpeg -nostdin -v error -y -f concat -safe 0 -i "$listFile" -c copy "${listFile%.txt}.mp4"
done

# 3. A 0.2 s crossfade between chapters, then the web encode. The printed start times feed the
# chapters in src/content/demo-video.ts (add 0.2 s so a seek lands past the fade).
chapterFiles=("$WORK_DIRECTORY"/chapter-*.mp4)
inputs=()
for chapterFile in "${chapterFiles[@]}"; do inputs+=(-i "$chapterFile"); done
filter=""
previousLabel="0:v"
offsetSeconds=0
for ((index = 1; index < ${#chapterFiles[@]}; index++)); do
  previousDuration=$(ffprobe -v error -show_entries format=duration -of csv=p=0 \
    "${chapterFiles[$((index - 1))]}")
  offsetSeconds=$(echo "$offsetSeconds + $previousDuration - $FADE_SECONDS" | bc)
  echo "chapter $((index + 1)) starts at ${offsetSeconds}s"
  filter+="[$previousLabel][$index:v]xfade=transition=fade:duration=$FADE_SECONDS:offset=$offsetSeconds[faded$index];"
  previousLabel="faded$index"
done
filter+="[$previousLabel]format=yuv420p[out]"
ffmpeg -nostdin -v error -y "${inputs[@]}" -filter_complex "$filter" -map "[out]" \
  "${WEB_ENCODE[@]}" -crf "$DEMO_CRF" "$OUTPUT_DIRECTORY/stridemon-demo.mp4"

# 4. The poster: the Home screen with Sneaker #2, from the finished demo.
ffmpeg -nostdin -v error -y -ss 12.5 -i "$OUTPUT_DIRECTORY/stridemon-demo.mp4" -frames:v 1 \
  "$WORK_DIRECTORY/poster.png"
cwebp -quiet -q 80 "$WORK_DIRECTORY/poster.png" -o "$OUTPUT_DIRECTORY/stridemon-demo-poster.webp"

# 5. The walk loop: the run screen at 12×, with the status bar painted black (as the screenshots
# are) and fitted to the screenshots' 1080 × 2340 aspect, so it lies exactly over 03-active-run.
ffmpeg -nostdin -v error -y -ss 190.2 -t 62.8 -i "$SOURCE_DIRECTORY/video2.mp4" \
  -vf "setpts=(PTS-STARTPTS)/12,crop=586:1270:0:5,drawbox=x=0:y=0:w=586:h=43:color=black:t=fill,scale=540:1170:flags=lanczos,fps=30,format=yuv420p" \
  "${WEB_ENCODE[@]}" -crf "$LOOP_CRF" "$OUTPUT_DIRECTORY/stridemon-walk-loop.mp4"

for outputFile in "$OUTPUT_DIRECTORY"/stridemon-*; do
  printf "%-48s %8s bytes\n" "$outputFile" "$(stat -f %z "$outputFile" 2>/dev/null || stat -c %s "$outputFile")"
done
ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUTPUT_DIRECTORY/stridemon-demo.mp4" |
  xargs printf "demo duration: %ss (update durationSeconds in src/content/demo-video.ts)\n"
