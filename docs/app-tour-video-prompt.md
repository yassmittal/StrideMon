# App Tour Video Prompt

The brief for the **App tour film**: a 30-second, 9:16 tour of the StrideMon app. One phone stays in
the middle of the frame with the real app playing in it. Each step of the game loop gets its own
background colour and a short headline. The colour sweeps in from the left on every change, and
the film ends on the logo and `stridemon.xyz`. It's a fifth film in the launch film's Remotion
project (`launch-video/`), not a new project. Paste everything below the line into a fresh Claude
Code session started in the repo root (`monad/`).

## As built (2026-10-17)

The film is built and delivered (`launch-video/SCRIPT.md`, "The App tour film";
`out/stridemon-app-tour-9x16.mp4`). Where it differs from the prompt below, and why, is in that
section's "What changed from the brief". In short:

- **The music is the reference ad's own track** (Yash, after hearing three licensed Pixabay
  candidates). The prompt's guide-track rule is overridden: `render.sh` uses it and says it's
  unlicensed. It isn't for Instagram, and YouTube may claim it (`launch-video/CREDITS.md`). Effects:
  a tap on each ring and a hit on the drop; no whooshes (Yash, STOP 2).
- **A realistic phone shell**, not `PhoneFrame` (Yash, STOP 1), with no punch hole; **Satoshi Bold**
  headlines; section 5's headline white; the end card says `stridemon.xyz`; **no testnet line on
  the end card** (Yash), so the posts' captions carry it.
