#!/usr/bin/env bash
# Downloads the three films' music and sound effects and prepares them in public/audio/ (gitignored).
# Run from launch-video/: `bash scripts/fetch-audio.sh`. Needs curl, unzip and ffmpeg.
#
# Every source and licence is in CREDITS.md, for both films. To swap the music, change MUSIC_URL and
# MUSIC_START_SECONDS here (and BEATS_PER_MINUTE in src/beats.ts), then re-run. The waitlist
# film's are the WAITLIST_ ones (and WAITLIST_BEATS_PER_MINUTE in src/waitlist/beats.ts). The
# Sneaker drop film's are the SNEAKER_DROP_ ones (src/sneaker-drop/beats.ts).
set -euo pipefail

OUTPUT_DIRECTORY=public/audio
DOWNLOAD_DIRECTORY=$OUTPUT_DIRECTORY/source
SAMPLE_RATE=48000

# "Futuristic" by NastelBom, Pixabay Content License (CREDITS.md). 120 BPM, G minor. Yash's pick.
MUSIC_PAGE_URL=https://pixabay.com/music/future-bass-futuristic-317718/
MUSIC_URL='https://cdn.pixabay.com/download/audio/2025/03/23/audio_d988639c74.mp3?filename=nastelbom-futuristic-317718.mp3'
MUSIC_FILE_NAME=nastelbom-futuristic-317718.mp3
# A downbeat in the lighter intro, five bars before the full beat comes in (14.042 s in the track),
# so it lands on film frame 600: beat 20, the walk scene's first beat. The track eases off again at
# film 0:36, just before the end card.
MUSIC_START_SECONDS=4.042
# The +10 STRIDE tone's two notes, in the track's key: G5 and G4.
TONE_HIGH_HERTZ=783.99
TONE_LOW_HERTZ=392.00
# The film is 45 s; keep a little extra so the fade, not the file, ends the music.
MUSIC_DURATION_SECONDS=46

# The waitlist film (docs/waitlist-video-prompt.md): "Deep Minimal Techno" by soundoffreedom,
# Pixabay Content License, no Content ID (CREDITS.md). 124.052 BPM, D# minor.
WAITLIST_MUSIC_PAGE_URL=https://pixabay.com/music/techno-trance-deep-minimal-techno-601808/
WAITLIST_MUSIC_URL='https://cdn.pixabay.com/download/audio/2026/09/12/audio_8e8af8934a.mp3?filename=soundoffreedom-deep-minimal-techno-601808.mp3'
WAITLIST_MUSIC_FILE_NAME=soundoffreedom-deep-minimal-techno-601808.mp3
# Two beats before a downbeat in the break with no kick, so the full beat comes back at 77.447 s
# in the track: film frame 174, beat 6, the flip into the collection.
WAITLIST_MUSIC_START_SECONDS=74.547
# The waitlist film is 22.7 s.
WAITLIST_MUSIC_DURATION_SECONDS=24
# "You're on the list." tone, in the track's key: D#5 and D#4.
WAITLIST_TONE_HIGH_HERTZ=622.25
WAITLIST_TONE_LOW_HERTZ=311.13

# The Sneaker drop film (docs/sneaker-drop-video-prompt.md): "Drift Phonk" by Sub_Clair, Pixabay
# Content License, Content ID registered (CREDITS.md). 96.004 BPM, first beat at 2.560 s, so source
# bar n starts at 2.560 + n × 2.49990 s. Clip A, Yash's cut (2026-10-14): source bar 1 to bar 11
# (the intro bar, the build, the drop and one 8-bar section), then bar 50 to the end (the last bar
# and its tail), joined with 15 ms fades each side and a 20 ms fade-in. 30.09 s.
# Every kick's attack starts about 35 ms before the measured grid (the beat tracker sits on the
# onset's peak), so a cut on the grid lands inside the join's kick. Both cut points sit
# SNEAKER_DROP_CUT_LEAD_SECONDS before the approved ones (5.0599, 30.0589, 127.5546): the join is
# then in the bass just before the bar-50 kick, and each kick's attack starts on its film beat's
# frame. The bars and their order are the approved cut's.
SNEAKER_DROP_MUSIC_PAGE_URL=https://pixabay.com/music/phonk-drift-phonk-607579/
SNEAKER_DROP_MUSIC_URL='https://cdn.pixabay.com/download/audio/2026/09/21/audio_6f38020d16.mp3?filename=sub_clair-drift-phonk-607579.mp3'
SNEAKER_DROP_MUSIC_FILE_NAME=sub_clair-drift-phonk-607579.mp3
SNEAKER_DROP_CUT_LEAD_SECONDS=0.045
SNEAKER_DROP_FIRST_PART_START_SECONDS=$(awk -v lead="$SNEAKER_DROP_CUT_LEAD_SECONDS" 'BEGIN { printf "%.4f", 5.0599 - lead }')
SNEAKER_DROP_FIRST_PART_END_SECONDS=$(awk -v lead="$SNEAKER_DROP_CUT_LEAD_SECONDS" 'BEGIN { printf "%.4f", 30.0589 - lead }')
SNEAKER_DROP_SECOND_PART_START_SECONDS=$(awk -v lead="$SNEAKER_DROP_CUT_LEAD_SECONDS" 'BEGIN { printf "%.4f", 127.5546 - lead }')

