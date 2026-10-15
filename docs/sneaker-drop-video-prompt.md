# Sneaker Drop Video Prompt

The brief for the **Sneaker drop film**: a 30-second, beat-synced reel of StrideMon's Sneaker NFTs,
cut to a phonk track. It's a third composition in the launch film's Remotion project
(`launch-video/`), not a new project. Paste everything below the line into a fresh Claude Code
session started in the repo root (`monad/`).

## Why it's shaped this way (2026-10-14)

- **Entertainment, not explanation.** The launch film explains the game and the waitlist film sells
  the pass. This one gives people something to watch: the Sneakers hitting the beat. It has almost
  no words.
- **Sneakers only.** These are the 1,000 one-of-one Founder Sneaker designs, drawn by the contract.
  No pass cards, no app screens, no game rules.
- **The sync is the whole film.** Every change of Sneaker lands on a real hit in the music (a kick,
  a snare, a cowbell), measured from the audio and checked frame by frame. Nothing is placed by eye
  or at random.
- **The music is already picked** (Yash, 2026-10-14). It's "Drift Phonk" by Sub_Clair on Pixabay,
  cut to clip "A": a 2-bar build, the drop, one 8-bar section, then the track's own last bar, about
  30 s in all. The cut is below, down to the sample.
- **For X and YouTube.** The 4:5 version is for X and the 9:16 version for YouTube Shorts, built
  from one timeline.

## As built (2026-10-14)

The film is built and delivered (`launch-video/SCRIPT.md`, "The Sneaker drop film"). Where it
differs from the prompt below, and why, is in that section's "What changed from the brief". In
short:

- **The clip's three cut points sit 45 ms earlier** than the ones below (5.0149, 30.0139 and
  127.5096 s): every kick's attack starts about 35 ms before the measured grid, so the approved
  join fell inside a kick. The bars, their order and the beat timeline are unchanged
  (`launch-video/CREDITS.md`).
- **The hit map has a fifth kind, `stop`** (the silence before the drop, and the end), so the end
  card cuts on a named event.