- **The run is the reel's footage**, not `RunScreen`. The repair's "Confirming on Monad…" is rebuilt
  too (the reel's frames show its app switch). Six rebuilds pass the ±3 px check against the reel
  (`scripts/check-app-tour-rebuilds.py`, which fits each reel clip's own framing first).
- **Measured, not described:** the wipe is the reference's 31-keyframe curve; headline words slide
  up unmasked; the icon rises, punches and settles before it becomes the phone; the phone cuts back
  to rest on the drop so the rolling numbers stay in frame.
- Section 3 ends on the reel's own tab tap and scroll (34.7–36.5 s) instead of a long hold, and
  the film's text is unhinted, which fixed a shimmer on the level-2 card.

## Why it's shaped this way (2026-10-16)

- **It copies a reference's structure and motion, closely.** `reference.mp4` at the repo root is a
  30 s third-party app ad (720 × 1280, 30 fps, with music). Yash wants "a similar type of video"
  for StrideMon. The beat-by-beat breakdown is in §1 of the prompt. The reference is a guide to
  study, never material: no pixel or frame of it goes in the film.
- **Its music is a guide track only, never in the delivered film.** Yash offered to reuse it, but
  it's that brand's ad music: we couldn't identify the track and hold no licence for it. Instagram
  could mute the film and YouTube could put a copyright claim on it, on StrideMon's own accounts.
  It can be the temporary track while cutting (so the timing matches the reference), and Yash picks
  the final track from Pixabay candidates. If the same song is in Instagram's own music library,
  Yash can add it there himself when he posts the silent version. That use is licensed for Reels.
- **The five sections are the game loop**: meet the app, walk, earn, repair, level up, which is
  the tagline `Walk. Earn. Upgrade.` in order.
- **The climax is the level-up, on the drop** (proposed 2026-10-16, Yash: "cool cool"). In the
  reference the music stops for about a second and then drops on the payoff. In ours the music
  stops while the phone says "Confirming on Monad…", and drops on "Level 2 reached".
- **The footage is the submission reel**: `website/media-source/submission-reel.mp4` (gitignored,
  720 × 1560, 30 fps, 73.6 s). It's a clean phone recording from 2026-10-07 with the STRIDE name.
  It has no upgrade (the button is disabled because the wallet didn't have the 50 STRIDE it costs),
  so the level-up is rebuilt from the app's own components and the contract's own art.
- **The end card shows the testnet line**, because STRIDE amounts are on screen (`social/voice.md`
  §4). It shows no store badges: StrideMon isn't on Google Play yet, and `voice.md` §3 bans them.
- **9:16 only**, like the reference: for Instagram Reels, YouTube Shorts and X.
- **The end card's link is `stridemon.xyz`.** Yash didn't pick between that and
  `stridemon.xyz/pass`, so ask at STOP 1.

---

## The prompt

You're a senior motion designer and creative technologist. You rebuild other studios' motion
pieces in code, closely enough that they feel like the same hand made them, and you build every
frame in Remotion. You're making the **App tour film for StrideMon**: a close rebuild of the
reference app ad `reference.mp4`, with StrideMon's app, story and brand. Your bar: put the
reference and our film side by side, and the rhythm should feel the same: the icon becoming the
phone, the colour sweeps, the headlines arriving with them, the taps, the push-ins, the silence
before the drop and the end card. Watched on its own, muted, on a phone, it should look designed
and clean, with no frame looking cheap, cluttered or off-brand.

Work in **gates**. At each **STOP**, show me the result and wait for my go-ahead. Never skip one.

### 0. Read first

- `CLAUDE.md` (repo rules). **Never run any git command.** Leave everything in the working tree.
- `launch-video/README.md`, `CREDITS.md`, `FACTS.md` (§1, §2, §5, §8 and §9 hold this film's
  facts, and §14 is the closest model for a new section), `FOOTAGE.md`, and `SCRIPT.md` (the Pass
  chat and Sneaker drop sections, including "What changed from the brief").
- The code in `launch-video/src/`: `Root.tsx`, `theme.ts`, `fonts.ts`, `layouts.ts`, `walk-ramp.ts`,
  `components/` (`PhoneFrame`, `Footage`, `RunScreen`, `SneakerArt`, `RollingDigits`, `MaskedRise`,
  `LabelRoll`, `Drift`, `MotionBlur`, `Soundtrack`), and the whole `pass-chat/` folder
  (`timeline.ts`, `reference.md`, `sound-cues.ts`). Also read `scripts/cut-footage.sh`,
  `scripts/fetch-audio.sh`, `scripts/render.sh`, `scripts/contact-sheet.sh` and
  `scripts/check-run-screen-overlay.py`. **Reuse before you write.**
- `docs/launch-video-prompt.md` §4 (Motion language) and §5 (Sound). They apply to this film
  except where §3 below says otherwise.
- `docs/pass-chat-video-prompt.md`: the last film that copied a reference, and its "As built" notes.
- Remotion's skills in `launch-video/.agents/skills` (start with `remotion-best-practices`).
- `docs/architecture/design-system.md` and `apps/mobile/src/theme/`: the colours and type.
- `social/voice.md`: the vocabulary, the **Never say** list and §4 (disclaimers).
- The app, for the screens you rebuild:
  - `apps/mobile/src/features/sneaker/components/` (`RepairPanel.tsx`, `UpgradePanel.tsx`,
    `SneakerTransactionSheet.tsx`): the real words. The upgrade asks `Upgrade to level 2?`, shows
    `Confirming on Monad…` and ends on `Level 2 reached`.
  - `apps/mobile/assets/icon.png` (the app icon: the white line Sneaker with its lime stripe on
    `#141515`) and `splash-icon.png`, and `apps/mobile/app.config.ts` (the splash is `splash-icon`
    on `#F0F1FA`).
  - `website/src/app/icon.svg`: the StrideMon mark as vector.
  - `website/public/screenshots/` (`02-home.png`, `05-sneaker-tab.png`, `06-repair-review.png`):
    full-size screens to check rebuilds against. `08-history.png` still says SOLE: don't use it.
- **`reference.mp4`** (repo root): the reference. Study it before anything else (see §1).
- **`website/media-source/submission-reel.mp4`**: the footage (see §2).

### 1. The reference, beat by beat (study it yourself first)

Pull its frames at 30 fps and look at every one (ffmpeg into your scratchpad, contact sheets of
16), and analyse its audio with librosa (in a scratchpad venv). Then measure your own copy of the
tables below: the times, the sizes as a share of the frame, the curves. Write what you measured
into `launch-video/src/app-tour/reference.md`. That file is your spec. What I measured
(sizes are shares of the 720 × 1280 frame, so they carry over to 1080 × 1920 unchanged):

| Time | What happens |
|---|---|
| 0.00–0.13 s | **A cover**: the first 4 frames show the phone with the first headline, so the platform's auto-thumbnail isn't a bare icon. |
| 0.13–0.60 s | **The app icon**, huge: a pale mint rounded square with the logo, about 95% of the width, on the first section's green. It shrinks a little. |
| 0.60–1.00 s | The icon **shrinks and reshapes into the phone**: the rounded square becomes the phone's screen, showing the app's splash. The phone lands at about 57% of the width, centred, its top at about 23% of the height. |
| 1.00–3.50 s | The splash holds. **"Welcome to the new equ app."** rises in word by word over 1.3–1.8 s, centred above the phone (two lines). The phone eases from about 57% to 64% of the width by 2.5 s. |
| 3.50–5.50 s | The splash **slides up** to the Home screen, and a ring counter **counts down 2000 → 500** (3.75–4.75 s). |
| 5.50 s | **Tap 1**: a pale filled circle on a tab-bar icon. The next screen slides in from the right (5.55–5.80 s). |
| 5.87–7.00 s | **Wipe 1**: purple sweeps in from the left. **"Endless choices."** arrives with it, each word rising into place as the edge passes it. |
| 7.00–9.60 s | A list scrolls. The camera **pushes in** a little around 7.5–8.5 s. |
| 9.67 s | A hard cut back to Home. **Tap 2** at 10.25 s: a thick ring on an arrow button. |
| 10.40–11.57 s | **Wipe 2**: peach, **"Effortless planning."** The new screen comes in, and the camera **pushes in hard** (11.0–11.75 s) until the phone is about 79% of the width with its bottom out of frame. A long list scrolls fast until 14.0 s. |
| 14.75 s | A cut back to Home at normal size. **Tap 3** at 15.25 s: a thick dark ring on a button, which changes state. |
| 15.87–17.03 s | **Wipe 3**: near-black, **"Deliciously yours."** The screen scrolls to a diary, which keeps scrolling. **Tap 4** at 18.75 s: a pale filled circle on a tab. |
| 19.17–20.30 s | **Wipe 4**: orange, a three-line headline. **The music stops dead at 19.32 s.** The new screen sits with its counters at zero. |
| 20.18 s | **The drop.** A line chart draws itself (20.25–21.0 s) while three counters roll to their final values (landed by 21.5 s). Then it holds, drifting slightly, until 23.5 s. |
| 23.50–24.80 s | The phone **tilts about 10° counter-clockwise and slides off to the left** while **wipe 5** (mint, the opening colour again) sweeps in. This is the one wipe that goes over the phone. It reveals the logo (about 63% of the width, centred, at 38–53% of the height) and a tagline under it (at about 57–60% of the height). |
| 26.00–27.25 s | The tagline **swaps** to "Ready to transform?". The URL types on under it (26.5 s, at about 61–63% of the height), and two store badges **slide in from the left and right edges** (26.75–27.25 s, at about 67–70% of the height, 40% of the width together). |
| 27.25–30.00 s | The end card holds, on near-silence. |

**The wipes** are all the same move. A hard, vertical edge crosses the frame left to right in
**35 frames (1.17 s)** on a sharp, slightly asymmetric ease-in-out. It creeps from 0 to 22% of the
width over the first 13 frames, **snaps** from 22% to 76% in about 2 frames, then settles from 76%
to 100% over the last 19. The snaps land at 6.30, 10.83, 16.30, 19.60 and 24.10 s, and three of
them sit exactly on a beat. The new colour is a layer over the old one (old headline included). The
phone stays on top of every wipe except the last.

**The layout:** the headline is centred, about 9.5% of the frame width in font size, and its first
line sits at about 10% of the height. One line spans about 67% of the width. Every section has its
own headline colour. The phone is about 58–64% of the width at rest and about 79% at the big
push-in.

**The taps** come in two kinds: a pale filled circle (about 13% of the phone's width) that pops and
fades as an expanding ring, about 0.3 s, for tab-bar taps; and a thick ring around a button, about
0.4 s, for button taps. Every screen change inside the phone happens on a tap, on a hard cut or
under a wipe, never on its own.

**The music:** 100 BPM, rock steady (a beat every 0.600 s from 0.70 s). It stops at 19.32 s, comes
back with the clip's strongest hit at 20.18 s, ends at about 25 s and tails off by 27 s. It's
loud, at −12 LUFS integrated. It sounds like music only: I found no sound effects. Check that
yourself.

Notice what makes it work. There's one idea per section. Something always moves inside the
phone: a count, a scroll, a chart. The colour change does the storytelling, so the cuts inside
the phone never feel like cuts.

### 2. The film (a starting point: improve it, then defend your version at STOP 1)

**60 fps, 1080 × 1920, 1800 frames (30 s)**. Build it first on the reference's own timing, cut
against the guide track (§5). When Yash picks the real track, retime everything to its beats (one
grid in `src/app-tour/beats.ts`, every frame derived from it in `timeline.ts`). Keep each section
within about 15% of the length below.

**The palette** (all already in `theme.ts`):

| Section | Background | Headline |
|---|---|---|
| Icon, 1 and End | lime `highlight` `#C1FF00` | black |
| 2 Walk | black `#000000` | lime |
| 3 Earn | off-white `background` `#F0F1FA` | black |
| 4 Repair | ink `primary` `#2B2E3A` | off-white |
| 5 Level up | blue `accent` `#1A2FFB` | white (show lime too at STOP 1) |

**The storyboard** (times as in the reference; frames at 60 fps):

| # | Section | Time (frames) | What happens |
|---|---|---|---|
| 0 | **Cover** | 0.00–0.13 (0–7) | Section 1's styleframe: lime, `Meet StrideMon.`, the phone on Home with the Sneaker card. |
| 1a | **Icon** | 0.13–0.60 (8–35) | The StrideMon app icon (the dark rounded square with the white line Sneaker and its lime stripe), huge on lime, shrinking a little. Draw it from `icon.svg`'s strokes, not by scaling up the PNG. |
| 1b | **Icon → phone** | 0.60–1.00 (36–59) | The icon's square stretches and shrinks into the phone's screen. The phone lands showing the real splash: `#F0F1FA` with the dark icon in the middle. |
| 1c | **Meet StrideMon.** | 1.00–5.87 (60–351) | `Meet StrideMon.` rises word by word (1.30–1.80). The splash holds, then slides up (about 2.4) to **"Minting your Sneaker…"** (reel 6.5–9.0 s), then to **Home** (about 3.5). There, the Sneaker card's art **draws itself** (line draw, lime stripe last, about 3.6–4.8), its level and durability bars fill, and `ENERGY 10 / 10` fills. This is the reference's countdown moment. Then Home scrolls up to `START A RUN`, like the reel at 14.0–15.0 s. **Tap** on `START A RUN` at 5.50 (330). |
| 2 | **Walk or run.** | 5.87–10.40 (352–623) | The run screen comes in on the tap. Leave out the location-permission screen. Wipe to black, `Walk or run.` in lime. The run plays sped up on a ramp, like `walk-ramp.ts` (reel 16.5–25.0 s): `TIME` 0:04 → 2:29, `DISTANCE` 0 → 161 m, `ESTIMATED REWARD` +0 → +5 → **+10 STRIDE**, with +10 landing on a beat. **Push in** on the counters (7.5–8.5, to about 70% of the width), back out by 9.5. **Tap** on `STOP` at 9.80 (588). Cut the "Finish this run?" dialog. |
| 3 | **Earn STRIDE.** | 10.40–15.87 (624–951) | `Settling on Monad…` (reel 28.5–30.5 s, compressed to about 1 s) under the off-white wipe, then the summary: **`+10 STRIDE`** (reel 31.0 s). **Push in** on `+10 STRIDE` (11.0–11.75). The camera then glides down the summary (rewarded minutes, durability lost, the run's stats) until about 14.5. The camera moves, the app doesn't. Cut to the **Sneaker tab** (reel 35.5–36.0 s: the Repair panel, `Durability 99 → 100`). **Tap** on `REPAIR TO 100` at 15.25 (915). |
| 4 | **Keep it running.** | 15.87–19.17 (952–1149) | `Repair your Sneaker?` (reel 36.5–37.0 s: `Durability 99 → 100`, `STRIDE balance 10 → 9.3`) under the ink wipe. **Tap** on `CONFIRM IN WALLET` (about 16.6). Cut out MetaMask, then `Confirming on Monad…` (reel 40.0 s), then **`Sneaker repaired`** with its check (reel 40.5–42.5 s). About 18.3: the Upgrade panel (rebuilt, see §4: `Upgrade`, `50 STRIDE`, `Level 1 → 2`, `Efficiency 10 → 12`). **Tap** on `UPGRADE TO LEVEL 2` at 18.75 (1125). |
| 5 | **Level up.** | 19.17–23.67 (1150–1419) | `Confirming on Monad…` (rebuilt) slides up. The blue wipe crosses, and **the music stops dead** as it starts. The snap and `Level up.` land in the silence. **On the drop (20.18, frame 1211)** the sheet becomes `CONFIRMED ON MONAD`, a check, **`Level 2 reached`**, `Spent 50 STRIDE`, and `Level 1 → 2` and `Efficiency 10 → 12` roll (`RollingDigits`). About 21.2: the sheet slides down to the Sneaker card, where the art swaps to the renderer's level-2 image (its level ticks step to `02 / 30`) and `EFFICIENCY` rolls 10 → 12. Hold with a slow drift. |
| 6 | **End** | 23.50–26.00 (1410–1559) | The phone tilts and slides off left as the lime wipe crosses over it. That wipe reveals the logo lockup (the mark and `StrideMon` in Satoshi, the website header's lockup, about 63% of the width, centred at about 46% of the height) and `Walk. Earn. Upgrade.` under it. |
| 7 | **Call to action** | 26.00–30.00 (1560–1799) | `Walk. Earn. Upgrade.` label-rolls to `Ready to move?`. `stridemon.xyz` rises under it (26.4). Two black pills with lime text slide in from the left and right edges (26.8–27.25): `ANDROID DEMO` and `MONAD TESTNET`. Under them, small: `Monad testnet. STRIDE has no monetary value.`. Everything drifts (scale 1.00 → 1.02). |

**What goes in the phone.** Use real footage by default, cut from the reel. Rebuild a screen as
vector only where the footage can't do the job: Home's draw-in (1c) and the upgrade (end of 4, and
all of 5). Every rebuild must match a real frame **within ±3 px** at full size, checked by a script
like `check-run-screen-overlay.py`. The existing `RunScreen` is there if the sped-up run footage
looks worse than a rebuild. Show me both at STOP 1.

**Reading time** (`0.4 s + words ÷ 3.5`): every headline is two or three words (1.0–1.3 s), and
each section holds its headline for at least 3.3 s. In-phone numbers must read at 390 px wide:
`+10 STRIDE`, the run counters and `Level 1 → 2` are why the push-ins exist.

**Safe areas:** Reels and Shorts cover the bottom of the frame with captions and the right side
with buttons. Keep every word above 78% of the height and at least 120 px from the right edge.
Only the phone's lower body may go below that.

**The words must be true.** Every line and number gets a row in a new `FACTS.md` §15 **before** it
goes on screen, with its source:

| On screen | Source | Status |
|---|---|---|
| `Meet StrideMon.` | The name (§1); an introduction, so it claims nothing | ✓ |
| `Walk or run.` | The welcome screen ("Walk or run with it to earn STRIDE", `01-welcome.png`); §1 | ✓ |
| `Earn STRIDE.` | §1, §2 | ✓ STRIDE amounts are on screen, so the end card carries the disclaimer |
| `Keep it running.` | The Repair panel: "Every run wears your Sneaker down. At zero durability it can't run until it's repaired." (reel 36.0 s, `RepairPanel.tsx`) | ✓ |
| `Level up.` | Upgrade: +1 level, +2 efficiency (§2, §5); §9's "Level it up." | ✓ |
| The icon, the splash | `apps/mobile/assets/icon.png`, `splash-icon.png`, `app.config.ts` | ✓ |
| `Minting your Sneaker…`, Home with `#0003`, `LEVEL 01 / 30`, `DURABILITY 100 / 100`, `EFFICIENCY 10`, `ENERGY 10 / 10`, balance `0` | Reel 6.5–15.0 s (a new player's starter Sneaker, 2026-10-07) | ✓ |
| The run: 0:04 → 2:29, 0 → 161 m, +0 → +10 STRIDE estimated | Reel 16.5–25.0 s | ✓ The app's own screen, sped up. Never restate it as a claim ("a 2-minute walk paid 10 STRIDE" is banned, `voice.md` §3) |
| `Settling on Monad…`, `+10 STRIDE`, rewarded minutes `2`, durability lost `−1`, the run's stats | Reel 28.5–34.0 s | ✓ The app shows the disclaimer under the amount itself |
| Repair: `Durability 99 → 100`, `STRIDE balance 10 → 9.3`, `Confirming on Monad…`, `Sneaker repaired`, `Spent 0.7 STRIDE` | Reel 36.0–42.5 s | ✓ |
| Upgrade: `50 STRIDE`, `Level 1 → 2`, `Efficiency 10 → 12`, `Confirming on Monad…`, `CONFIRMED ON MONAD`, `Level 2 reached`, `Spent 50 STRIDE` | `UpgradePanel.tsx`, `SneakerTransactionSheet.tsx`; cost 50 × level and +2 efficiency (§2); a real 1 → 2 upgrade (§5, v2 M11) | ⚠ **A rebuild, not footage.** That real upgrade was Sneaker #2 when the token was SOLE, and the reel never shows #3 upgrading. It shows how upgrading works, with the app's real words and real rules. **Show no STRIDE balance anywhere in this beat**: the repair left 9.3, which can't pay 50, so leave out the confirmation sheet's balance row and the panel's "You have N STRIDE" |
| #0003's art at level 2 | `SneakerArtRenderer`, read-only `eth_call` (as §8 did for #2) | ✓ Real renderer output. Check level 1 against the reel first (§4) |
| `Walk. Earn. Upgrade.` · `StrideMon` · `Ready to move?` · `stridemon.xyz` · `ANDROID DEMO` · `MONAD TESTNET` | §1, §9 (row 7: `MONAD TESTNET • ANDROID DEMO`); D-040; "Ready to move?" is a question and claims nothing | ✓ |
| `Monad testnet. STRIDE has no monetary value.` | `voice.md` §4 | ✓ Required: STRIDE amounts are on screen |

If you want different headlines, propose at most two alternatives per section at STOP 1, each with
its FACTS row.

**Never on screen:** a price, worth, value, "earn money", airdrop, "mint" as a sale, "download
now", mainnet, a user count, STEPN, a store badge, anything Apple-shaped (no iPhone silhouette, no
Dynamic Island: it's an Android app), MetaMask's screens, the location-permission screen, any
wallet address or transaction hash, the reel's explorer pages (those are the 2026-10-07 contracts,
replaced on 2026-10-08), emoji, or anything of the reference's (its brand, colours, food or words).

### 3. The look: what this film borrows, and what it keeps

**Borrowed from the reference (allowed in this film only, Yash, 2026-10-16):**

- **A colour field per section, changed by a left-to-right wipe.** The launch film bans wipes and
  only flips between black and off-white. This film's sections change with the reference's wipe
  (§1): the same 35-frame curve, measured and written as one function, not approximated with one
  of our three beziers.
- **Lime and blue as full backgrounds.** Lime is already allowed as a fill behind black text.
  Blue appears once, as the climax's field.
- **Centred headlines, word by word with the wipe.** Each word does a masked rise as the wipe's
  edge passes it, the way the reference's words arrive. The launch film left-aligns with an
  optical pull-left. This film centres, like the reference.
- **Tap rings**, in the reference's two kinds: black on light screens, lime on dark ones.
- **Push-ins on the phone**, eased (the launch film makes punch-ins as cuts).
- **The heavier headline is an option.** Our type is Satoshi 400/500 with no bold, and the
  reference's headline is heavy. Set the headlines in Satoshi 500 by default, and show Satoshi 700
  next to it at STOP 1. Satoshi Bold is free from Fontshare under the same licence as the app's
  files; log it in `CREDITS.md` if Yash picks it.

**Kept, as in every StrideMon film:**

- Colours only from `theme.ts`, with no raw hex anywhere else. No gradients, no glow, no drop
  shadows.
- **Lime text only on dark:** on black, ink or the black pills, never on off-white or lime.
- Every move except the wipe uses the launch film's three eases. Nothing bounces or overshoots.
  Counters are IBM Plex Mono with tabular digits, and they land on beats.
- **No typewriter text.** The reference types its URL on; ours rises.
- **Never a dead frame:** holds drift slowly.
- **The art is the contract's own output.** Place, scale and move it, but never redraw it or change
  a path or a colour.
- **An Android phone.** Reuse `PhoneFrame` (the website's plain ink bezel). Show it at STOP 1
  with and without a small centred punch-hole camera.

### 4. How to build the hard parts

Prototype these first, in a throwaway `AppTourSpike` composition, before you style anything.

- **The wipe and the headline.** One `ColorWipe` component driven by the measured curve, with the
  incoming section's headline on its layer. Each word's rise starts when the edge crosses the
  word's left edge. Layer order: old field and headline, then new field and headline, then the
  phone, except in the last wipe, where the new field goes over the phone. Render one wipe next to
  the reference's (ffmpeg `hstack`, the same length) and make the curve match frame by frame.
- **The icon becoming the phone.** One element that animates its width, height, corner radius and
  content. At its start it's the icon (the dark square and the mark); at its end it's the phone's
  screen showing the splash. Its bezel fades in only as it lands. Don't cross-fade two pictures.
- **The footage.** The reel is 720 × 1560, 30 fps, and its top is already cropped to the app (no
  status bar). Cut each shot into 60 fps BT.709 intermediates in `public/footage/app-tour/`
  (gitignored) with a new `scripts/cut-app-tour-footage.sh`, the way `cut-footage.sh` does. Log
  every shot (in and out points, speed, what it shows) in a new `FOOTAGE.md` section, with a
  privacy pass. `Footage.tsx` assumes 586 × 1280 files: generalise it without changing a frame of
  the launch film. A push-in past about 70% of the frame width upscales the 720 px footage, so
  push in further only on rebuilt screens.
- **The speed ramp** for the run reuses `walk-ramp.ts`'s idea: a map from film frames to source
  frames, ramping up and back down so `+10 STRIDE` lands on a beat at normal speed.
- **The rebuilt screens.** `HomeCard` (for the draw-in), `UpgradePanel` and the transaction sheet,
  in `src/app-tour/components/`. **The upgrade's sheets are the same component as the repair's**
  (`SneakerTransactionSheet`): build the rebuild to match the reel's repair frames at 40.0 s
  (`Confirming on Monad…`) and 41.0 s (`Sneaker repaired`) within ±3 px, then change only the
  words and numbers. Match the Upgrade panel to the reel at 48.5–49.5 s, but enabled (as
  `UpgradePanel.tsx` renders it with enough STRIDE) and without its balance line.
- **#0003's art.** Get it from `SneakerArtRenderer` with a read-only `eth_call`, as `FACTS.md` §8
  did for #2. First render level 1 at durability 100 and check it matches the reel's card at
  10.5 s. If it doesn't, find the renderer the reel's contracts used (the D-038 addresses) before
  you go on. Then render level 2 at durability 100 (after the repair). Save the files in
  `public/sneaker/` with the existing naming, using a copy script.
- **The line draw** of the card's art in 1c reuses `SneakerArt`'s animation (launch prompt §4:
  `evolvePath`, about 40 frames, standard ease, lime last).
- **The camera.** One `phoneCamera(frame)` function in `src/app-tour/camera.ts` gives the phone's
  scale, position and rotation for every frame. That covers the slow grow, the two push-ins, the
  pull-backs and the end tilt, so no transforms are scattered through scenes.

### 5. Sound

- **The guide track.** Extract the reference's audio to `launch-video/public/audio/app-tour-guide.wav`
  (gitignored) and cut against it until Yash picks a track. It may play in the Studio, the spike
  and the STOP 2 animatic only. `scripts/render.sh` must refuse to make a delivery file with it,
  and it never goes in a file meant for posting. Delete it after delivery.
- **The real track: Yash picks it, you can't listen.** Find **three** candidates on Pixabay Music
  (Pixabay Content License). Check each track page for licence, Content ID status and genre. Skip
  any tagged AI-generated, and prefer tracks that aren't Content ID registered, since this goes on
  YouTube Shorts. Pixabay's site returns 403 to curl: fetch search and track pages from inside a
  Playwright page (`fetch()` in the page), and download from the CDN with
  `-e https://pixabay.com/`. What to look for:
  - Upbeat, bright and confident, about 95–110 BPM (the reference is 100), steady from the first
    beat, with no long intro: the icon lands on the first hit.
  - Energy that lifts around the first wipe (about 6 s) and keeps going.
  - A strong downbeat or drop you can place on the level-up (about 20.2 s), after a moment where
    stopping the music dead for about a beat and a half feels deliberate. The track's own break
    is best. If it has none, cut one.
  - A resolve or clean final hit you can land on the logo (about 24.1 s), with a tail or a quiet
    bar under the call to action.
  - One candidate close to the reference's feel (a bright pop, funk or house instrumental), one
    trendy (Brazilian phonk or jersey club, which Yash liked for the other films), and one in
    between (upbeat hip-hop).
  Measure each with librosa in a scratchpad venv: tempo stability by beat-time regression, the
  downbeats, the energy curve, and where the break or drop is. Add the downloads to
  `scripts/fetch-audio.sh`.
- **Cut like an edit, at full level.** The music is up front, not a bed. Wipe snaps, taps and
  counter landings sit on beats. The music stops dead as the blue wipe starts and comes back on
  the drop with "Level 2 reached". It resolves on the logo.
- **Effects: none by default** (the reference is music only). At STOP 2, also give me one version
  with a few punchy Pixabay effects: a short whoosh under each wipe's snap, a light tap on each
  ring, and one hit on "Level 2 reached". Log every file in `CREDITS.md`.
- **Mastering:** extend `scripts/render.sh` with `app-tour-9x16`: the same picture settings, the
  limiter and the BT.709 tags, two-pass loudnorm to −14 LUFS, and true peak −1 dBTP.

### 6. Build

- New compositions in `launch-video/src/Root.tsx`: `AppTour9x16` (1080 × 1920, 60 fps, the
  delivery), an `AppTourScenes-9x16` folder with each section on its own, and the spike while it's
  useful (delete it before delivery).
- Code in `launch-video/src/app-tour/`: `reference.md` (your measurements), `beats.ts` (the grid),
  `timeline.ts` (every section's frames, named once, derived from the grid), `camera.ts`,
  `wipe.ts` (the measured curve), `content.ts` (every word, mirroring `FACTS.md` §15), `footage.ts`
  (the shot list), `sound-cues.ts`, `components/` and `scenes/`. Shared components stay shared.
  **Don't change how the other films look or sound:** if you touch a shared component, render
  their scenes again and compare frames.
- Never edit anything in `website/`, `packages/`, `apps/` or any generated art. Never put
  `reference.mp4` or its frames in the project (scratchpad only), and use its audio only as §5
  allows.

**STOP 1:**

- `reference.md` (your measured breakdown, including the wipe curve and the audio analysis).
- The spike: one wipe with its headline next to the reference's wipe, and the icon becoming the
  phone. Short mp4s, plus a few stills.
- The shot list from the reel, the rebuild checks (each overlay within ±3 px), and #0003's level-1
  art against the reel's card.
- The run as footage and as `RunScreen`, side by side.
- The choices: the headline in Satoshi 500 and 700, section 5's headline in white and lime, the
  phone with and without a punch hole, and the end card's link (`stridemon.xyz` or
  `stridemon.xyz/pass`). Add any headline alternatives with their FACTS rows.
- The three music candidates: their pages, licences, analysis, and why each fits.
- Your storyboard as you'll build it (every section by frame).
- **Six styleframes** at 1080 × 1920: the cover (1c), the run mid push-in (2), `+10 STRIDE` (3),
  `Sneaker repaired` (4), `Level 2 reached` (5) and the call to action (7). Put each next to the
  matching reference frame.

**STOP 2:** the full animatic on the guide track (`launch-video/out/animatic/`), a contact sheet, and
a **side-by-side** of the reference and ours (ffmpeg `hstack`), so I can compare the motion beat by
beat. Plus three music previews (`out/previews/app-tour-<n>.mp4`): the same picture with each
candidate placed so its drop lands on frame 1211, and one with effects. I listen and pick.

**STOP 3:** the film retimed to the chosen track and polished (the wipes, the push-ins, the taps,
the mix).

### 7. Deliver

- `launch-video/out/stridemon-app-tour-9x16.mp4`: H.264, yuv420p, BT.709, 60 fps, AAC 48 kHz,
  `+faststart`, true peak −1 dBTP. Plus `-poster.png` (the `Level 2 reached` frame about 1 s after
  the drop, the best Reels cover) and `-silent.mp4` (for adding a song in Instagram's own library).
- Check it as Reels and Shorts play it: frames 0–7 make a good thumbnail, every word is inside the
  safe areas, and the in-phone numbers read at 390 px wide, muted, at full speed.
- Draft, with `approved:` left empty: one Reel in `social/instagram/posts/` (next number, following
  the files there) and one @stridemon post in `social/posts/`, both following `social/voice.md`.
  Put the testnet line in the caption, alt text that describes the five steps, and
  `stridemon.xyz?source=…` in the link (the X post's link goes in the first reply).
- Update `launch-video/README.md` (the film and its commands), `SCRIPT.md` (this film's
  storyboard as built, its on-screen text, reading time, and "What changed from the brief"),
  `FOOTAGE.md`, `FACTS.md` §15 and `CREDITS.md` (the music, any effects and any font). Add an
  "As built" note to the top of `docs/app-tour-video-prompt.md`, as the Pass chat brief has.
- **Done means:** `bunx tsc --noEmit` in `launch-video/` passes, `bun run lint` at the repo root
  passes, and the launch, waitlist, Sneaker drop, Pass chat and pitch films still render unchanged.

**Never:** run git, post or schedule anything anywhere, send a transaction, call anything but
read-only `GET`s and `eth_call`s, or edit `website/`, `packages/`, `apps/` or any generated art.
