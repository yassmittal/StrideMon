# StrideMon launch film (and the other films)

A 45-second launch film for StrideMon, built in [Remotion](https://www.remotion.dev) on Bun, in three
formats: 4:5 (1080 × 1350, the master), 16:9 (1920 × 1080) and 9:16 (1080 × 1920). It's a separate
project with its own `package.json` and `bun.lock`, not a Bun workspace.

- `SCRIPT.md`: the storyboard and every line on screen.
- `FACTS.md`: the source for every word and number (nothing goes on screen without a row there).
- `CREDITS.md`: the music and sound effects, their sources and licences.
- `FOOTAGE.md`: the shot log of the screen recordings.

The same project also holds the **Founding Pass waitlist film** (`Waitlist4x5`, 22.7 s, 4:5), from
`docs/waitlist-video-prompt.md`: its code is in `src/waitlist/`, its script in `SCRIPT.md`, its facts
in `FACTS.md` §12 and its music in `CREDITS.md`. It shares the theme, fonts, components and the
render pipeline; its beat grid is its own (`src/waitlist/beats.ts`, 124.052 BPM).

The **Sneaker drop film** (`SneakerDrop4x5` for X, `SneakerDrop9x16` for YouTube Shorts, 30 s, 60
fps), from `docs/sneaker-drop-video-prompt.md`: the Founder Sneaker designs cut to "Drift Phonk",
every change on a hit measured from the music. Its code is in `src/sneaker-drop/`, its storyboard in
`SCRIPT.md`, its facts in `FACTS.md` §13 and its music in `CREDITS.md`. Music only, no sound effects.

The **Pass chat film** (`PassChat16x9`, 1920 × 1080, 60 fps, 11.7 s), from
`docs/pass-chat-video-prompt.md`: a group chat on a lime 3D phone in the sky picks #0627, the
phone spins into a card where it floats in the same sky, ten other passes' sneakers burst out, and
it ends on "This isn’t a JPEG." It copies the motion of a reference clip closely (measured in
`src/pass-chat/reference.md`). Its code is in `src/pass-chat/` (every frame named once in
`timeline.ts`), its storyboard in `SCRIPT.md`, its facts in `FACTS.md` §14, and its sky, font,
music and effects in `CREDITS.md`. It's set to "Brazilian Phonk", up front: the drop lands on the
spin's whip and the music stops dead on the flip to black.

The **Metropolis pitch video** (`Pitch16x9`, 1920 × 1080, 30 fps, about 1:24) lives here too:
Yash's voiceover over the submission reel, one scene per part of the script, captions burned in.
Its code is in `src/pitch/`, its words in `src/pitch/script.ts`, and it is cut to the voice's
timing in `src/pitch/voice-timing.json`. To re-record it:

```bash
bun scripts/pitch-voice.ts recording <take.m4a>   # public/pitch/voice.wav: cleaned, −16 LUFS
# Transcribe public/pitch/voice.wav with mlx-whisper (word timestamps) into words.json, then:
bun scripts/pitch-voice.ts words words.json        # src/pitch/voice-timing.json
bash scripts/render-pitch.sh preview               # out/pitch/preview-lowres.mp4 + contact sheets
bash scripts/render-pitch.sh final                 # out/pitch/stridemon-pitch-16x9.mp4
```

`bun scripts/pitch-voice.ts say` makes a scratch track with macOS `say` instead. The raw take is
`../website/media-source/yash-pitch-voice.ogg`; `public/pitch/` (gitignored) holds the cleaned voice,
the music bed and a copy of `../website/media-source/submission-reel.mp4`.

## Install

```bash
cd launch-video
bun install
bash scripts/cut-footage.sh   # public/footage/ from ../website/media-source/ (needs ffmpeg)
bash scripts/fetch-audio.sh   # public/audio/: both films' music and sound effects (needs curl, unzip, ffmpeg)
bash scripts/copy-pass-art.sh # public/pass-art/: the Founding Pass art the waitlist film shows (needs bun)
bash scripts/copy-sneaker-drop-art.sh # public/pass-art/: the Sneaker drop film's 1,000 laced Sneakers,
                                      # #0020's Founder Sneaker picture and the flood's atlas (needs rsvg-convert, ffmpeg)
bash scripts/copy-pass-chat-art.sh    # public/pass-chat/: every gallery card's shoe, cropped, and the sky (needs bun, ffmpeg)
```

`public/footage/`, `public/audio/`, `public/pass-art/`, `public/pass-chat/` and `out/` are
gitignored, so a fresh clone needs all five scripts. The Pass chat film's sky photo is the one
file a script can't download (Pixabay serves the original only through its page's Download
button): `copy-pass-chat-art.sh` says where to save it and checks its SHA-256. `copy-pass-art.sh` only reads `../website/public/pass-art/cards/` and
`../packages/contracts/art/founding-pass/previews/`; the designs it copies are listed in
`src/waitlist/pass-art.ts`.
The raw recordings in `../website/media-source/` are gitignored too.

