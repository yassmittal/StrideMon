#!/usr/bin/env bash
# Renders one format of a film and its delivery files into out/.
# Run from launch-video/: `bash scripts/render.sh 4x5` (or 16x9, 9x16) for the launch film, or
# `bash scripts/render.sh waitlist-4x5` for the Founding Pass waitlist film, or
# `bash scripts/render.sh sneaker-drop-4x5` (or sneaker-drop-9x16) for the Sneaker drop film, or
# `bash scripts/render.sh pass-chat-16x9` for the Pass chat film, or
# `bash scripts/render.sh app-tour-9x16` for the App tour film, or
# `bash scripts/render.sh showroom-9x16` for the Showroom film.
# Needs ffmpeg and jq.
# `bash scripts/render.sh 4x5 --audio-only` keeps the last picture render and redoes only the sound
# (after a music or mix change).
#
#   1. The picture: H.264, CRF 16, yuv420p, BT.709 (launch-video-prompt.md §7), no audio.
#   2. The mix (music and sound effects) as a 48 kHz WAV.
#   3. A peak limiter for the few transients that land on a kick, then two-pass loudnorm to
#      −14 LUFS integrated, −1 dBTP, as one linear gain.
#   4. The picture and the normalised mix muxed with AAC 320 kbps at 48 kHz, +faststart.
#   5. The poster: the end card's last frame. For each 4:5 film, also a silent copy for autoplay
#      embeds.
set -euo pipefail

FORMAT=${1:?usage: bash scripts/render.sh 4x5|16x9|9x16|waitlist-4x5|sneaker-drop-4x5|sneaker-drop-9x16|pass-chat-16x9|app-tour-9x16|showroom-9x16 [--audio-only]}
IS_AUDIO_ONLY=$([ "${2:-}" = --audio-only ] && echo yes || echo no)
# The launch film is 2700 frames (45 s); the waitlist film 1364 (src/waitlist/beats.ts); the
# Sneaker drop film 1802 (src/sneaker-drop/beats.ts).
LAUNCH_LAST_FRAME=2699
WAITLIST_LAST_FRAME=1363
SNEAKER_DROP_LAST_FRAME=1801
# The Pass chat film is 702 frames (src/pass-chat/timeline.ts).
PASS_CHAT_LAST_FRAME=701
# The App tour film is 1800 frames (src/app-tour/beats.ts). Its poster is "Level 2 reached", about
# a second after the drop (src/app-tour/timeline.ts, levelUpTimeline.dropFrame + 60).
APP_TOUR_POSTER_FRAME=1271
APP_TOUR_MUSIC_DEFAULT_FILE_NAME=app-tour-music.wav
# The Showroom film is 644 frames (src/showroom/timeline.ts). Its poster is the Sneaker wall,
# pushed in on the stand, just before the whip out.
SHOWROOM_POSTER_FRAME=525
RENDER_PROPS=()
case "$FORMAT" in
  4x5) COMPOSITION_ID=Launch4x5 FILM_NAME=stridemon-launch-4x5 LAST_FRAME=$LAUNCH_LAST_FRAME ;;
  16x9) COMPOSITION_ID=Launch16x9 FILM_NAME=stridemon-launch-16x9 LAST_FRAME=$LAUNCH_LAST_FRAME ;;
  9x16) COMPOSITION_ID=Launch9x16 FILM_NAME=stridemon-launch-9x16 LAST_FRAME=$LAUNCH_LAST_FRAME ;;
  waitlist-4x5)
    COMPOSITION_ID=Waitlist4x5 FILM_NAME=stridemon-waitlist-4x5 LAST_FRAME=$WAITLIST_LAST_FRAME
    ;;
  sneaker-drop-4x5)
    COMPOSITION_ID=SneakerDrop4x5 FILM_NAME=stridemon-sneaker-drop-4x5
    LAST_FRAME=$SNEAKER_DROP_LAST_FRAME
    ;;
  sneaker-drop-9x16)
    COMPOSITION_ID=SneakerDrop9x16 FILM_NAME=stridemon-sneaker-drop-9x16
    LAST_FRAME=$SNEAKER_DROP_LAST_FRAME
    ;;
  pass-chat-16x9)
    COMPOSITION_ID=PassChat16x9 FILM_NAME=stridemon-pass-chat-16x9 LAST_FRAME=$PASS_CHAT_LAST_FRAME
    # Its pops are sharper than the other films' effects, and the AAC encode overshot −1 dBTP by
    # 0.3 dB at −2 dBFS: the limiter sits a dB lower for it.
    LIMITER_CEILING_LINEAR=0.708
    ;;
  app-tour-9x16)
    COMPOSITION_ID=AppTour9x16 FILM_NAME=stridemon-app-tour-9x16 LAST_FRAME=$APP_TOUR_POSTER_FRAME
    # The reference ad's own music, by Yash's choice (2026-10-17): unlicensed, so it isn't for
    # Instagram, and YouTube may claim it (CREDITS.md). APP_TOUR_MUSIC_FILE_NAME can name another
    # file in public/audio/.
    APP_TOUR_MUSIC_FILE_NAME=${APP_TOUR_MUSIC_FILE_NAME:-$APP_TOUR_MUSIC_DEFAULT_FILE_NAME}
    if [ "$APP_TOUR_MUSIC_FILE_NAME" = "$APP_TOUR_MUSIC_DEFAULT_FILE_NAME" ]; then
      echo "Note: the App tour film uses the reference ad's music, which StrideMon holds no licence for." >&2
    fi
    RENDER_PROPS=(--props "{\"musicFileName\":\"$APP_TOUR_MUSIC_FILE_NAME\",\"hasSoundEffects\":true}")
    ;;
  showroom-9x16)
    COMPOSITION_ID=Showroom9x16 FILM_NAME=stridemon-showroom-9x16 LAST_FRAME=$SHOWROOM_POSTER_FRAME
    # The reference's own hook and music, by Yash's choice (2026-10-21): unlicensed (CREDITS.md).
    # Its store is WebGL (@remotion/three), which headless Chrome draws with ANGLE.
    echo "Note: the Showroom film uses the reference's footage and music, which StrideMon holds no licence for." >&2
    RENDER_PROPS=(--gl=angle)
    ;;
  *) echo "Unknown format: $FORMAT" >&2 && exit 1 ;;
