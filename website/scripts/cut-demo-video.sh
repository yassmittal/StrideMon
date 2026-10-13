#!/usr/bin/env bash
# Cuts the raw Android screen recording in media-source/ (gitignored) into the landing page's
# demo video (with its music), its poster, and the How it works walk loop, all in public/videos/.
# Run from website/: `bash scripts/cut-demo-video.sh`. Needs ffmpeg, ffprobe, bc, curl and cwebp.
#
# Source (2026-10-06, after the STRIDE rename, D-038): video3.mp4, 880 × 1920, ~24 fps variable,
# silent. Wallet A signs in, walks 3:31, earns 15 STRIDE, then sends Sneaker #1 to wallet B.
# (video1/video2 are the older SOLE recordings, no longer used.)
#
# Music (D-052): "Fresh" by Bransboynd (https://pixabay.com/music/soft-house-fresh-457883/), soft
# house at about 114 BPM, under the Pixabay Content License (free for commercial use, no
# attribution needed). Downloaded into media-source/ on the first run. Its beat comes in at 16.9 s
# and its drop at 33.8 s, so starting it 6.4 s in puts the beat just before Walk and the drop on the
# Earn chapter (27.4 s in the demo). It fades out over the held last frame.
set -euo pipefail

SOURCE_FILE=media-source/video3.mp4
OUTPUT_DIRECTORY=public/videos
WORK_DIRECTORY=$(mktemp -d)
trap 'rm -rf "$WORK_DIRECTORY"' EXIT

DEMO_CRF=23
LOOP_CRF=22
FADE_SECONDS=0.2
POSTER_SECONDS=34.5
MUSIC_URL="https://cdn.pixabay.com/download/audio/2025/12/28/audio_ff45db1db1.mp3?filename=bransboynd-fresh-457883.mp3"
MUSIC_FILE=media-source/bransboynd-fresh-457883.mp3
MUSIC_START_SECONDS=6.4
MUSIC_FADE_IN_SECONDS=1
MUSIC_FADE_OUT_SECONDS=2.5
MUSIC_LOUDNESS_LUFS=-16
WEB_ENCODE=(-an -c:v libx264 -profile:v high -preset slow -pix_fmt yuv420p -r 30 -movflags +faststart)

# The demo crops the status bar (top 72 px: clock, battery) and scales to 540 × 1134, 30 fps.
DEMO_FRAME_FILTER="crop=880:1848:0:72,scale=540:-2:flags=lanczos,fps=30,format=yuv420p"

# scene | start (s) | end (s) | speed | hold the first frame (s) | hold the last frame (s)
# Hard cuts inside a scene, a 0.2 s crossfade between scenes. Cut around: MetaMask's splash and
# loading screens, wallet B's sign-in and starter mint, and MetaMask's account settings (356 s).
DEMO_SEGMENTS="
1|0.0|3.0|1|1.2|0
1|46.3|48.0|1|0|0
1|50.3|51.8|1|0|0
1|56.0|58.3|1|0|0
2|61.9|64.8|1|0|0
3|65.9|68.5|1|0|0
3|68.5|272.5|16|0|0
4|273.0|275.3|1|0|0
4|276.0|281.5|1|0|0
5|375.7|379.5|1|0|0
5|382.2|383.3|1|0|0
5|384.3|388.6|1|0|0
5|397.0|400.3|1|0|0
5|402.8|405.5|1|0|0
6|406.0|407.5|1|0|0
6|435.4|437.2|1|0|2.5
"

mkdir -p "$OUTPUT_DIRECTORY"

# 1. Each segment to a near-lossless intermediate. `-nostdin` keeps ffmpeg from eating the list.
segmentIndex=0
while IFS='|' read -r scene startSeconds endSeconds speed holdFirstSeconds holdLastSeconds; do
  [ -z "$scene" ] && continue
  segmentIndex=$((segmentIndex + 1))
  durationSeconds=$(echo "$endSeconds - $startSeconds" | bc)
  segmentFile=$(printf "%s/segment-%02d.mp4" "$WORK_DIRECTORY" "$segmentIndex")
  ffmpeg -nostdin -v error -y -ss "$startSeconds" -t "$durationSeconds" -i "$SOURCE_FILE" -an \
    -vf "setpts=(PTS-STARTPTS)/$speed,$DEMO_FRAME_FILTER,tpad=start_mode=clone:start_duration=$holdFirstSeconds:stop_mode=clone:stop_duration=$holdLastSeconds" \
    -c:v libx264 -preset veryfast -crf 12 -r 30 "$segmentFile"
  echo "file '$segmentFile'" >> "$WORK_DIRECTORY/scene-$scene.txt"
done <<< "$DEMO_SEGMENTS"

# 2. Hard cuts inside a scene.
for listFile in "$WORK_DIRECTORY"/scene-*.txt; do
  ffmpeg -nostdin -v error -y -f concat -safe 0 -i "$listFile" -c copy "${listFile%.txt}.mp4"
done