- **The build follows the music** (it doesn't speed up to 16ths), **every shoe shares one scale**
  (not one height), **the drop holds #0137 for a bar**, **cowbells stamp the splits**, and **the
  Legendary is #0020 Earthshine**, whose Founder Sneaker picture is the only Legendary one in a
  committed file.

---

## The prompt

You're a senior motion designer and creative technologist: you cut sneaker-drop reels and music
videos where every cut lands on a hit, and you build every frame in code. You're making the
**Sneaker drop film for StrideMon** in **Remotion**. Your bar: someone watching with the sound on
feels every hit in the picture. With the sound off, it still looks like a designed piece, not a
slideshow.

Work in **gates**. At each **STOP**, show me the result and wait for my go-ahead. Never skip one.

### 0. Read first

- `CLAUDE.md` (repo rules). **Never run any git command.** Leave everything in the working tree.
- `launch-video/README.md`, `HANDOFF.md`, `CREDITS.md`, `FACTS.md`, then the code in
  `launch-video/src/`: `Root.tsx`, `layouts.ts`, `theme.ts`, `fonts.ts`, `components/`, and the
  whole `waitlist/` folder (`beats.ts`, `pass-art.ts`, `scenes/`). The waitlist film is the closest
  model: its own beat grid, its own content file, and shared components. Also read
  `scripts/fetch-audio.sh`, `scripts/copy-pass-art.sh`, `scripts/render.sh` and
  `scripts/contact-sheet.sh`. **Reuse before you write** (`MotionBlur`, `SneakerArt`, `MaskedRise`,
  `LabelRoll`, `Soundtrack`, …).
- `docs/launch-video-prompt.md` **§4 (Motion language)**: hard cuts, black/off-white flips, three
  easings, nothing bounces, lime only on dark, no glow, no gradients. It applies here, with one
  difference: this film may cut much faster (down to 16th notes in the flood, see §3).
- Remotion's skills in `launch-video/.agents/skills` (start with `remotion-best-practices`).
- `docs/architecture/design-system.md` and `apps/mobile/src/theme/`: the only colours and type.
- `social/voice.md`: the vocabulary and the **Never say** list. They apply to every word on screen.
- The Sneakers:
  - `docs/founding-pass-brief.md`: the templates, families, rarity, the Founder Sneaker, and
    Unlaced vs Laced.
  - `website/src/content/founding-pass-designs.ts`: every design's number, name, template, family
    and rarity.
  - `website/public/pass-art/laced/NNNN.svg`: **1,000 shoe drawings** (1000 × 600), the
    contract renderer's own output. These are the film's main material.
  - `packages/contracts/art/founding-pass/previews/` (`3-designs-*.png`, `7-legendaries.png`,
    `8-founder-sneakers.png`, `founder-sneaker-0137-*.svg`): overview sheets to choose from, and
    the full Founder Sneaker NFT image (the shoe on its dark square, with its header and stat
    rows) as `SneakerArtRenderer` draws it. Find out how those previews are built
    (`build-founding-pass-art.ts` / `generator/`). If you need the full NFT image for a design you
    picked, generate it the same way, read-only. Never edit art or generated data.

### 1. The music (already chosen: rebuild it exactly)

- **"Drift Phonk" by Sub_Clair**: https://pixabay.com/music/phonk-drift-phonk-607579/
  - File: `https://cdn.pixabay.com/download/audio/2026/09/21/audio_6f38020d16.mp3?filename=sub_clair-drift-phonk-607579.mp3`
    (2:12.6, 256 kbps). Pixabay's site returns 403 to curl, but the CDN downloads fine with
    `-e https://pixabay.com/` (as `fetch-audio.sh` already does).
  - Licence: **Pixabay Content License** (free commercial use, no attribution needed). Genre
    Phonk. Not marked AI generated, and not tagged Vocal.
  - **"Content ID Registered."** X has no Content ID. On YouTube, expect an automatic claim and
    clear it by disputing with the Pixabay licence. Write this in `CREDITS.md`, like the
    "Futuristic" entry.
- **The measured grid** (librosa beat tracking, then a linear fit over all 204 beats; worst beat
  15.8 ms off): **96.004 BPM**, first beat at **2.560 s** in the source. One beat is 0.62497 s,
  one bar (4 beats) is 2.49990 s. Source bar *n* starts at `2.560 + n × 2.49990` s.
- **The source's shape:** bars 0–1 are a quiet intro, bar 2 (7.56 s) is the build, and **bar 3
  (10.06 s) is the drop**, where the 808 comes in. After that the track runs in 8-bar sections of
  nearly flat loudness (a melody layer comes in at bar 11, and the bass pattern changes at bar
  19). The last full bar is **bar 50 (127.555 s)**: the music stops at about 130.05 s and its tail
  decays to silence by 132.6 s.
- **Clip A, the film's audio:** source **bar 1 → bar 11** (5.0599 s → 30.0589 s), then source
  **bar 50 → the end** (127.5546 s → 132.6 s), joined on the downbeat with 15 ms fades on each
  side of the join and a 20 ms fade-in at the very start. **30.04 s** in all. This is the cut
  Yash listened to and approved:

  ```bash
  ffmpeg -i sub_clair-drift-phonk-607579.mp3 -filter_complex \
    "[0:a]atrim=5.0599:30.0589,asetpts=PTS-STARTPTS,afade=t=out:st=24.9840:d=0.015[x]; \
     [0:a]atrim=127.5546,asetpts=PTS-STARTPTS,afade=t=in:d=0.015[y]; \
     [x][y]concat=n=2:v=0:a=1,afade=t=in:d=0.02[o]" -map "[o]" -ar 48000 drift-phonk-clip-a.wav
  ```

  Add it to `scripts/fetch-audio.sh` as a third film's music, levelled like the others, so a fresh
  clone can rebuild it. Before you build anything on it, check the join yourself: no level dip or
  click at 25.00 s, and the kick lands on the join.
- **The film's beat timeline** (60 fps, so one beat is 37.498 frames, rounded to the nearest frame
  per beat, as `waitlist/beats.ts` does):

  | Beats | Time | Frames | What the music does |
  |---|---|---|---|
  | 0–3 | 0.00–2.50 s | 0–150 | quiet intro bar |
  | 4–7 | 2.50–5.00 s | 150–300 | the build |
  | **8** | **5.00 s** | **300** | **the drop** |
  | 8–39 | 5.00–25.00 s | 300–1500 | eight bars at full energy (two 4-bar phrases) |
  | 40–43 | 25.00–27.50 s | 1500–1650 | the track's last bar (the join is on beat 40) |
  | 44 | 27.50 s | 1650 | the music stops; the tail decays to silence by 30.04 s (frame 1802) |