esac

OUTPUT_DIRECTORY=out
WORK_DIRECTORY=out/work
TARGET_LOUDNESS_LUFS=-14
TARGET_TRUE_PEAK_DBTP=-1
# Wide enough for the calm intro, so loudnorm stays one linear gain (it goes dynamic when the
# mix's range is over the target, which would squash the intro).
TARGET_LOUDNESS_RANGE_LU=20
# −2 dBFS: a dB under the true-peak target, for inter-sample peaks and the AAC encode's overshoot.
LIMITER_CEILING_LINEAR=${LIMITER_CEILING_LINEAR:-0.794}

PICTURE_FILE=$WORK_DIRECTORY/$FORMAT-picture.mp4
MIX_FILE=$WORK_DIRECTORY/$FORMAT-mix.wav
LIMITED_MIX_FILE=$WORK_DIRECTORY/$FORMAT-mix-limited.wav
NORMALISED_MIX_FILE=$WORK_DIRECTORY/$FORMAT-mix-normalised.wav
FILM_FILE=$OUTPUT_DIRECTORY/$FILM_NAME.mp4
POSTER_FILE=$OUTPUT_DIRECTORY/$FILM_NAME-poster.png

mkdir -p "$WORK_DIRECTORY"

if [ "$IS_AUDIO_ONLY" = no ] || [ ! -s "$PICTURE_FILE" ]; then
  bunx remotion render "$COMPOSITION_ID" "$PICTURE_FILE" \
    --codec h264 --crf 16 --pixel-format yuv420p --color-space bt709 --muted ${RENDER_PROPS[@]+"${RENDER_PROPS[@]}"}
fi
bunx remotion render "$COMPOSITION_ID" "$MIX_FILE" --codec wav ${RENDER_PROPS[@]+"${RENDER_PROPS[@]}"}