## Preview

```bash
bunx remotion studio
```

`Launch4x5`, `Launch16x9` and `Launch9x16` are the whole film; `Scenes-4x5` has each scene on its
own. `Waitlist4x5` is the waitlist film, and `WaitlistScenes-4x5` has its five scenes.
`SneakerDrop4x5` and `SneakerDrop9x16` are the Sneaker drop film, `SneakerDropScenes-4x5` has its
six scenes, and `Checks/SneakerDropSync` is its sync check (a flash per hit over the music).
`PassChat16x9` is the Pass chat film, and `PassChatScenes-16x9` has its eight scenes.
Motion blur (the walk's fast stretch) needs Chrome 149+ with
`chrome://flags/#canvas-draw-element` to show in the Studio; renders don't need it.

## Render

One command per format renders the picture and the mix, normalises the loudness and writes the
delivery files into `out/`:

```bash
bash scripts/render.sh 4x5    # out/stridemon-launch-4x5.mp4, -4x5-poster.png, -4x5-silent.mp4
bash scripts/render.sh 16x9   # out/stridemon-launch-16x9.mp4, -16x9-poster.png
bash scripts/render.sh 9x16   # out/stridemon-launch-9x16.mp4, -9x16-poster.png
bash scripts/render.sh waitlist-4x5   # out/stridemon-waitlist-4x5.mp4, -poster.png, -silent.mp4
bash scripts/render.sh sneaker-drop-4x5   # out/stridemon-sneaker-drop-4x5.mp4, -poster.png, -silent.mp4
bash scripts/render.sh sneaker-drop-9x16  # out/stridemon-sneaker-drop-9x16.mp4, -poster.png
bash scripts/render.sh pass-chat-16x9     # out/stridemon-pass-chat-16x9.mp4, -poster.png, -silent.mp4
```

The Pass chat film's poster is its last frame, 701 (the end card), and its limiter sits a dB lower
than the others' (`LIMITER_CEILING_LINEAR=0.708` in `render.sh`). `--audio-only` after a format
re-renders just the sound onto the last picture.

The Sneaker drop film's poster is its last frame, 1801 (the end card). After rendering, check
every cut against the hit map (it exits non-zero if one is more than a frame off):

```bash
bun scripts/check-sneaker-drop-cuts.ts out/stridemon-sneaker-drop-4x5.mp4        # the brief's 0.3
bun scripts/check-sneaker-drop-cuts.ts out/stridemon-sneaker-drop-4x5.mp4 0.05   # partial-frame cuts too
```

The waitlist film goes through exactly the same steps as below, with `Waitlist4x5` and its last
frame, 1363, for the poster.

What `render.sh` runs (shown for 4:5):

```bash
bunx remotion render Launch4x5 out/work/4x5-picture.mp4 \
  --codec h264 --crf 16 --pixel-format yuv420p --color-space bt709 --muted
bunx remotion render Launch4x5 out/work/4x5-mix.wav --codec wav
# Measure, raise by the gap to −14 LUFS, and limit the few peaks that land on a kick.
ffmpeg -i out/work/4x5-mix.wav -af loudnorm=I=-14:TP=-1:LRA=20:print_format=json -f null -
ffmpeg -i out/work/4x5-mix.wav \
  -af "volume=<−14 − input_i>dB,aresample=192000,alimiter=limit=0.794:attack=1:release=60:level=false,aresample=48000" \
  out/work/4x5-mix-limited.wav
# Two-pass loudnorm on that: measure again, then apply as one linear gain to −14 LUFS, −1 dBTP.
ffmpeg -i out/work/4x5-mix-limited.wav -af loudnorm=I=-14:TP=-1:LRA=20:print_format=json -f null -
ffmpeg -i out/work/4x5-mix-limited.wav \
  -af "loudnorm=I=-14:TP=-1:LRA=20:measured_I=…:measured_TP=…:measured_LRA=…:measured_thresh=…:offset=…:linear=true,aresample=48000" \
  out/work/4x5-mix-normalised.wav
# Mux: the picture copied, BT.709 written into the stream and the container, AAC 320 kbps 48 kHz.
ffmpeg -i out/work/4x5-picture.mp4 -i out/work/4x5-mix-normalised.wav -map 0:v:0 -map 1:a:0 -c:v copy \
  -bsf:v h264_metadata=video_full_range_flag=0:colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1 \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv \
  -c:a aac -b:a 320k -ar 48000 -ac 2 -movflags +faststart out/stridemon-launch-4x5.mp4
bunx remotion still Launch4x5 out/stridemon-launch-4x5-poster.png --frame=2699 --image-format=png
```

Contact sheets (one frame every 0.5 s, 15 s per sheet, as many sheets as the video needs):

```bash
bash scripts/contact-sheet.sh out/stridemon-launch-4x5.mp4 out/sheets-4x5
bash scripts/contact-sheet.sh out/stridemon-waitlist-4x5.mp4 out/sheets-waitlist-4x5
```

The YouTube thumbnail (`out/stridemon-launch-thumbnail-1280x720.png`) is the 16:9 frame 1340
(+10 STRIDE), scaled:

```bash
bunx remotion still Launch16x9 out/work/thumbnail-1920.png --frame=1340 --image-format=png
ffmpeg -i out/work/thumbnail-1920.png -vf scale=1280:720:flags=lanczos out/stridemon-launch-thumbnail-1280x720.png
```

## Swap the music

1. Put the new track's URL, file name, start point and key in `scripts/fetch-audio.sh`
   (`MUSIC_URL`, `MUSIC_FILE_NAME`, `MUSIC_START_SECONDS`, and `TONE_HIGH_HERTZ`/`TONE_LOW_HERTZ` for
   the +10 STRIDE tone). The script levels every track to −19 LUFS, so the effects stay balanced. The start must be a downbeat, chosen so
   the track's big hit lands where you want it (it's on frame 600, the walk, today).