# 3. A 0.2 s crossfade between scenes, then the web encode.
sceneFiles=("$WORK_DIRECTORY"/scene-*.mp4)
inputs=()
for sceneFile in "${sceneFiles[@]}"; do inputs+=(-i "$sceneFile"); done
filter=""
previousLabel="0:v"
offsetSeconds=0
for ((index = 1; index < ${#sceneFiles[@]}; index++)); do
  previousDuration=$(ffprobe -v error -show_entries format=duration -of csv=p=0 \
    "${sceneFiles[$((index - 1))]}")
  offsetSeconds=$(echo "$offsetSeconds + $previousDuration - $FADE_SECONDS" | bc)
  echo "scene $((index + 1)) starts at ${offsetSeconds}s"
  filter+="[$previousLabel][$index:v]xfade=transition=fade:duration=$FADE_SECONDS:offset=$offsetSeconds[faded$index];"
  previousLabel="faded$index"
done
filter+="[$previousLabel]format=yuv420p[out]"
ffmpeg -nostdin -v error -y "${inputs[@]}" -filter_complex "$filter" -map "[out]" \
  "${WEB_ENCODE[@]}" -crf "$DEMO_CRF" "$WORK_DIRECTORY/demo-silent.mp4"

# 3b. The music, cut to the demo's length with a fade at each end, levelled to -16 LUFS in two
# passes (`linear=true` keeps its dynamics), then muxed in as AAC without touching the video.
if [ ! -f "$MUSIC_FILE" ]; then
  curl -fsSL -A "Mozilla/5.0" -e https://pixabay.com/ "$MUSIC_URL" -o "$MUSIC_FILE"
fi
demoDurationSeconds=$(ffprobe -v error -show_entries format=duration -of csv=p=0 \
  "$WORK_DIRECTORY/demo-silent.mp4")
fadeOutStartSeconds=$(echo "$demoDurationSeconds - $MUSIC_FADE_OUT_SECONDS" | bc)
musicFilter="atrim=start=$MUSIC_START_SECONDS:duration=$demoDurationSeconds,asetpts=PTS-STARTPTS,afade=t=in:d=$MUSIC_FADE_IN_SECONDS,afade=t=out:st=$fadeOutStartSeconds:d=$MUSIC_FADE_OUT_SECONDS"
loudnessJson=$(ffmpeg -nostdin -hide_banner -i "$MUSIC_FILE" \
  -af "$musicFilter,loudnorm=I=$MUSIC_LOUDNESS_LUFS:TP=-1.5:LRA=11:print_format=json" -f null - 2>&1 |
  sed -n '/^{/,/^}/p')
readLoudness() { echo "$loudnessJson" | sed -n "s/.*\"$1\" : \"\(.*\)\".*/\1/p"; }
loudnormFilter="loudnorm=I=$MUSIC_LOUDNESS_LUFS:TP=-1.5:LRA=11:linear=true:measured_I=$(readLoudness input_i):measured_TP=$(readLoudness input_tp):measured_LRA=$(readLoudness input_lra):measured_thresh=$(readLoudness input_thresh):offset=$(readLoudness target_offset)"
ffmpeg -nostdin -v error -y -i "$WORK_DIRECTORY/demo-silent.mp4" -i "$MUSIC_FILE" \
  -filter_complex "[1:a]$musicFilter,$loudnormFilter,aresample=44100[music]" \
  -map 0:v -map "[music]" -c:v copy -c:a aac -b:a 128k -ac 2 -shortest -movflags +faststart \
  "$OUTPUT_DIRECTORY/stridemon-demo.mp4"

# 4. The poster: Home with Sneaker #1 and the 15 STRIDE just earned, from the finished demo.
ffmpeg -nostdin -v error -y -ss "$POSTER_SECONDS" -i "$OUTPUT_DIRECTORY/stridemon-demo.mp4" \
  -frames:v 1 "$WORK_DIRECTORY/poster.png"
cwebp -quiet -q 80 "$WORK_DIRECTORY/poster.png" -o "$OUTPUT_DIRECTORY/stridemon-demo-poster.webp"

# 5. The walk loop: the run screen at 12× (145 → 228 m, +5 → +15 STRIDE), with the status bar
# painted black (as the screenshots are) and fitted to the screenshots' 1080 × 2340 aspect, so it
# lies exactly over 03-active-run.
ffmpeg -nostdin -v error -y -ss 180 -t 70 -i "$SOURCE_FILE" \
  -vf "setpts=(PTS-STARTPTS)/12,crop=880:1906:0:7,drawbox=x=0:y=0:w=880:h=66:color=black:t=fill,scale=540:1170:flags=lanczos,fps=30,format=yuv420p" \
  "${WEB_ENCODE[@]}" -crf "$LOOP_CRF" "$OUTPUT_DIRECTORY/stridemon-walk-loop.mp4"

for outputFile in "$OUTPUT_DIRECTORY"/stridemon-*; do
  printf "%-48s %8s bytes\n" "$outputFile" "$(stat -f %z "$outputFile" 2>/dev/null || stat -c %s "$outputFile")"
done
ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUTPUT_DIRECTORY/stridemon-demo.mp4" |
  xargs printf "demo duration: %ss (update durationSeconds in src/content/demo-video.ts)\n"
