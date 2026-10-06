# StrideMon launch film

A 45-second launch film for StrideMon, built in [Remotion](https://www.remotion.dev) on Bun, in three
formats: 4:5 (1080 × 1350, the master), 16:9 (1920 × 1080) and 9:16 (1080 × 1920). It's a separate
project with its own `package.json` and `bun.lock`, not a Bun workspace.

- `SCRIPT.md`: the storyboard and every line on screen.
- `FACTS.md`: the source for every word and number (nothing goes on screen without a row there).
- `CREDITS.md`: the music and sound effects, their sources and licences.
- `FOOTAGE.md`: the shot log of the screen recordings.

## Install

```bash
cd launch-video
bun install
bash scripts/cut-footage.sh   # public/footage/ from ../website/media-source/ (needs ffmpeg)
bash scripts/fetch-audio.sh   # public/audio/: the music and sound effects (needs curl, unzip, ffmpeg)
```

`public/footage/`, `public/audio/` and `out/` are gitignored, so a fresh clone needs both scripts.
The raw recordings in `../website/media-source/` are gitignored too.

## Preview

```bash
bunx remotion studio
```

`Launch4x5`, `Launch16x9` and `Launch9x16` are the whole film; `Scenes-4x5` has each scene on its
own. Motion blur (the walk's fast stretch) needs Chrome 149+ with
`chrome://flags/#canvas-draw-element` to show in the Studio; renders don't need it.

## Render

One command per format renders the picture and the mix, normalises the loudness and writes the
delivery files into `out/`:

```bash
bash scripts/render.sh 4x5    # out/stridemon-launch-4x5.mp4, -4x5-poster.png, -4x5-silent.mp4
bash scripts/render.sh 16x9   # out/stridemon-launch-16x9.mp4, -16x9-poster.png
bash scripts/render.sh 9x16   # out/stridemon-launch-9x16.mp4, -9x16-poster.png
```

What `render.sh` runs (shown for 4:5):

```bash
bunx remotion render Launch4x5 out/work/4x5-picture.mp4 \
  --codec h264 --crf 16 --pixel-format yuv420p --color-space bt709 --muted
bunx remotion render Launch4x5 out/work/4x5-mix.wav --codec wav
# Measure, raise by the gap to −14 LUFS, and limit the few peaks that land on a kick.
ffmpeg -i out/work/4x5-mix.wav -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -f null -
ffmpeg -i out/work/4x5-mix.wav \
  -af "volume=<−14 − input_i>dB,aresample=192000,alimiter=limit=0.841:attack=1:release=60:level=false,aresample=48000" \
  out/work/4x5-mix-limited.wav
# Two-pass loudnorm on that: measure again, then apply as one linear gain to −14 LUFS, −1 dBTP.
ffmpeg -i out/work/4x5-mix-limited.wav -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -f null -
ffmpeg -i out/work/4x5-mix-limited.wav \
  -af "loudnorm=I=-14:TP=-1:LRA=11:measured_I=…:measured_TP=…:measured_LRA=…:measured_thresh=…:offset=…:linear=true,aresample=48000" \
  out/work/4x5-mix-normalised.wav
# Mux: the picture copied, BT.709 written into the stream and the container, AAC 320 kbps 48 kHz.
ffmpeg -i out/work/4x5-picture.mp4 -i out/work/4x5-mix-normalised.wav -map 0:v:0 -map 1:a:0 -c:v copy \
  -bsf:v h264_metadata=video_full_range_flag=0:colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1 \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv \
  -c:a aac -b:a 320k -ar 48000 -ac 2 -movflags +faststart out/stridemon-launch-4x5.mp4
bunx remotion still Launch4x5 out/stridemon-launch-4x5-poster.png --frame=2699 --image-format=png
```

Contact sheets (one frame every 0.5 s, 15 s per sheet):

```bash
bash scripts/contact-sheet.sh out/stridemon-launch-4x5.mp4 out/sheets-4x5
```

The YouTube thumbnail (`out/stridemon-launch-thumbnail-1280x720.png`) is the 16:9 frame 1340
(+10 STRIDE), scaled:

```bash
bunx remotion still Launch16x9 out/work/thumbnail-1920.png --frame=1340 --image-format=png
ffmpeg -i out/work/thumbnail-1920.png -vf scale=1280:720:flags=lanczos out/stridemon-launch-thumbnail-1280x720.png
```

## Swap the music

1. Put the new track's URL, file name and start point in `scripts/fetch-audio.sh`
   (`MUSIC_URL`, `MUSIC_FILE_NAME`, `MUSIC_START_SECONDS`). The start must be a downbeat, chosen so
   the track's big hit lands where you want it (it's on frame 600, the walk, today).
2. Set `BEATS_PER_MINUTE` in `src/beats.ts` to the track's tempo (next section).
3. Run `bash scripts/fetch-audio.sh`, preview, and record the track and why in `CREDITS.md`.
4. Re-render. `render.sh` prints the normalisation type (it should say linear) and the final
   loudness. If the limiter has to work hard on a new track, lower the loudest effect in
   `src/soundtrack.ts` rather than the ceiling.

## Re-time `beats.ts`

Everything that moves sits on the grid in `src/beats.ts`: `BEATS_PER_MINUTE`, and each scene's
start in beats (`sceneStartBeats`). Inside a scene, timings are beats too (`toSceneBeatFrame`), and
`src/sound-cues.ts` derives every sound effect from the same beats, so the sound follows the picture.

- Change `BEATS_PER_MINUTE` to fit a new track. The film stays 2700 frames (45 s); the end card
  absorbs the difference.
- Move a scene by changing its start beat. Keep cuts on whole beats.
- After a change, preview the walk (its speed ramp in `src/walk-ramp.ts` depends on the scene's
  length) and check the reading times in `SCRIPT.md`.

## Re-cut the footage

The film uses one clip: the STOP tap (`public/footage/stop-tap.mp4`). `scripts/cut-footage.sh`
cuts it from `../website/media-source/video2.mp4` to a constant 60 fps, BT.709 intermediate, with
the status bar painted over. In and out points are in the script and in `FOOTAGE.md`. Every
other recording shows the token's old name (SOLE), which is why the walk uses the vector rebuild
of the run screen (`src/components/RunScreen.tsx`) instead.

## Checks

```bash
bunx tsc --noEmit       # in launch-video/
cd .. && bun run lint   # Biome, at the repo root
```