### 2. The hit map (build this before any picture)

The beat grid alone isn't enough: phonk at 96 BPM puts kicks, snares, claps and cowbells on
different 8ths and 16ths, and the cuts have to follow the hits you **hear**. So:

1. Analyse `drift-phonk-clip-a.wav` with librosa in a throwaway venv (in your scratchpad, not the
   repo). Split it into bands and detect onsets in each one: **kick/808** (< 150 Hz), **snare/clap**
   (about 1–5 kHz, broadband), **cowbell/melody** (tonal, about 400–1500 Hz), and **hats**
   (> 6 kHz). Snap every onset to the nearest 16th of the grid, and flag any that are more than
   one frame away from it.
2. Write it out as `launch-video/src/sneaker-drop/hits.ts`: a typed list of `{ frame, kind,
   strength }`, plus a comment describing the per-bar pattern you found (which 16ths carry the
   kick, the snare and the cowbell, and where the fills are, especially the end of each 4-bar
   phrase). The script that made it goes in `launch-video/scripts/` so it can be run again.
3. Render a **sync check**: a plain composition that flashes a block per hit kind on the timeline
   over the audio. Watch it with sound and confirm the flashes sit on the hits. Every cut in the
   film is placed by **naming a hit from this map**, never a hand-typed frame.

### 3. Shape (a starting point: improve it, then defend your version at STOP 1)

**Shoes only, almost no words.** The words allowed are the design number and name in small mono
(`#0542 NACREOUS`) on a few hero shots, at most one short line, and the end card. Every word
has a row in `FACTS.md` (a new section for this film) **before** it goes on screen.

| # | Beats | Idea |
|---|---|---|
| 1 | 0–3 | **Cold open.** On black, one shoe line-draws itself in white strokes, slowly, with the quiet bar. Frame 1 already shows strokes: it's the X thumbnail, so no fade from black. |
| 2 | 4–7 | **The build.** Shoes flash in faster and faster: one per beat, then 8ths, then 16ths on beat 7, shrinking or strobing. Tension, not information. |
| 3 | 8 | **The drop.** A hard flip to a full-bleed hero shoe, big, on the kick. The biggest frame in the film. |
| 4 | 8–23 | **One shoe per hit** (first 4-bar phrase). Hard cuts on the kicks and snares from the hit map. The background flips black/off-white on the downbeats. Small moves land on the cowbell (a 2–4% scale punch, a nudge), never on nothing. |
| 5 | 24–39 | **It escalates** (second 4-bar phrase). The cuts go to every 8th, then the screen splits (2 → 4 → 9 shoes stamping in on hits), and the phrase ends in **the flood**: on 16ths, the grid fills out to all 1,000 shoes, tiny, on the bar before the join. |
| 6 | 40–43 | **The rare one.** Out of the flood to a single Legendary, alone and huge, on the join's kick. Its number and name roll in. Optionally, its real Founder Sneaker NFT image (the dark square with its header and stats) on beat 42, so viewers see it's a token. |
| 7 | 44 → end | **The music stops, and the end card cuts in on the silence**: the StrideMon wordmark, `stridemon.xyz`, `MONAD TESTNET`. It holds through the tail (about 2.5 s) and is the poster frame. |

Rules that make the sync feel designed:

- **Register every shoe.** Put each one on the same ground line, with the heel at the same x and
  the same height on screen, so that a hard cut from one design to the next reads as one Sneaker
  changing on the beat, not a slideshow. The ten templates have different silhouettes: align them
  by ground and heel, and test it in the sync check before choosing designs.
- **The hit decides the move.** A kick is a cut or a flip, a snare is a cut, a cowbell is a small
  punch or nudge, and a hat only moves things in the flood. Decide the mapping once, write it in
  the content file, and use it the same way everywhere.