LOUDNORM_TARGET="I=$TARGET_LOUDNESS_LUFS:TP=$TARGET_TRUE_PEAK_DBTP:LRA=$TARGET_LOUDNESS_RANGE_LU"
measure_loudness() {
  ffmpeg -nostdin -hide_banner -i "$1" -af "loudnorm=$LOUDNORM_TARGET:print_format=json" -f null - 2>&1 |
    sed -n '/^{/,/^}/p'
}

# A few effects land on a kick, and those peaks would pass −1 dBTP once the mix is brought up to
# −14 LUFS. So: bring it up by the measured gap, let a limiter catch only those transients (at
# −2 dBFS, with 4× oversampling for true peak), then the two-pass loudnorm as one linear gain.
first_measurement=$(measure_loudness "$MIX_FILE")
gain_decibels=$(jq -r "$TARGET_LOUDNESS_LUFS - (.input_i | tonumber)" <<<"$first_measurement")
ffmpeg -nostdin -v error -y -i "$MIX_FILE" \
  -af "volume=${gain_decibels}dB,aresample=192000,alimiter=limit=$LIMITER_CEILING_LINEAR:attack=1:release=60:level=false,aresample=48000" \
  -c:a pcm_s24le "$LIMITED_MIX_FILE"

measurement=$(measure_loudness "$LIMITED_MIX_FILE")
read_measurement() { jq -r ".$1" <<<"$measurement"; }
ffmpeg -nostdin -hide_banner -y -i "$LIMITED_MIX_FILE" \
  -af "loudnorm=$LOUDNORM_TARGET:measured_I=$(read_measurement input_i):measured_TP=$(read_measurement input_tp):measured_LRA=$(read_measurement input_lra):measured_thresh=$(read_measurement input_thresh):offset=$(read_measurement target_offset):linear=true:print_format=summary,aresample=48000" \
  -c:a pcm_s24le "$NORMALISED_MIX_FILE" 2>&1 | grep -E 'Normalization Type|Output (Integrated|True Peak)'

# h264_metadata writes BT.709 into the stream itself, so players that ignore the MP4 colour
# atom still decode lime and black correctly.
ffmpeg -nostdin -v error -y -i "$PICTURE_FILE" -i "$NORMALISED_MIX_FILE" \
  -map 0:v:0 -map 1:a:0 -c:v copy \
  -bsf:v "h264_metadata=video_full_range_flag=0:colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1" \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv \
  -c:a aac -b:a 320k -ar 48000 -ac 2 -movflags +faststart "$FILM_FILE"

if [ "$FORMAT" = 4x5 ] || [ "$FORMAT" = waitlist-4x5 ] || [ "$FORMAT" = sneaker-drop-4x5 ] ||
  [ "$FORMAT" = pass-chat-16x9 ] || [ "$FORMAT" = app-tour-9x16 ] || [ "$FORMAT" = showroom-9x16 ]; then
  ffmpeg -nostdin -v error -y -i "$FILM_FILE" -map 0:v:0 -c:v copy -an -movflags +faststart \
    "$OUTPUT_DIRECTORY/$FILM_NAME-silent.mp4"
fi

if [ "$IS_AUDIO_ONLY" = no ]; then
  bunx remotion still "$COMPOSITION_ID" "$POSTER_FILE" --frame="$LAST_FRAME" --image-format=png \
    ${RENDER_PROPS[@]+"${RENDER_PROPS[@]}"}
fi

echo
echo "$FILM_FILE"
ffprobe -v error -select_streams v:0 -count_packets \
  -show_entries stream=width,height,r_frame_rate,nb_read_packets,color_space,color_primaries,color_transfer,color_range \
  -of default=noprint_wrappers=1 "$FILM_FILE"
ffprobe -v error -select_streams a:0 -show_entries stream=codec_name,sample_rate,bit_rate \
  -of default=noprint_wrappers=1 "$FILM_FILE"
ffmpeg -nostdin -hide_banner -i "$FILM_FILE" -map 0:a:0 -af ebur128=peak=true -f null - 2>&1 |
  grep -E '^\s+(I|LRA|Peak):'
