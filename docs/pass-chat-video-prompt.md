# Pass Chat Video Prompt

The brief for the **Pass chat film**: an 11-second, 16:9 clip for the Founding Pass. A group chat
on a lime phone, floating in a blue sky, talks about the passes. The phone spins away into a card
where the chosen Sneaker floats in the same sky. Other Sneakers burst out of the card, and it ends
on "This isn't a JPEG." It's a fourth composition in the launch film's Remotion project
(`launch-video/`), not a new project. Paste everything below the line into a fresh Claude Code
session started in the repo root (`monad/`).

## Why it's shaped this way (2026-10-16)

- **It copies a reference's motion, closely.** `demo.mp4` at the repo root is a 7.5 s third-party
  clip (1920 × 1080, 30 fps, **no sound**: its audio track is silent) that Yash wants matched "almost
  exactly" in its animation, but for StrideMon. The beat-by-beat breakdown is in §1 of the prompt.
  The reference is a guide to study, never material: no pixel, frame or sound of it goes in the film.
- **Script C, the Founding Pass angle** (Yash, 2026-10-16): the pass is what we're marketing now.
  The chat had to change from the first draft because **nobody owns a pass yet** (the gallery is
  in its preview phase, and the waitlist window opens 2026-11-28), and #0137 already shows as
  minted (it's the test pass). So the chat is about **picking** a pass, which is what the gallery is
  for today.
- **The hero is #0627 Lime Runner Day**, unlaced, as the gallery shows it. It was chosen by
  rendering candidates on sky blue. A lime shoe in a blue sky is the reference's lime balloon in a
  blue sky almost exactly, and it echoes the lime phone. It's a Common, and it wasn't minted on
  2026-10-16.
- **Sneaker only, never the whole NFT image** (Yash): the shoe is cropped out of the gallery card,
  with no card frame, header or name rows.
- **16:9 only** (Yash), like the reference. No 4:5 or 9:16 this time.
- **No STRIDE disclaimer in the film** (Yash, 2026-10-16). The film shows no STRIDE amount, so
  `social/voice.md` §4 doesn't ask for one either.
- **The reference's look breaks some of our film rules on purpose**: a sky photo, a 3D phone, a
  script font, blur in transitions. Yash asked for that look. The prompt lists exactly what this film
  borrows and what it keeps (§3), so the exceptions stay this narrow.

## As built (2026-10-16)

The film is built and delivered (`launch-video/SCRIPT.md`, "The Pass chat film"). Where it differs
from the prompt below, and why, is in that section's "What changed from the brief". In short:

- **No running track in the burst** and **no `StrideMon` or `MONAD TESTNET` on the end card**
  (Yash, STOP 1). The shoes have no ground ellipse. The X post and its alt text say "Monad testnet".
- **The script face is Knewave** (Yash's pick at STOP 1), and the handwritten "isn’t" follows its
  own outline (`scripts/build-pass-chat-handwriting.py`).
- **702 frames (11.7 s), not 690:** the card holds 12 frames longer for its label, so the flip is
  on 488 and the pill on 612.
- **The sound isn't §5's.** After STOP 3 Yash asked for "some good trendy song" and new sounds. The
  film is set to "Brazilian Phonk" by ScrewedQueen, up front: its drop lands on the spin's whip,
  the music stops dead on the flip to black, and the drop comes back as "a JPEG." slides in. The
  effects are Pixabay's (whooshes, a riser, a boom, a recorded marker, pops), not Kenney's
  (`launch-video/CREDITS.md`).

---

## The prompt

You're a senior motion designer and creative technologist. You rebuild other studios' motion
pieces in code, closely enough that they feel like the same hand made them, and you build every
frame in Remotion. You're making the **Pass chat film for StrideMon**: a close rebuild of the
reference clip `demo.mp4`, with StrideMon's story, art and brand. Your bar: put the reference and
our film side by side, and the motion should feel the same (the swing, the bubble pops, the spin,
the card, the burst, the ring, the handwriting). Watched on its own, muted on X, it should look
designed and clean, with no frame looking cheap, cluttered or off-brand.

Work in **gates**. At each **STOP**, show me the result and wait for my go-ahead. Never skip one.

### 0. Read first

- `CLAUDE.md` (repo rules). **Never run any git command.** Leave everything in the working tree.
- `launch-video/README.md`, `CREDITS.md`, `FACTS.md` (§12 and §13 are the closest models),
  `SCRIPT.md` (the waitlist and Sneaker drop sections, including "What changed from the brief"),
  then the code in `launch-video/src/`: `Root.tsx`, `theme.ts`, `fonts.ts`, `components/` (
  `MotionBlur`, `MaskedRise`, `LabelRoll`, `Soundtrack`, `svg-markup`, `PhoneFrame`), and the
  whole `sneaker-drop/` folder (`timeline.ts`, `content.ts`, `art.ts`, `layout.ts`,
  `components/RegisteredSneaker.tsx`). Also read `scripts/fetch-audio.sh`,
  `scripts/copy-sneaker-drop-art.sh`, `scripts/render.sh` and `scripts/contact-sheet.sh`.
  **Reuse before you write.**
- `docs/launch-video-prompt.md` §4 (Motion language) and §5 (Sound). They apply to this film
  except where §3 below says otherwise.
- Remotion's skills in `launch-video/.agents/skills` (start with `remotion-best-practices`).
- `docs/architecture/design-system.md` and `apps/mobile/src/theme/`: the colours and type.
- `social/voice.md`: the vocabulary, the **Never say** list and §6 (images and clips).
- The pass and its art:
  - `docs/founding-pass-brief.md` §1, §3 and §7: what the pass is, the 1,000 designs, and what it
    can't do (it can't be sold or sent).
  - `website/src/content/founding-pass.ts`: the schedule and the words the site uses.
  - `website/src/content/founding-pass-designs.ts` (or
    `packages/contracts/art/founding-pass/previews/designs.json`): every design's number, name,
    template, family and rarity.
  - `website/public/pass-art/cards/NNNN.svg`: the **gallery cards** (1000 × 1000), with the shoe
    **unlaced**, as visitors see it on `/pass` today. This is the film's art.
  - `website/public/pass-art/laced/NNNN.svg`: the laced shoes alone (1000 × 600). Don't use them
    here: a pass is unlaced until its holder's first walk.
  - `packages/contracts/art/founding-pass/previews/2-one-template-in-every-family.png` and
    `7-legendaries.png`: overview sheets for picking the burst designs.
- `website/src/app/icon.svg`: the StrideMon mark (the line Sneaker). It goes on the phone's back.
- **`demo.mp4`** (repo root): the reference. Study it before anything else (see §1).

### 1. The reference, beat by beat (study it yourself first)

Pull its frames at 30 fps and look at every one (ffmpeg into your scratchpad, contact sheets of 16).
Then measure your own copy of the table below: the times, the angles, the sizes as a share of the
frame, and the eases. Write what you measured into `launch-video/src/pass-chat/reference.md`. That
file is your spec. What I saw:

| Time | What happens |
|---|---|
| 0.00–0.30 s | A **lime phone swings in** from the right, rotating fast on its vertical axis, seen from below against a blue sky with soft clouds. Motion blur on the swing. |
| 0.30–3.40 s | A **low-angle close-up** of the lower half of the screen: a group chat. Four bubbles pop in about 0.75 s apart. They are dark slate with white text, and **one word in each is a lime handwritten brush script** ("England", "Argentina", "Spain", "France"). The first bubble is sent (tail on the right), the others received (tail on the left). The screen's background is a pale grey-lavender, with a small "Today 9:41 AM" above the first bubble and a compose bar at the bottom (a round "+" and a pill field with a mic). |
| | The **camera never stops**: the phone slowly turns (it starts angled one way and ends angled the other), rolls a little, and the frame pushes in as the stack grows, so the newest bubble always sits near the middle. Older bubbles scroll up in the screen as new ones arrive. |
| 3.40–3.80 s | The phone **spins on its vertical axis**, faster and faster: its edge, then its lime back, with a heavy horizontal motion blur. |
| 3.80 s | A **whip into the card**: a white page with a rounded card about 30% of the frame wide. Inside the card is the same sky, and a **chrome balloon (their mascot) floats** in it. The card arrives blurred and a little too big, then sharpens and settles in about 0.2 s. |
| 3.80–4.60 s | The card holds, breathing slightly. The balloon bobs. |
| 4.60–5.40 s | The card **grows to about 90% of the frame**. A stadium rim rises at its bottom, curved like a fisheye. **Objects burst out** from behind the balloon toward the camera (a football, a Bitcoin, a VOTE badge, a trophy, a phone, a Hollywood star). They spin, are motion blurred, and **break out past the card's edges**. Then they drift. |
| 5.40–5.80 s | The card **shrinks and blurs away** toward the middle while a **pale lime scalloped ring** (a circle with about 12 soft waves) blooms out from the centre around the word **"This"**, then fades. |
| 5.80–6.90 s | **"isn't" writes itself on**, stroke by stroke, in a heavy brush script, next to "This". The camera then **pulls back** and **"a prediction market"** slides in from the right with a horizontal blur. The line holds, small and centred, on white. |

Notice what makes it feel good: every move overlaps the next (nothing starts from a dead stop), the
camera is always slightly moving, and the transitions are carried by motion blur rather than cuts.

### 2. The film (a starting point: improve it, then defend your version at STOP 1)

**60 fps, 1920 × 1080, about 690 frames (11.5 s).** The reference runs at 30 fps. Ours runs at 60
fps because the spin, the burst and the handwriting need the smoothness. The frames below are a
plan. Retime by up to about 15% if it plays better, and say why.

**The chat (Script C, as approved; words are fixed unless FACTS says otherwise):**

| # | Side | Bubble (the **lime script** word in bold) |
|---|---|---|
| 1 | sent (right) | did u see the **Founding Passes**? |
| 2 | received (left) | the free ones on **Monad**? |
| 3 | received (left) | yeah, **1,000** designs. all 1 of 1 |
| 4 | sent (right) | i'm taking **#0627** |

Lower-case, casual and texty, on purpose: it's a chat between friends, not our voice. No emoji
(`voice.md` §6 bans emoji in images). Above bubble 1, small grey: `Today 7:30 AM` (a morning-walk
hour). The compose bar has a round `+` and a pill field reading `Message`, with a mic glyph.
**Never "iMessage", never an Apple logo, never an iPhone silhouette.** It's an Android app.

**The storyboard:**

| # | Scene | Frames (60 fps) | What happens |
|---|---|---|---|
| 1 | **Phone in** | 0–29 | The lime phone swings in from the right against the sky (rotateY about −70° → −20°, out-expo), with motion blur. **Frame 0 already shows the phone, partly in:** it's the X thumbnail, so no empty sky and no fade. |
| 2 | **Chat** | 24–299 | Bubbles 1–4 land on frames 24, 90, 156 and 222. Each pops from its tail corner (scale 0.6 → 1 and opacity 0 → 1 over about 10 frames, out-expo, no overshoot). As each lands, the older ones scroll up inside the screen (18 frames, standard ease). The camera drifts all the time: the phone turns from about −20° to +15° on Y, rolls about 4°, and pushes in so the newest bubble sits a little above the frame's middle. The stack holds until 299, so bubble 4 is up at least 1.3 s. |
| 3 | **Spin** | 300–335 | The phone spins on Y, accelerating (emphasised ease in), through its edge to its **back**: flat lime, a flat camera block, and the StrideMon mark in ink in the middle (`icon.svg`'s strokes, never a logo we don't own). Strong motion blur from about frame 315. On 335 the back fills the frame in a horizontal smear. |
| 4 | **Card** | 336–407 | A whip into the off-white page (`#F0F1FA`): the rounded card (about 30% of the frame wide, a 28 px radius at 1920) arrives blurred at scale about 1.25 and settles to 1 in about 12 frames. Inside, the same sky, and **#0627 Lime Runner Day** floating (a bob of ±1.5% of the card's height and a ±2° rock on a slow cycle). Under the card, `#0627  LIME RUNNER DAY` in IBM Plex Mono, ink, rises on 348 (masked rise). The card breathes 1.00 → 1.03. |
| 5 | **Burst** | 408–467 | The label drops out and the card grows to about 90% of the frame (42 frames, out-expo). A **running track** curves up into its bottom edge, fisheye-curved like the reference's stadium: flat ink lanes, white lane lines, a lime start line (lime on dark). **Ten other passes' shoes burst out** from behind #0627 on a 2-frame stagger. They grow as they come toward the camera, spin 20–60°, are motion blurred, and break past the card's edges like the reference's objects. Then they drift slowly. #0627 stays the biggest and stays sharp. |
| 6 | **Ring** | 468–489 | The card shrinks toward the middle and blurs out (about 10 frames). On **476** the frame **flips hard to black** (the film's one flip, with a thump). A **lime scalloped ring** blooms around `This` (white Satoshi): it scales 0.7 → 1.5, its stroke thins, and it fades out by 500. Flat lime, no blur on the ring itself, no glow. |
| 7 | **"isn't"** | 490–555 | **"isn't" writes itself on** in lime script next to `This`, stroke by stroke, in the order a hand writes it (i, its dot after the n, s, n, apostrophe, t, then the t's cross), over about 34 frames with a natural rhythm. Then the camera pulls back (scale about 1.6 → 1, 24 frames, standard ease) while `a JPEG.` slides in from the right with a horizontal blur that clears in 10 frames. |
| 8 | **End** | 556–689 | Under the line, `It’s your way into StrideMon.` rises (masked rise, from 560). On 600 the site's white pill `stridemon.xyz/pass →` lands, with `StrideMon` and a small lime dot + `MONAD TESTNET` meta. Everything drifts (scale 1.00 → 1.02). **The last frame is the poster.** |

Reading time (`0.4 s + words ÷ 3.5`): "This isn't a JPEG." is up from about 8.2 s to the end, and
"It's your way into StrideMon." for about 2.1 s (it needs 1.8 s). The chat stack builds over 4.6 s.
Read it muted at full speed and check it lands. If the chat doesn't read, slow it down rather than
cutting words.

**The words must be true.** Every line gets a row in a new `FACTS.md` §14 **before** it goes on
screen, with its source:

| On screen | Source | Status |
|---|---|---|
| "Founding Passes" | `founding-pass.ts`, brief §1 | ✓ |
| "the free ones" | Brief §1 ("gas-free"), FAQ "Is it free?"; FACTS §12 `Free. We pay the gas.` | ✓ |
| "on Monad" | Brief §1 (minted on Monad testnet) | ✓ The end card's `MONAD TESTNET` keeps it honest |
| "1,000 designs. all 1 of 1" | Brief §1, §3.1; FACTS §12 (`1,000 Founding Passes.`, `Each design exists once.`) | ✓ |
| "i'm taking #0627" | Design table row 627 (Lime Runner Day, Common). Picking a pass in the gallery before the mint is what `/pass` is for (D-044, D-050) | ⚠ **#0627 must be unminted and not pending** on `GET https://api.stridemon.xyz/v1/pass/collection` when you start and again on delivery day (read-only). If it's taken, stop and ask me, because the hero changes |
| `Today 7:30 AM` | A made-up chat time | ✓ No date, nothing claimed |
| #0627's shoe, unlaced | `cards/0627.svg`, cropped to the shoe, unchanged | ✓ As the gallery shows it |
| `#0627  LIME RUNNER DAY` | Design table row 627 | ✓ |
| The ten burst shoes | `cards/NNNN.svg`, cropped, unchanged (numbers and why in `src/pass-chat/sneakers.ts`) | ✓ Real designs |
| "This isn't a JPEG." | The pass art is SVG drawn on-chain by `FoundingPassArtRenderer` (D-041, D-042); the pass can't be sold or sent (brief §7) and is early access to the app (brief §1) | ⚠ The joke holds because it's literally true (it's an on-chain SVG) and the point is true (it's a way in, not a picture to trade). Say nothing about other NFTs |
| `It's your way into StrideMon.` | FACTS §12 (same line, sourced there) | ✓ |
| `stridemon.xyz/pass` · `StrideMon` · `MONAD TESTNET` | D-040; FACTS §1, §12 | ✓ |

If you want a different twist line, propose at most two at STOP 1, each with its FACTS row and why
it beats "This isn't a JPEG.". Never one that's about another project (`voice.md` §3), and never
"mint", a price, value, floor or "limited".

**Never on screen:** a STRIDE amount or the STRIDE disclaimer (Yash, 2026-10-16), a price, worth,
value, floor, "mint", airdrop, whitelist, "limited", "don't miss out", any date, mainnet, a store
badge, an Apple logo, "iMessage", emoji, or the reference's own objects (balloon, football, Bitcoin,
VOTE, trophy).

### 3. The look: what this film borrows, and what it keeps

**Borrowed from the reference (allowed in this film only, Yash, 2026-10-16):**

- **A real sky photo.** The phone shot and the card's inside are the same sky: a clean, saturated
  blue with a few soft cumulus clouds. No sun, no birds, no planes, no buildings. Find one under a
  licence that allows commercial use with no attribution (Pixabay Content License or Unsplash
  License), at least 3840 px wide so it can pan without softening. Log it in `CREDITS.md` like the
  music: the page, the file URL, the licence and the date. Pixabay's site returns 403 to curl: fetch
  it from inside a Playwright page (`fetch()` in the page), or from the CDN with
  `-e https://pixabay.com/`. Give me three candidates at STOP 1. The sky slowly pans (about 2% over
  the chat) so it's never a still.
- **A 3D phone, not photoreal.** Generic Android: one flat lime body (`#C1FF00`), a thin ink
  bezel, rounded corners, a punch-hole camera, side buttons a step darker. Its depth comes from its
  thickness, each side face a flat step darker than the front, and **not** from gradients,
  highlights, reflections or a drop shadow.
- **A script face**, for the lime keywords in the bubbles and for "isn't". The reference's is a
  heavy, slanted brush script. Pick it from OFL fonts on Google Fonts (load it with
  `@remotion/google-fonts`). Try at least **Kaushan Script**, **Caveat Brush** and **Permanent
  Marker**, and show me all three at STOP 1, set as bubble 1 and as "This isn't".
- **Blur in transitions:** the swing, the spin, the whip into the card, the card's blur-in and
  blur-out, the burst and `a JPEG.`'s slide-in. Everywhere else type and art are sharp.
- **Bubble pops and the burst.** Fast and snappy, but with **no overshoot** (out-expo or a
  clamped spring, as §4 of the launch prompt says).

**Kept, as in every StrideMon film:**

- Colours only from `theme.ts`. Add what this film needs there, each with a comment (the chat's
  screen background, the bubble slate, the phone's side shade, the track's ink), deriving them from
  the existing tokens where you can: the bubbles are `primary` (`#2B2E3A`, which is almost exactly
  the reference's slate), and the screen is `surfaceMuted` or `background`. No raw hex anywhere
  else. No purple, no gradients you add (the photo is the only one), no glow, no drop shadows.
- **Lime only on dark or as a fill:** lime text sits only on the slate bubbles or on black, never
  on the off-white page or the sky. That's why the ring scene flips to black. The phone's lime body
  and the shoe's own colours are fills, not text.
- Satoshi 400 for reading text and 500 only for uppercase meta and the pill. IBM Plex Mono for the
  design number. No bold (the script face is the one exception).
- **The art is frozen** (`DESIGNS_FROZEN_ON`). Crop, place, scale, rotate, blur and move the shoes,
  but never change a path or a colour, and never draw a design that isn't in the table. Leaving out
  the card's frame, text, cross marks and the light ground ellipse under the shoe is a crop, which is
  fine. A shoe floating in the sky has nothing to cast that shadow on, but show me the shoe both with
  and without the ellipse at STOP 1.
- Never a dead frame, never a cut that isn't motivated, never particles or confetti.

### 4. How to build the hard parts

Prototype these first, in a throwaway `PassChatSpike` composition, before you style anything. They
decide whether the film can look like the reference.

- **The phone in 3D.** Use CSS 3D in the DOM (`perspective`, `transform-style: preserve-3d`), so
  the chat stays crisp, real text. A box of six faces leaves gaps at rounded corners, so build the
  body as an **extrusion**: the rounded-rect outline repeated as about 24 thin slices along Z (each
  one a flat step of the side shade), with the screen on the front slice and the back panel on the
  last. Check the spin at 90° (edge-on): it must read as a solid lime slab with no gaps, no
  flicker and no z-fighting. If CSS can't do it cleanly, fall back to `@remotion/three` with a
  rounded box and the chat rendered to a canvas texture, but only after you've shown me the CSS
  attempt.
- **The camera.** One `camera` object per frame (rotateX, rotateY, rotateZ, translate, scale),
  driven by a few keyframes with the film's eases, so every move overlaps the next as in the
  reference. Make it one function in `src/pass-chat/camera.ts`, not transforms scattered through
  scenes.
- **Motion blur on 3D.** `MotionBlur` (`HtmlInCanvasMotionBlur`) may not draw 3D transforms (and in
  the Studio it needs Chrome 149+ with `chrome://flags/#canvas-draw-element`). **Test it on the spin
  first.** If it fails, use `CameraMotionBlur` from `@remotion/motion-blur` (it renders the layer at
  several sub-frames), or write a directional blur: an SVG `feGaussianBlur` with `stdDeviation="X 0"`
  for horizontal smears (the spin's end, `a JPEG.`'s slide-in).
- **The bubbles.** Real DOM: Satoshi with the script word in a span, the bubble's tail drawn as an
  SVG path (match the reference's soft, curled tail), padding and radius measured from the
  reference. Pop each from its tail corner (`transform-origin` there). The script word's baseline
  must sit on Satoshi's: check it at 400% zoom.
- **The handwriting.** A typewriter or a wipe won't do. Get the script face's glyph outlines for
  "isn't" as one filled SVG path (opentype.js, or fontTools in a scratchpad venv). Then hand-draw a
  **centreline path for each stroke**, in writing order, over the glyphs, and animate each one with
  `@remotion/paths` (`evolvePath`) as a thick stroke used as a **mask** over the filled outline. The
  ink appears along the pen's path, shaped exactly like the font. Commit the outline and the
  centrelines as data in `src/pass-chat/handwriting.ts`, with the script that made the outline in
  `launch-video/scripts/`.
- **The scalloped ring.** One generated SVG path: radius `r + a·sin(12θ)`, stroked in flat lime,
  rotating slowly as it blooms.
- **The shoes.** Find how `cards/NNNN.svg` places the shoe (its group, transform and clip). Extract
  only the shoe as vector, unchanged, with a copy script like `copy-sneaker-drop-art.sh` into
  `launch-video/public/` (gitignored). If the shoe can't be separated cleanly, rasterise the card
  at 4× with `rsvg-convert` and crop. Register every shoe by its ground line and heel (as
  `RegisteredSneaker` does) so they scale and spin around a sensible centre.
- **The burst's designs.** A seeded pick in `src/pass-chat/sneakers.ts`, with the reason written
  down: ten designs, **all unminted** on the collection endpoint, no two sharing a template or a
  family, none in Cobalt or Ocean (they vanish against the sky), at most one Legendary, and none
  of them #0627. Order them so the colours alternate around the circle.

### 5. Sound (finished with sound, made for muted viewing)

The reference is silent, and X autoplays muted, so the film must land with no sound. With sound
on, it should feel tactile:

- **Effects, in sync with the picture** (`src/pass-chat/sound-cues.ts`, derived from the same
  frames as the scenes): a soft pop per bubble (sent ones a little higher in pitch than received
  ones, as chat apps do), an airy swish through the spin, a soft landing as the card settles, one
  short airy burst for the explosion, the existing `sfx-thump.wav` on the black flip, a dry pen
  scratch per stroke of "isn't", and the existing `sfx-tick.wav` as the pill lands.
- **Sources:** Kenney's CC0 packs first (`fetch-audio.sh` already downloads Interface Sounds,
  Impact Sounds and UI Audio: try `pluck_00x`, `drop_00x`, `maximize_00x` and the soft impacts).
  You may generate the pen scratch with ffmpeg (band-passed noise bursts shaped to each stroke's
  length), like `sfx-tone.wav`. Use Pixabay sound effects only if Kenney has nothing that fits. Log
  every file in a new `CREDITS.md` section. Add the downloads and the generation to
  `scripts/fetch-audio.sh`, so a fresh clone can rebuild them.
- **No music by default.** At STOP 2, also give me one mix with a quiet music bed under the
  effects: up to three Pixabay candidates (Pixabay Content License, not Content ID registered if
  you can find one), each about 12 s, with an energy curve that suits the film (librosa in a
  scratchpad venv). I listen and pick, or say no music.
- **Mastering:** extend `scripts/render.sh` with `pass-chat-16x9` (the same picture settings, the
  limiter and BT.709 tags). True peak −1 dBTP. With music, two-pass loudnorm to −14 LUFS as in
  the other films. With effects only, don't force −14 LUFS across mostly silence. Level the effects
  so the loudest pop sits around −6 dBFS, and report the integrated loudness.

### 6. Build

- New compositions in `launch-video/src/Root.tsx`: `PassChat16x9` (1920 × 1080, 60 fps, the
  delivery), a `PassChatScenes-16x9` folder with each scene on its own, and the spike while it's
  useful (delete it before delivery).
- Code in `launch-video/src/pass-chat/`: `reference.md` (your measurements), `timeline.ts` (every
  scene's frames, named, never typed twice), `camera.ts`, `content.ts` (every word, mirroring
  FACTS §14), `sneakers.ts`, `handwriting.ts`, `sound-cues.ts`, `components/` and `scenes/`.
  Shared components stay shared. **Don't change how the other films look or sound:** if you touch a
  shared component, render their scenes again and compare frames.
- Load fonts in `fonts.ts` (the script face with a comment on its licence). Copy the art and the
  sky with scripts into gitignored `public/` folders. Never edit anything in `website/`,
  `packages/` or any generated art. Never put `demo.mp4` or any of its frames in the project.

**STOP 1:**

- `reference.md` (your measured breakdown).
- The spike: the 3D phone spinning through edge-on with motion blur, and "isn't" writing itself
  on. Short mp4s, plus a few stills.
- The three script faces, the three sky photos, #0627 with and without its ground ellipse, the ten
  burst designs and why you picked them, and any twist-line alternatives.
- Your storyboard as you'll build it (every scene by frame).
- **Four styleframes** at 1920 × 1080: the chat mid-stack, the card with #0627, the burst at its
  peak, and the end frame. Put each next to the matching reference frame.

**STOP 2:** the full animatic with real art and rough sound (`launch-video/out/animatic/`), a
contact sheet, and a **side-by-side** of the reference and ours scaled to the same length (ffmpeg
`hstack`), so I can compare the motion beat by beat. Both mixes (with and without a music bed).

**STOP 3:** the finished film after polish (timing, eases, blur amounts, the mix).

### 7. Deliver

- `launch-video/out/stridemon-pass-chat-16x9.mp4`: H.264, yuv420p, BT.709, 60 fps, AAC 48 kHz,
  `+faststart`, true peak −1 dBTP. Plus `-poster.png` (the last frame) and `-silent.mp4`.
- Check it as X will play it: under 140 s and 512 MB, frame 0 is a good thumbnail (the phone
  swinging in over sky, not empty), and it reads muted at full speed on a phone screen (look at it
  at 390 px wide: the bubble text must still read).
- Check **#0627** and the ten burst designs are still unminted on the collection endpoint on
  delivery day.
- Draft one @stridemon post in `social/posts/` (following `social/voice.md`, `approved:` left
  empty), with `media` pointing at the mp4 and alt text that describes the chat, the shoe and the
  last line. The link to `stridemon.xyz/pass?source=x-stridemon` goes in the first reply.
- Update `launch-video/README.md` (the commands), `SCRIPT.md` (this film's storyboard as built,
  its on-screen text, reading time, and "What changed from the brief"), `FACTS.md` §14 and
  `CREDITS.md` (the sky photo, the font, the effects and any music). Add an "As built" note to the
  top of `docs/pass-chat-video-prompt.md`, as the Sneaker drop brief has.
- **Done means:** `bunx tsc --noEmit` in `launch-video/` passes, `bun run lint` at the repo root
  passes, and the launch, waitlist, Sneaker drop and pitch films still render unchanged.

**Never:** run git, post or schedule anything on X, send a transaction, call anything but
read-only `GET`s on the API, or edit `website/`, `packages/` or any generated art.
