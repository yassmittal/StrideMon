# Launch film: handoff (after STOP 3, 2026-10-06)

You're continuing StrideMon's launch film in `launch-video/`. The brief is
`docs/launch-video-prompt.md`: follow it from §5 (Sound) to §7 (Render and deliver), and its
STOP 4 and STOP 5. Gates 1–3 are done and approved.

## Rules that still apply

- **Never run any git command** (workspace and repo `CLAUDE.md`). Leave everything in the working tree.
- **Facts:** nothing goes on screen that isn't in `launch-video/FACTS.md` with a source. `src/content.ts`
  mirrors it. If you add or change a line, add its row to `FACTS.md` §9 first.
- **Never send a transaction.** Read-only `cast call` is fine.
- **Don't touch `website/`.** Don't post anything anywhere.
- **Motion rules:** brief §4 (three easings only, no bounce, hard cuts, black/off-white flips, lime only on dark,
  blue once, no glow or gradients). Follow Remotion's skills in `launch-video/.agents/skills`
  (`remotion-best-practices` routes to the rest).
- **Done means:** `bun run lint` at the repo root passes and `bunx tsc --noEmit` in `launch-video/` passes.

## What exists

- **Docs:** `RESEARCH.md`, `FOOTAGE.md` (shot log, exact in/out points, privacy pass), `FACTS.md`,
  `SCRIPT.md` (on-screen text in order, storyboard as built, changes from the brief and why).
- **Code** (named exports, Biome-clean):
  - `src/Root.tsx`: `Launch4x5`, `Launch16x9`, `Launch9x16`, scene compositions, `RunScreenCheck` still.
  - `src/LaunchFilm.tsx`: seven scenes in a `Series`, plus `<Audio>` from `src/soundtrack.ts`.
  - `src/beats.ts`: the grid. 120 BPM, 60 fps, 2700 frames, scene start beats.
  - `src/layouts.ts`: per format. 4:5 is final. 16:9 and 9:16 are final only for the earn scene and the
    end card; scenes 1, 2 and 4–6 there are first passes.
  - `src/content.ts`, `src/theme.ts`, `src/fonts.ts`.
  - `src/walk-ramp.ts`: the 1× → 8× → 1× map from film frames to source frames.
  - `src/scenes/*`, `src/components/*`. `RunScreen.tsx` is a vector rebuild of the run screen, checked
    within ±3 px against screenshot 03 by `scripts/check-run-screen-overlay.py`. `SneakerArt.tsx`
    animates the contract's own SVGs in `public/sneaker/`.
- **Footage:** `scripts/cut-footage.sh` makes the 60 fps BT.709 intermediates in `public/footage/`
  (gitignored) from `../website/media-source/`. Re-run it if they're missing.
- **Audio:** `public/audio/click-track.wav` (gitignored), a click on every beat. `src/soundtrack.ts`
  names the file the film plays.
- **Renders:** animatic at `out/animatic/stridemon-animatic-4x5.mp4` with contact sheets, and styleframes in
  `out/styleframes/`.
- **Preview:** `cd launch-video && bunx remotion studio`.

## Status (2026-10-06, at STOP 5)

Everything below is done and delivered. After STOP 4 Yash asked for two changes: make the film
as simple as possible (nobody knows StrideMon yet), and rename the token SOLE → STRIDE. The film
is now an intro, four numbered steps, "It's really yours." and the end card (`SCRIPT.md`,
revision 2; `FACTS.md` §1 and §9). Footage that shows the old name is out; the walk uses the
vector run-screen rebuild. Music (2026-10-07): Yash picked "Futuristic" by NastelBom (120 BPM, Content ID registered), trimmed
from 4.042 s; four alternatives are previewed in `out/previews/` (`CREDITS.md`). Render with `bash scripts/render.sh <format>`; see `README.md`.
The list below is the original plan, kept for reference.

## What's left

