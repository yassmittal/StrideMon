#!/usr/bin/env bash
# The One thing film's media (docs/one-thing-video-prompt.md). Run from launch-video/:
# `bash scripts/copy-one-thing-media.sh`. Needs ffmpeg and uv.
#
#   1. The reference, ../menWantOneThing.mp4 (untracked), copied to public/one-thing/reference.mp4:
#      the film plays its frames 0–154 as the hook.
#   2. #0137's laced Sneaker and its Founding Pass card, copied as they are from the website's art
#      to public/one-thing/. Never edited: DESIGNS_FROZEN_ON.
#   3. Its soundtrack, to public/audio/one-thing-soundtrack.wav. Unlicensed (CREDITS.md).
# Read only: nothing in website/ changes. public/one-thing/ and public/audio/ are gitignored.
set -euo pipefail

REFERENCE_FILE=../menWantOneThing.mp4
PASS_ART_DIRECTORY=../website/public/pass-art
OUTPUT_DIRECTORY=public/one-thing
STEMS_DIRECTORY=$OUTPUT_DIRECTORY/stems

# The soundtrack, in the reference's seconds:
#   - The reference's own mix up to 5.08 s: the hook's voice ("…it's not love,") and its music. Its
#     second voice ("it's 418 square meters of land") starts just after.
#   - Then its music alone (demucs, htdemucs_ft, the voice taken out) from 5.08 s: the beat drops on
#     the cut at 5.16 s, under "STRIDEMON".
#   - The music repeats every 2.405 s (two bars, measured by its own spectral self-similarity). It
#     plays up to an onset at 12.22 s, just before the reference ends, then two more periods from
#     7.41 s, so it carries the end card, and fades out over its last half second.
# 10 ms crossfades at each join.
SOUNDTRACK_FILTER="[0:a]atrim=0:5.08,asetpts=PTS-STARTPTS[hook];\
[1:a]atrim=5.08:12.22,asetpts=PTS-STARTPTS[reveal];\
[2:a]atrim=7.41:11.66,asetpts=PTS-STARTPTS[loop];\
[hook][reveal]acrossfade=d=0.01:c1=tri:c2=tri[joined];\
[joined][loop]acrossfade=d=0.01:c1=tri:c2=tri,afade=t=out:st=15.85:d=0.5[soundtrack]"

if [ ! -s "$REFERENCE_FILE" ]; then
  echo "No $REFERENCE_FILE: the One thing film's hook and soundtrack can't be made." >&2
  exit 1
fi

mkdir -p "$OUTPUT_DIRECTORY" "$STEMS_DIRECTORY" public/audio
cp "$REFERENCE_FILE" "$OUTPUT_DIRECTORY/reference.mp4"
cp "$PASS_ART_DIRECTORY/laced/0137.svg" "$OUTPUT_DIRECTORY/sneaker-0137.svg"
cp "$PASS_ART_DIRECTORY/cards/0137.svg" "$OUTPUT_DIRECTORY/pass-card-0137.svg"

ffmpeg -nostdin -v error -y -i "$REFERENCE_FILE" -vn -c:a pcm_s16le -ar 44100 -ac 2 \
  "$STEMS_DIRECTORY/reference.wav"
# On the CPU: MPS refuses one of htdemucs_ft's convolutions. About a minute.
uv run --no-project --python 3.11 --with demucs --with "torch<2.6" --with "torchaudio<2.6" \
  --with soundfile python -I -m demucs -d cpu --two-stems=vocals -n htdemucs_ft \
  -o "$STEMS_DIRECTORY" "$STEMS_DIRECTORY/reference.wav"
MUSIC_FILE=$STEMS_DIRECTORY/htdemucs_ft/reference/no_vocals.wav

# The music is read twice, once per piece: one input split two ways stalls acrossfade.
ffmpeg -nostdin -v error -y -i "$STEMS_DIRECTORY/reference.wav" -i "$MUSIC_FILE" -i "$MUSIC_FILE" \
  -filter_complex "$SOUNDTRACK_FILTER" -map "[soundtrack]" \
  -c:a pcm_s16le -ar 48000 -ac 2 public/audio/one-thing-soundtrack.wav
echo "Copied the reference and #0137's art, and made the soundtrack."