# Kenney's packs, CC0 (each zip includes License.txt).
KENNEY_INTERFACE_SOUNDS_URL=https://kenney.nl/media/pages/assets/interface-sounds/fa43c1dd4d-1677589452/kenney_interface-sounds.zip
KENNEY_UI_AUDIO_URL=https://kenney.nl/media/pages/assets/ui-audio/490d233f68-1677590494/kenney_ui-audio.zip
KENNEY_IMPACT_SOUNDS_URL=https://kenney.nl/media/pages/assets/impact-sounds/87b4ddecda-1677589768/kenney_impact-sounds.zip

TO_WAV=(-ar "$SAMPLE_RATE" -ac 2 -c:a pcm_s16le)

mkdir -p "$DOWNLOAD_DIRECTORY"

download() {
  local url=$1 fileName=$2
  if [ ! -s "$DOWNLOAD_DIRECTORY/$fileName" ]; then
    curl -fsSL -A 'Mozilla/5.0' -e "$MUSIC_PAGE_URL" -o "$DOWNLOAD_DIRECTORY/$fileName" "$url"
  fi
}

download "$MUSIC_URL" "$MUSIC_FILE_NAME"
MUSIC_PAGE_URL=$WAITLIST_MUSIC_PAGE_URL download "$WAITLIST_MUSIC_URL" "$WAITLIST_MUSIC_FILE_NAME"
MUSIC_PAGE_URL=$SNEAKER_DROP_MUSIC_PAGE_URL download "$SNEAKER_DROP_MUSIC_URL" \
  "$SNEAKER_DROP_MUSIC_FILE_NAME"
download "$KENNEY_INTERFACE_SOUNDS_URL" kenney_interface-sounds.zip
download "$KENNEY_UI_AUDIO_URL" kenney_ui-audio.zip
download "$KENNEY_IMPACT_SOUNDS_URL" kenney_impact-sounds.zip
for pack in interface-sounds ui-audio impact-sounds; do
  unzip -q -o "$DOWNLOAD_DIRECTORY/kenney_$pack.zip" -d "$DOWNLOAD_DIRECTORY/kenney_$pack"
done

# The music, trimmed so a downbeat is at 0 s, then levelled (two-pass loudnorm, one linear gain) to
# MUSIC_LOUDNESS_LUFS. Every track then sits at the same level under the sound effects, so
# src/soundtrack.ts's effect volumes hold whichever track is in.
MUSIC_LOUDNESS_LUFS=-19
level_music() {
  local sourceFileName=$1 startSeconds=$2 durationSeconds=$3 outputFileName=$4
  local trimFilter="atrim=start=$startSeconds:duration=$durationSeconds,asetpts=PTS-STARTPTS"
  local measurement
  measurement=$(ffmpeg -nostdin -hide_banner -i "$DOWNLOAD_DIRECTORY/$sourceFileName" \
    -af "$trimFilter,loudnorm=I=$MUSIC_LOUDNESS_LUFS:TP=-1:LRA=20:print_format=json" -f null - 2>&1 |
    sed -n '/^{/,/^}/p')
  read_measurement() { sed -n "s/.*\"$1\" : \"\(.*\)\".*/\1/p" <<<"$measurement"; }
  ffmpeg -nostdin -v error -y -i "$DOWNLOAD_DIRECTORY/$sourceFileName" \
    -af "$trimFilter,loudnorm=I=$MUSIC_LOUDNESS_LUFS:TP=-1:LRA=20:measured_I=$(read_measurement input_i):measured_TP=$(read_measurement input_tp):measured_LRA=$(read_measurement input_lra):measured_thresh=$(read_measurement input_thresh):offset=$(read_measurement target_offset):linear=true" \
    "${TO_WAV[@]}" "$OUTPUT_DIRECTORY/$outputFileName"
}
level_music "$MUSIC_FILE_NAME" "$MUSIC_START_SECONDS" "$MUSIC_DURATION_SECONDS" music.wav
level_music "$WAITLIST_MUSIC_FILE_NAME" "$WAITLIST_MUSIC_START_SECONDS" \
  "$WAITLIST_MUSIC_DURATION_SECONDS" waitlist-music.wav

