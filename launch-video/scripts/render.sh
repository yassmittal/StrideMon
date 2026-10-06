#!/usr/bin/env bash
# Renders one format of the film and its delivery files into out/.
# Run from launch-video/: `bash scripts/render.sh 4x5` (or 16x9, 9x16). Needs ffmpeg and jq.
#
#   1. The picture: H.264, CRF 16, yuv420p, BT.709 (launch-video-prompt.md §7), no audio.
#   2. The mix (music and sound effects) as a 48 kHz WAV.
#   3. Two-pass loudnorm to −14 LUFS integrated, −1 dBTP, as one linear gain.
#   4. The picture and the normalised mix muxed with AAC 320 kbps at 48 kHz, +faststart.
#   5. The poster: the end card's last frame. For 4:5, also a silent copy for autoplay embeds.
set -euo pipefail

FORMAT=${1:?usage: bash scripts/render.sh 4x5|16x9|9x16}
case "$FORMAT" in
  4x5) COMPOSITION_ID=Launch4x5 ;;
  16x9) COMPOSITION_ID=Launch16x9 ;;
  9x16) COMPOSITION_ID=Launch9x16 ;;
  *) echo "Unknown format: $FORMAT" >&2 && exit 1 ;;
esac

OUTPUT_DIRECTORY=out
WORK_DIRECTORY=out/work
LAST_FRAME=2699
TARGET_LOUDNESS_LUFS=-14
TARGET_TRUE_PEAK_DBTP=-1
TARGET_LOUDNESS_RANGE_LU=11

PICTURE_FILE=$WORK_DIRECTORY/$FORMAT-picture.mp4
MIX_FILE=$WORK_DIRECTORY/$FORMAT-mix.wav
NORMALISED_MIX_FILE=$WORK_DIRECTORY/$FORMAT-mix-normalised.wav
FILM_FILE=$OUTPUT_DIRECTORY/stridemon-launch-$FORMAT.mp4
POSTER_FILE=$OUTPUT_DIRECTORY/stridemon-launch-$FORMAT-poster.png

mkdir -p "$WORK_DIRECTORY"

bunx remotion render "$COMPOSITION_ID" "$PICTURE_FILE" \
  --codec h264 --crf 16 --pixel-format yuv420p --color-space bt709 --muted
bunx remotion render "$COMPOSITION_ID" "$MIX_FILE" --codec wav

LOUDNORM_TARGET="I=$TARGET_LOUDNESS_LUFS:TP=$TARGET_TRUE_PEAK_DBTP:LRA=$TARGET_LOUDNESS_RANGE_LU"
measurement=$(ffmpeg -nostdin -hide_banner -i "$MIX_FILE" \
  -af "loudnorm=$LOUDNORM_TARGET:print_format=json" -f null - 2>&1 | sed -n '/^{/,/^}/p')
read_measurement() { jq -r ".$1" <<<"$measurement"; }
ffmpeg -nostdin -v error -y -i "$MIX_FILE" \
  -af "loudnorm=$LOUDNORM_TARGET:measured_I=$(read_measurement input_i):measured_TP=$(read_measurement input_tp):measured_LRA=$(read_measurement input_lra):measured_thresh=$(read_measurement input_thresh):offset=$(read_measurement target_offset):linear=true:print_format=summary,aresample=48000" \
  -c:a pcm_s24le "$NORMALISED_MIX_FILE"

# h264_metadata writes BT.709 into the stream itself, so players that ignore the MP4 colour
# atom still decode lime and black correctly.
ffmpeg -nostdin -v error -y -i "$PICTURE_FILE" -i "$NORMALISED_MIX_FILE" \
  -map 0:v:0 -map 1:a:0 -c:v copy \
  -bsf:v "h264_metadata=video_full_range_flag=0:colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1" \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv \
  -c:a aac -b:a 320k -ar 48000 -ac 2 -movflags +faststart "$FILM_FILE"

if [ "$FORMAT" = 4x5 ]; then
  ffmpeg -nostdin -v error -y -i "$FILM_FILE" -map 0:v:0 -c:v copy -an -movflags +faststart \
    "$OUTPUT_DIRECTORY/stridemon-launch-4x5-silent.mp4"
fi

bunx remotion still "$COMPOSITION_ID" "$POSTER_FILE" --frame="$LAST_FRAME" --image-format=png

echo
echo "$FILM_FILE"
ffprobe -v error -select_streams v:0 -count_packets \
  -show_entries stream=width,height,r_frame_rate,nb_read_packets,color_space,color_primaries,color_transfer,color_range \
  -of default=noprint_wrappers=1 "$FILM_FILE"
ffprobe -v error -select_streams a:0 -show_entries stream=codec_name,sample_rate,bit_rate \
  -of default=noprint_wrappers=1 "$FILM_FILE"
ffmpeg -nostdin -hide_banner -i "$FILM_FILE" -map 0:a:0 -af ebur128=peak=true -f null - 2>&1 |
  grep -E '^\s+(I|LRA|Peak):'
