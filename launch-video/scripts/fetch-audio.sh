#!/usr/bin/env bash
# Downloads the film's music and sound effects and prepares them in public/audio/ (gitignored).
# Run from launch-video/: `bash scripts/fetch-audio.sh`. Needs curl, unzip and ffmpeg.
#
# Every source and licence is in CREDITS.md. To swap the music, change MUSIC_URL and
# MUSIC_START_SECONDS here (and BEATS_PER_MINUTE in src/beats.ts), then re-run.
set -euo pipefail

OUTPUT_DIRECTORY=public/audio
DOWNLOAD_DIRECTORY=$OUTPUT_DIRECTORY/source
SAMPLE_RATE=48000

# "I Am Techno" by DeltaX-Music, Pixabay Content License (CREDITS.md). 120 BPM.
MUSIC_PAGE_URL=https://pixabay.com/music/techno-trance-i-am-techno-539800/
MUSIC_URL='https://cdn.pixabay.com/download/audio/2026/05/23/audio_14fb5a2082.mp3?filename=deltax-music-i-am-techno-539800.mp3'
MUSIC_FILE_NAME=deltax-music-i-am-techno-539800.mp3
# A downbeat: the start of the last four bars of the breakdown. The kick comes back four bars
# later (56.045 s in the track), which lands on film frame 480, the earn scene's first beat.
MUSIC_START_SECONDS=48.045
# The film is 45 s; keep a little extra so the fade, not the file, ends the music.
MUSIC_DURATION_SECONDS=46

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
download "$KENNEY_INTERFACE_SOUNDS_URL" kenney_interface-sounds.zip
download "$KENNEY_UI_AUDIO_URL" kenney_ui-audio.zip
download "$KENNEY_IMPACT_SOUNDS_URL" kenney_impact-sounds.zip
for pack in interface-sounds ui-audio impact-sounds; do
  unzip -q -o "$DOWNLOAD_DIRECTORY/kenney_$pack.zip" -d "$DOWNLOAD_DIRECTORY/kenney_$pack"
done

# The music, trimmed so a downbeat is at 0 s.
ffmpeg -nostdin -v error -y -i "$DOWNLOAD_DIRECTORY/$MUSIC_FILE_NAME" \
  -af "atrim=start=$MUSIC_START_SECONDS:duration=$MUSIC_DURATION_SECONDS,asetpts=PTS-STARTPTS" \
  "${TO_WAV[@]}" "$OUTPUT_DIRECTORY/music.wav"

# Counter landings: a 50 ms tick.
ffmpeg -nostdin -v error -y -i "$DOWNLOAD_DIRECTORY/kenney_interface-sounds/Audio/tick_004.ogg" \
  "${TO_WAV[@]}" "$OUTPUT_DIRECTORY/sfx-tick.wav"
# Black/white flips: a soft impact, low-passed so it's a muted thump rather than a hit.
ffmpeg -nostdin -v error -y -i "$DOWNLOAD_DIRECTORY/kenney_impact-sounds/Audio/impactSoft_medium_002.ogg" \
  -af "lowpass=f=300:poles=2,lowpass=f=300:poles=2" "${TO_WAV[@]}" "$OUTPUT_DIRECTORY/sfx-thump.wav"
# The STOP and Confirm taps: a short, dry click.
ffmpeg -nostdin -v error -y -i "$DOWNLOAD_DIRECTORY/kenney_ui-audio/Audio/click2.ogg" \
  "${TO_WAV[@]}" "$OUTPUT_DIRECTORY/sfx-tap.wav"
# +10 SOLE: one clean tone, generated here (no third-party source). C6 with a quiet C5 under it,
# a 5 ms attack and a 1.2 s exponential decay. C is the track's tonic (chroma analysis, CREDITS.md).
ffmpeg -nostdin -v error -y -f lavfi \
  -i "aevalsrc='(0.8*sin(2*PI*1046.5*t)+0.2*sin(2*PI*523.25*t))*min(t/0.005\,1)*exp(-t/0.35)':s=$SAMPLE_RATE:d=1.4" \
  "${TO_WAV[@]}" "$OUTPUT_DIRECTORY/sfx-tone.wav"

ls -1 "$OUTPUT_DIRECTORY"/*.wav