# The Sneaker drop film's clip A, cut exactly as approved (first part's tail and second part's head
# faded 15 ms, so the join on the downbeat doesn't click), then levelled like the others. The
# unlevelled cut stays in source/ for scripts/build-sneaker-drop-hits.py.
firstPartFadeOutStartSeconds=$(awk -v start="$SNEAKER_DROP_FIRST_PART_START_SECONDS" \
  -v end="$SNEAKER_DROP_FIRST_PART_END_SECONDS" 'BEGIN { printf "%.4f", end - start - 0.015 }')
ffmpeg -nostdin -v error -y -i "$DOWNLOAD_DIRECTORY/$SNEAKER_DROP_MUSIC_FILE_NAME" -filter_complex \
  "[0:a]atrim=$SNEAKER_DROP_FIRST_PART_START_SECONDS:$SNEAKER_DROP_FIRST_PART_END_SECONDS,asetpts=PTS-STARTPTS,afade=t=out:st=$firstPartFadeOutStartSeconds:d=0.015[x];
   [0:a]atrim=$SNEAKER_DROP_SECOND_PART_START_SECONDS,asetpts=PTS-STARTPTS,afade=t=in:d=0.015[y];
   [x][y]concat=n=2:v=0:a=1,afade=t=in:d=0.02[o]" \
  -map "[o]" "${TO_WAV[@]}" "$DOWNLOAD_DIRECTORY/drift-phonk-clip-a.wav"
# The whole clip is the film, so level all of it (a duration past its end keeps the tail).
level_music drift-phonk-clip-a.wav 0 31 sneaker-drop-music.wav

# Counter landings: a 50 ms tick.
ffmpeg -nostdin -v error -y -i "$DOWNLOAD_DIRECTORY/kenney_interface-sounds/Audio/tick_004.ogg" \
  "${TO_WAV[@]}" "$OUTPUT_DIRECTORY/sfx-tick.wav"
# Black/white flips: a soft impact, low-passed so it's a muted thump rather than a hit.
ffmpeg -nostdin -v error -y -i "$DOWNLOAD_DIRECTORY/kenney_impact-sounds/Audio/impactSoft_medium_002.ogg" \
  -af "lowpass=f=300:poles=2,lowpass=f=300:poles=2" "${TO_WAV[@]}" "$OUTPUT_DIRECTORY/sfx-thump.wav"
# The STOP and Confirm taps: a short, dry click.
ffmpeg -nostdin -v error -y -i "$DOWNLOAD_DIRECTORY/kenney_ui-audio/Audio/click2.ogg" \
  "${TO_WAV[@]}" "$OUTPUT_DIRECTORY/sfx-tap.wav"
# +10 STRIDE: one clean tone, generated here (no third-party source): the high note with a quiet
# low note under it, a 5 ms attack and a 1.2 s exponential decay.
ffmpeg -nostdin -v error -y -f lavfi \
  -i "aevalsrc='(0.8*sin(2*PI*$TONE_HIGH_HERTZ*t)+0.2*sin(2*PI*$TONE_LOW_HERTZ*t))*min(t/0.005\,1)*exp(-t/0.35)':s=$SAMPLE_RATE:d=1.4" \
  "${TO_WAV[@]}" "$OUTPUT_DIRECTORY/sfx-tone.wav"
# The waitlist film's "You're on the list.": the same tone, in its track's key.
ffmpeg -nostdin -v error -y -f lavfi \
  -i "aevalsrc='(0.8*sin(2*PI*$WAITLIST_TONE_HIGH_HERTZ*t)+0.2*sin(2*PI*$WAITLIST_TONE_LOW_HERTZ*t))*min(t/0.005\,1)*exp(-t/0.35)':s=$SAMPLE_RATE:d=1.4" \
  "${TO_WAV[@]}" "$OUTPUT_DIRECTORY/waitlist-sfx-tone.wav"

ls -1 "$OUTPUT_DIRECTORY"/*.wav