2. Set `BEATS_PER_MINUTE` in `src/beats.ts` to the track's tempo (next section).
3. Run `bash scripts/fetch-audio.sh`, preview, and record the track and why in `CREDITS.md`.
4. Re-render. `render.sh` prints the normalisation type (it should say linear) and the final
   loudness. If the limiter has to work hard on a new track, lower the loudest effect in
   `src/soundtrack.ts` rather than the ceiling.

### The waitlist film's music

The same steps with the `WAITLIST_` variables in `scripts/fetch-audio.sh` (`WAITLIST_MUSIC_URL`,
`WAITLIST_MUSIC_START_SECONDS`, `WAITLIST_TONE_*_HERTZ`) and `WAITLIST_BEATS_PER_MINUTE` in
`src/waitlist/beats.ts`. The start must put the track's hit on frame 174 (beat 6, the flip into the
collection). A new tempo changes the film's length: set `WAITLIST_LAST_FRAME` in `render.sh` to the
new last frame. `CREDITS.md` has the two runners-up with their starts.

## The Sneaker drop film's music, hit map and designs

Everything it cuts on comes from the music, so a change starts there:

1. **The clip:** the `SNEAKER_DROP_` variables in `scripts/fetch-audio.sh` (`CREDITS.md` has why the
   cut points sit 45 ms before the approved ones). Run it.
2. **The hit map:** `uv run --no-project --with librosa==1.0.0 python scripts/build-sneaker-drop-hits.py`
   measures every kick, clap, cowbell, hat and stop on the 16th grid and writes
   `src/sneaker-drop/hits.ts` (never edit it). It prints the per-bar pattern and flags any hit more
   than a frame off its 16th. If the pattern changes, rewrite `PATTERN_IN_WORDS` in the script.
3. **The designs:** `bun scripts/pick-sneaker-drop-designs.ts` (after `copy-sneaker-drop-art.sh`)
   writes `src/sneaker-drop/sneakers.ts`. Its part counts must match what `timeline.ts` uses up,
   or the film throws and says by how much.
4. `src/sneaker-drop/timeline.ts` names each move's hit; `content.ts` holds the mapping.

## The Pass chat film's music, effects and designs

- **The music:** the `PASS_CHAT_MUSIC_` variables in `scripts/fetch-audio.sh`. The start must put
  the track's drop on film frame 336 (the spin's whip): `PassChatSoundtrack.tsx` plays the file to
  the flip (488), stops, and plays it again from that same frame 336 as "a JPEG." slides in (543).
  `CREDITS.md` has two runners-up with their starts.
- **The effects:** each is trimmed in `fetch-audio.sh` to start on its sound; `src/pass-chat/sound-cues.ts`
  has each file's hit frame and gain, and places it from `timeline.ts`.
- **The designs:** `bun scripts/pick-pass-chat-designs.ts` writes `src/pass-chat/sneakers.ts` (the
  hero, #0627, and the ten burst designs, checked unminted on the collection endpoint).
- **The handwritten "isn’t":** `scripts/build-pass-chat-handwriting.py` (its first lines have the
  `uv run` command) writes `src/pass-chat/handwriting-glyphs.ts` from the Knewave font (never edit
  it). `src/pass-chat/handwriting.ts` draws the pen's strokes over it.

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