1. **Music: you choose it. Yash delegated the decision; don't ask him to pick.** Find a track on
   Pixabay Music (free commercial use, no attribution): minimal electronic, UK garage or minimal
   techno, 116–124 BPM, no vocals, a clear hit near 0:08 and a resolve near 0:38. Download it into
   `public/audio/`, confirm its licence on the track page, and measure its BPM and downbeats with
   ffmpeg onset analysis (`librosa` isn't installed; `pip install librosa` is fine if you prefer). You
   can't listen, so judge by the analysis:
   - steady tempo across the whole track
   - a strong onset or energy rise you can place on 0:08–0:11 (the STOP tap and the +10 SOLE flip)
   - a section that settles or drops energy for the end card at 0:38–0:45

   Then set `BEATS_PER_MINUTE` in `beats.ts` to the track (the picture stays 2700 frames; the end
   card absorbs the difference). Trim the track's start so a downbeat is at frame 0, and fade it out
   over the end card. Write down your choice and why in `CREDITS.md`, so Yash can swap it.
2. **SFX** (brief §5): CC0 only (Kenney UI packs, Freesound CC0). A soft tick on each counter landing, a
   low muted thump on each black/white flip, a tap on STOP (earn scene, beat 1) and on the MetaMask
   Confirm (upgrade scene, beat 8), and one clean tone on +10 SOLE landing (earn scene, beat 7). No
   whooshes, risers or coin sounds. Record each file's source and licence in `CREDITS.md`. The music
   ducks about 4 dB under the key SFX. Final mix: −14 LUFS integrated, −1 dBTP (two-pass
   `loudnorm`), AAC 48 kHz.
3. **Motion blur:** `@remotion/motion-blur` `HtmlInCanvasMotionBlur`, subtle (shutter about 180°, 6–8
   samples), only on the cold open's pull-back (`ColdOpenScene`, 36 frames from beat 4) and the 8×
   part of the walk ramp. Never on type at rest. If HTML-in-canvas fails in headless rendering, use
   another approach from the motion-blur guide, or skip it and say so.
4. **STOP 4:** render the full 4:5 film. Send Yash the render, a contact sheet (one frame every 0.5 s) and
   six full-size frames. Then re-lay 16:9 and 9:16 scenes 1, 2 and 4–6 (9:16 keeps the top 220 px and
   bottom 380 px free of text). Check every format's mid-shot frames for cut-off text, overlaps and
   safe-zone breaches.
5. **Render and deliver** (brief §7): `--codec h264 --crf 16 --pixel-format yuv420p --color-space bt709`, then
   remux with `-movflags +faststart`, AAC 320 kbps 48 kHz, BT.709 tags. Into `out/`:
   - `stridemon-launch-4x5.mp4`, `-16x9.mp4`, `-9x16.mp4`
   - a poster PNG per format (the last frame of the end card)
   - `stridemon-launch-thumbnail-1280x720.png`
   - `stridemon-launch-4x5-silent.mp4`

   Do the X compression test (re-encode the 4:5 at about 5 Mbps, check hairlines, "+" marks and dark
   banding, and readability at 390 px wide). `ffprobe` must show 60 fps, 2700 frames, the right sizes
   and −14 LUFS.
6. **`launch-video/README.md`:** install, preview, swap the music, re-time `beats.ts`, re-cut the footage,
   and the exact render commands per format.
7. **STOP 5:** report the files, sizes and durations, the three contact sheets, what changed from the
   storyboard (`SCRIPT.md` already lists the Gate 2 changes) and why, and a ready-to-paste two-line X
   post with the URL `stridemon.yashmittal.xyz` and no hashtag spam.

## Decisions already made (don't reopen them)

- The cold open timer is 1:53 → 1:56 (continuity with the walk footage).
- Scene 5 uses matched footage frames for the app and MonadVision.
- No speed-band card in the rules scene.
- `MONAD TESTNET • ANDROID DEMO`.
- No settlement time on screen.
- The STOP tap is cropped so the +15 estimate never shows.
- The phone frame has a 2 px ring on black.
