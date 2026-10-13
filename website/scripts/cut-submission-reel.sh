#!/usr/bin/env bash
# Cuts the two raw Android screen recordings in media-source/ (gitignored) into one silent portrait
# reel for the Metropolis submission video (docs/demo-video-script.md): Yash plays it in QuickTime
# next to the browser and pauses it at each step's held frame. Output: media-source/submission-reel.mp4,
# with one QuickTime chapter per step. Run from website/: `bash scripts/cut-submission-reel.sh`.
# Needs ffmpeg, ffprobe and awk.
#
# Sources, both recorded on the D-038 contracts:
# - recording.mp4 (2026-10-07, 576 × 1296, a WhatsApp copy): Sneaker #3 from sign-in to repair.
# - video3.mp4 (2026-10-06, 880 × 1920): the only transfer (Sneaker #1, wallet A → B).
#
# Cut around: MetaMask's fox splash and its "Fund your wallet" home with promo cards, Android's
# location dialog, and (never shown) MetaMask's account details at video3.mp4 5:52–6:04.
set -euo pipefail

OUTPUT_FILE=media-source/submission-reel.mp4
WORK_DIRECTORY=$(mktemp -d)
trap 'rm -rf "$WORK_DIRECTORY"' EXIT

# Both crop the status bar (clock, battery) and end up 720 × 1560 at 30 fps. video3.mp4 is a
# little wider, so it loses about 14 source pixels of side margin on each side.
RECORDING_FRAME_FILTER="crop=576:1248:0:48,scale=720:1560:flags=lanczos"
VIDEO3_FRAME_FILTER="crop=880:1848:0:72,scale=-2:1560:flags=lanczos,crop=720:1560"

# chapter | source | start (s) | end (s) | speed | hold the last frame (s)
# A step's last segment holds its last frame, which is where to pause.
REEL_SEGMENTS="
Sign in|recording|0.0|4.0|1|0
Sign in|recording|28.7|29.9|1|0
Sign in|recording|32.9|34.0|1|0
Starter Sneaker|recording|36.0|41.9|1|1.5
Walk|recording|42.0|44.6|1|0
Walk|recording|48.0|176.5|16|1.0
STOP and settle|recording|176.5|183.3|1|2.0
Repair|recording|196.3|199.4|1|0
Repair|recording|215.9|218.4|1|0
Repair|recording|219.9|221.9|1|1.0
Repair on MonadVision|recording|226.9|229.2|1|2.0
Send to wallet B|video3|377.4|379.9|1|0
Send to wallet B|video3|386.0|388.5|1|0
Send to wallet B|video3|396.6|400.6|1|0
Send to wallet B|video3|402.9|405.4|1|2.0
Wallet B has it|video3|429.0|430.4|1|0
Wallet B has it|video3|433.4|437.9|1|2.0
On-chain art|recording|192.6|194.1|1|3.0
"

# 1. Each segment to a near-lossless intermediate with identical encoder settings, so step 2 can
#    join them without re-encoding. `-nostdin` keeps ffmpeg from eating the list.
segmentIndex=0
reelSeconds=0
previousChapter=""
chapterStarts=()
chapterTitles=()
while IFS='|' read -r chapter source startSeconds endSeconds speed holdLastSeconds; do
  [ -z "$chapter" ] && continue
  segmentIndex=$((segmentIndex + 1))
  if [ "$source" = recording ]; then frameFilter=$RECORDING_FRAME_FILTER; else frameFilter=$VIDEO3_FRAME_FILTER; fi
  durationSeconds=$(awk "BEGIN { print $endSeconds - $startSeconds }")
  segmentFile=$(printf "%s/segment-%02d.mp4" "$WORK_DIRECTORY" "$segmentIndex")
  ffmpeg -nostdin -v error -y -ss "$startSeconds" -t "$durationSeconds" -i "media-source/$source.mp4" -an \
    -vf "setpts=(PTS-STARTPTS)/$speed,$frameFilter,fps=30,format=yuv420p,tpad=stop_mode=clone:stop_duration=$holdLastSeconds" \
    -c:v libx264 -preset veryfast -crf 12 -r 30 "$segmentFile"
  echo "file '$segmentFile'" >> "$WORK_DIRECTORY/segments.txt"
  if [ "$chapter" != "$previousChapter" ]; then
    chapterStarts+=("$reelSeconds")
    chapterTitles+=("$chapter")
    previousChapter=$chapter
  fi
  segmentSeconds=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$segmentFile")
  reelSeconds=$(awk "BEGIN { print $reelSeconds + $segmentSeconds }")
done <<< "$REEL_SEGMENTS"

# 2. One QuickTime chapter per step, so the chapter list jumps straight to it.
metadataFile=$WORK_DIRECTORY/chapters.txt
echo ";FFMETADATA1" > "$metadataFile"
for index in "${!chapterStarts[@]}"; do
  startMilliseconds=$(awk "BEGIN { printf \"%d\", ${chapterStarts[$index]} * 1000 }")
  if [ $((index + 1)) -lt ${#chapterStarts[@]} ]; then
    endMilliseconds=$(awk "BEGIN { printf \"%d\", ${chapterStarts[$((index + 1))]} * 1000 }")
  else
    endMilliseconds=$(awk "BEGIN { printf \"%d\", $reelSeconds * 1000 }")
  fi
  printf "[CHAPTER]\nTIMEBASE=1/1000\nSTART=%s\nEND=%s\ntitle=%s\n" \
    "$startMilliseconds" "$endMilliseconds" "${chapterTitles[$index]}" >> "$metadataFile"
done

# 3. Join and encode once for playback.
ffmpeg -nostdin -v error -y -f concat -safe 0 -i "$WORK_DIRECTORY/segments.txt" -i "$metadataFile" \
  -map 0:v -map_metadata 1 -map_chapters 1 -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p \
  -movflags +faststart "$OUTPUT_FILE"

echo "Wrote $OUTPUT_FILE ($(printf '%.1f' "$reelSeconds") s). Chapters:"
for index in "${!chapterStarts[@]}"; do
  chapterSeconds=$(printf '%.0f' "${chapterStarts[$index]}")
  printf "  %d:%02d  %s\n" $((chapterSeconds / 60)) $((chapterSeconds % 60)) "${chapterTitles[$index]}"
done