- **Pick the order of shoes on purpose.** Use a seeded script (like the waitlist grid's) so that no
  two shoes in a row share a template or a family, the colours alternate light and dark, and the
  rarer designs come later. **Save the 10 Legendaries (the Prism family) for scene 6**, and keep
  them out of the single-shoe cuts before it (the flood may include them). Record the chosen
  numbers and the reason in `src/sneaker-drop/sneakers.ts`.
- **The flood must render fast.** Don't put 1,000 live SVGs in one frame. Rasterise the shoes once
  into a sprite atlas (`rsvg-convert` is installed), generated by a script into a gitignored
  folder, and use the atlas only for the grid shots. The single-shoe shots stay vector.
- **Never a dead frame,** and never a cut that's off the hit map.

**Never on screen:** a price, worth, value, floor, "mint", "drop date", airdrop, whitelist, "limited",
"don't miss out", any date, a STRIDE amount, mainnet, or a store badge. Nothing about the
Founding Pass beyond what scene 6 needs. **The 1,000 designs are frozen** (`DESIGNS_FROZEN_ON`):
animate them (draw their strokes, scale, move, cut, mask them), but never edit a path or colour, and
never invent a design that isn't in the table.

### 4. Build

- New compositions in `launch-video/src/Root.tsx`: `SneakerDrop4x5` (1080 × 1350, the **master**,
  for X) and `SneakerDrop9x16` (1080 × 1920, for YouTube Shorts), both 60 fps and 1802 frames,
  from **one timeline**. Re-lay out the 9:16 version per format, the way `layouts.ts` handles the
  launch film: the shoes get bigger and the type moves. Don't just crop the 4:5. Add a
  `SneakerDropSync` (the sync check) and a `SneakerDropScenes-4x5` folder with each scene on its
  own.
- Code in `launch-video/src/sneaker-drop/`: `beats.ts`, `hits.ts`, `sneakers.ts`, `content.ts`,
  `layout.ts`, `scenes/`. Shared components stay shared. **Don't change how the other two films look
  or sound:** if you touch a shared component, render their scenes again and compare.
- Load the shoe SVGs from `website/public/pass-art/laced/` with a copy script (like
  `copy-pass-art.sh`) into `launch-video/public/` (gitignored). Never edit anything in `website/`
  or `packages/`.
- **Music only, no sound effects.** The track has its own hits, and SFX on top would fight the sync.
  Extend `scripts/render.sh` (`sneaker-drop-4x5`, `sneaker-drop-9x16`) with the same picture
  settings, the limiter, two-pass loudnorm to **−14 LUFS / −1 dBTP**, and BT.709 tags.
- Colours and type come only from `theme.ts` and `fonts.ts`. No raw hex anywhere else.

**STOP 1:** the hit map (`hits.ts` plus the per-bar pattern in plain words), the sync-check mp4,
your storyboard as you'll build it (every scene by beat and frame, which hit drives which move),
the design numbers you picked and why, and **four styleframes** at 1080 × 1350: the cold open, the
drop, the flood and the Legendary.

**STOP 2:** the 4:5 animatic with real art and the music (`launch-video/out/animatic/`), and a
contact sheet. Also a **cut-sync report**: detect every cut in the render (ffmpeg
`select='gt(scene,0.3)'` with `showinfo`), match each one to the hit map, and list any cut that's
more than one frame off a hit. The report has to come back clean.

**STOP 3:** the finished 4:5 and 9:16 after polish (timing, eases, the mix), with the cut-sync
report run again on both.

### 5. Deliver

- `launch-video/out/stridemon-sneaker-drop-4x5.mp4` and `-9x16.mp4`: H.264, yuv420p, BT.709,
  60 fps, AAC 48 kHz, −14 LUFS, −1 dBTP, `+faststart`. Plus a `-poster.png` (the end card) for
  each, and a 4:5 `-silent.mp4`.
- Check them the way they'll play: the 4:5 file under 140 s and 512 MB, and the first frame is a
  good X thumbnail. The 9:16 file is under 60 s, and nothing important sits in the bottom ~20% or
  the right edge, where the YouTube Shorts buttons cover it.
- Draft one @stridemon post in `social/posts/` (following `social/voice.md`, `approved:` left
  empty), with `media` pointing at the 4:5 mp4 and alt text that says what the film shows. Also
  draft a short YouTube Shorts title and description in the same file.
- Update `launch-video/README.md` (the new commands), `SCRIPT.md` (this film's storyboard),
  `FACTS.md` and `CREDITS.md`.
- **Done means:** `bunx tsc --noEmit` in `launch-video/` passes, `bun run lint` at the repo root
  passes, the cut-sync report is clean on both formats, and the launch and waitlist films still
  render unchanged.

**Never:** run git, post or schedule anything on X or YouTube, send a transaction, or edit
`website/`, `packages/` or any generated art.
