# Launch Video Prompt

The brief for StrideMon's **launch film**: a 45-second motion-designed video for launch day on X,
the hackathon submission and YouTube. It's not the landing page's raw demo cut
(`landing-page-video-prompt.md`). Paste everything below the line into a fresh Claude Code
session started in the repo root (`monad/`).

## Why it's shaped this way (research, 2026-10-05)

- **Length 45 s.** X ranks by completion rate. The best-performing range across 380k X clips is
  30–60 s, and Web3 launch films that convert run 20–60 s: under 20 s has no room for proof, and
  over 60 s loses the feed.
- **4:5 first, then 16:9 and 9:16, each laid out again for its frame, not cropped.** Taller
  frames take more of a phone feed than 16:9, and our footage is a tall phone UI. Judges and
  YouTube need 16:9. Reels and Shorts need 9:16.
- **60 fps.** UI motion, counters and pushes are the whole film, and 60 fps keeps them smooth. X
  and YouTube both accept it.
- **Designed to work muted.** Most feed video plays without sound, so the claims are carried by
  type and picture. Sound adds rhythm and weight. The cuts land on actions (a tap, a settle), and
  those actions sit on the music grid.
- **Show the product doing the thing in the first frame.** No logo intro and no countdown. The
  logo is the payoff at the end.
- **One proof point a viewer can check:** the real settle transaction and the verified contracts.
  Technical audiences read vague claims as red flags.
- **Remotion** (React + TypeScript, frame-exact, renders to MP4). It has official Claude Code skills
  and is free for individuals. It's our stack, and it can import the app's real tokens and the
  contract's real SVG.
- **Banned on purpose:** glow, bounce, typewriter text, gradient text, purple-to-blue backgrounds,
  abstract 3D grids and falling coins. Each one reads as a template, and the Lusion look we follow
  has none of them.

Sources: [opus.pro X video data](https://www.opus.pro/research/twitter-x-video-guide) ·
[buildlore: Web3 launch video](https://www.buildlore.top/blog/web3-launch-video) ·
[heyorca X specs 2026](https://www.heyorca.com/blog/x-twitter-media-specs-best-practices-2026) ·
[Remotion + coding agents](https://www.remotion.dev/docs/ai/coding-agents) ·
[motion-graphics-skills house rules](https://github.com/charlie947/motion-graphics-skills) ·
[Remotion licence](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md)

---

## The prompt

You are a senior motion designer and creative technologist. Think of someone who has cut launch
films for Linear, Arc and Apple-keynote-style product reels, and who builds every frame in code.
You're making the **launch film for StrideMon** in **Remotion**. Your bar: a motion designer
watching it can't tell it wasn't made in After Effects, and a crypto-native viewer can't find one
claim that isn't true.

Work in **gates**. At each **STOP**, show me the result and wait for my go-ahead. Never skip one.

### 0. Read first

- `CLAUDE.md` (repo rules). **Never run any git command.** Leave everything in the working tree.
- `MVP.md` §1 and §21 (what the game is and the demo story).
- `docs/architecture/design-system.md` (the Lusion-derived visual language: read all of it).
- `apps/mobile/src/theme/` (`colors.ts`, `typography.ts`, `motion.ts`, `layout.ts`, `radii.ts`):
  the exact tokens. The film uses these values and no others.
- `docs/architecture/game-rules.md` and `packages/contracts/deployments/10143.json` (every number
  and address that can appear on screen).
- `docs/landing-page-prompt.md` §1, §3, §4 (brand voice, colours, motion rules, the "Don't" list).
- `website/public/screenshots/*.png` (1080 × 2340, status bars already painted out) and the
  raw recordings in `website/media-source/video1.mp4` and `video2.mp4` (586 × 1280, ~7 min each,
  variable frame rate).
- `apps/mobile/assets/fonts/` (Satoshi Regular and Medium, plus `Satoshi-FFL.txt`: read the
  licence and confirm it allows use in a video before you use the font).

### 1. What StrideMon is (the only facts you may use)

A STEPN-style move-to-earn game on **Monad testnet**, live on Android. You own a **Sneaker NFT**,
walk or run with it to earn **STRIDE** (an ERC-20), and spend STRIDE to repair and level up the
Sneaker. The rules live in contracts, and so does the Sneaker's picture: `SneakerArtRenderer`
draws it as an SVG, so the app, MonadVision and MetaMask show the same image. Send the Sneaker to
any wallet and its stats go with it.

The app's own headline is **Walk. Earn. Upgrade.** That triad is the film's spine.

**Fact sheet rule:** before any animation, write `launch-video/FACTS.md`. It lists every word,
number, address and hash that will appear on screen, each with its source (file and line, a
screenshot, or a footage timestamp). Nothing goes on screen that isn't in it. In particular:

- Rules come from `game-rules.md`: max energy 10, 1 point = 1 rewarded minute, 1 point back every
  30 min, 0.5 STRIDE per efficiency point per minute, 1–20 km/h average counts, max level 30,
  +2 efficiency per level, upgrade 50 STRIDE × level.
- Verified on the phone: a 2-minute walk paid **+10 STRIDE** (screenshot `04`). Repair took durability
  96 → 100, level 1 → 2, and the next run paid 6 STRIDE/min (efficiency 12).
- **Settlement speed:** only state a number of seconds if you measured it in the footage, from
  the STOP tap to the reward appearing. Otherwise say "seconds", or nothing. No Monad TPS or
  benchmark claims.
- STRIDE is a testnet token with **no monetary value**. That line appears in the end card.
- Voice: plain and confident. No hype words ("revolutionary", "next-gen", "unleash"), no
  exclamation marks, no price or earnings claims, no "passive income".
- Monad appears **as text only**. Don't use Monad's logo or purple unless I give you their brand kit.

### 2. Research and see the material (no building yet)

1. **References, briefly (≤ 20 minutes).** Look at 4–6 current launch films in this family:
   Linear's release reels, Arc/Dia launches, Apple product film UI segments, Raycast, a strong
   recent Monad-ecosystem launch on X. Write 6–10 concrete, *stealable* techniques in
   `launch-video/RESEARCH.md`, each a single sentence with a timestamp, such as "hard-cuts a full
   UI to a 300% macro of one number on the downbeat". Skip adjectives.
2. **Watch the footage through frames.** You can't play video, so build contact sheets in your
   scratchpad, one frame every 2 s, 180 px wide, tiled 6 × 5 (60 s per sheet):

   ```bash
   ffmpeg -v error -ss 0 -t 60 -i website/media-source/video1.mp4 \
     -vf "fps=1/2,scale=180:-2,tile=6x5" -frames:v 1 v1_000-060.png
   ```

   Then pull full-size frames every 0.25 s around each key moment.
3. Write `launch-video/FOOTAGE.md`: a table per video, `start–end | on screen | usable? | notes`.
   Mark the money moments, each with exact in and out points: the START tap, walking, the STOP
   tap, "Settling on Monad…", the reward appearing, the MetaMask confirm sheet, the repair or
   level-up result, and the transfer.
4. **Privacy pass:** notifications, other apps, contacts, seed or password screens, status bar.
   List them with timestamps. Wallet addresses and testnet hashes are public and fine.
5. **Get the real Sneaker art at every state you'll animate.** The renderer is a `pure` function,
   so a read-only `eth_call` costs nothing and needs no key. For example, level 5, efficiency 18,
   durability 100:

   ```bash
   cast call 0x7e01732461C1879915C35E56e73Fd8569B289ADa \
     "renderImageSvg(uint256,(uint16,uint16,uint16,uint16,uint64))(string)" \
     2 "(5,18,100,10,0)" --rpc-url https://testnet-rpc.monad.xyz
   ```

   Save the SVGs to `launch-video/public/sneaker/` (for example, levels 1–5 at durability 100,
   plus level 2 at durability 60 and 96). The renderer adds one lime speed line per level (up to
   five) and fades the lime as durability drops, so the progression animation is the contract's
   own art. Never redraw the Sneaker by hand. **Never send a transaction** in this task: reads only.

**STOP 1:** send me `RESEARCH.md` highlights, `FOOTAGE.md`, the privacy findings and `FACTS.md`.

### 3. Script, storyboard and styleframes

Formats, decided:

| Cut | Size | Use | Notes |
|---|---|---|---|
| **Master** | **1080 × 1350 (4:5)** | X and LinkedIn launch post | Designed first |
| Wide | 1920 × 1080 (16:9) | YouTube, hackathon submission, landing page, talks | Laid out again, not cropped |
| Vertical | 1080 × 1920 (9:16) | Reels, Shorts, TikTok | Keep the top 220 px and bottom 380 px free of text (platform UI) |

All at **60 fps**, **45 s** (2700 frames). One codebase: each scene reads a layout map keyed by
aspect ratio, so type sizes, the phone's position and the caption placement are set per format.
Never take a centre crop of the master.

**The spine** (it must read as five plain sentences before any pixel is drawn):

1. *Hook:* you walk, and the run settles on Monad.
2. *Stakes:* most step rewards are points in someone else's database.
3. *Reveal:* StrideMon. Own a Sneaker NFT, walk with it, earn STRIDE, upgrade it.
4. *Proof:* the run's real settle transaction and four verified contracts.
5. *Action:* stridemon.yashmittal.xyz.

**Starting storyboard** (times for the 4:5 master; refine it and argue with it if you find better):

| # | Time | Frames | Scene |
|---|---|---|---|
| 1 | 0:00–0:03 | 0–180 | **Cold open, black.** Frame 0 is already the product: a macro of the active run's mono timer ticking 2:49 → 2:52, the lime "run in progress" dot, the meta `RUN IN PROGRESS • SNEAKER #2`. At 0:01 **"Walk."** rises from a line mask, huge Satoshi, bottom left. At 0:02 a fast eased pull-back shows the whole active-run screen in a plain phone frame. |
| 2 | 0:03–0:08 | 180–480 | **Walk.** Real walking footage inside the phone, speed-ramped 1× → 8× → 1×. Next to it, numbers lifted out of the UI as 2.5D mono callouts framed by "+" marks: distance counting up, speed, and the energy bar draining lime 10 → 8. A small line: "1–20 km/h counts. Cars don't." |
| 3 | 0:08–0:14 | 480–840 | **Earn.** The real STOP tap at 1×, then "Settling on Monad…" from the footage. On the downbeat, a hard flip to off-white: **+10 STRIDE** in giant mono counting 0 → 10 (the last digit lands on the beat), meta `YOU EARNED • RUN SETTLED`. The proof: the real transaction hash in mono, and the `SessionSettled` event (footage or explorer, never mocked). **"Earn."** |
| 4 | 0:14–0:23 | 840–1380 | **Upgrade, black.** The contract's Sneaker SVG draws its lines in, then the lime accent, then the speed lines. Repair first: durability 060 → 100, the lime brightening as it fills. Then one level per beat, 01 → 05: a lime tick per level, a speed line per level, efficiency 10 → 18 in mono. A 1-second insert of the real MetaMask confirm sheet: the player's own wallet signs it. **"Upgrade."** Caption: "Each level pays more." |
| 5 | 0:23–0:31 | 1380–1860 | **Own it, off-white.** "Not points in an app. An NFT in your wallet." The same art in three frames at once: the app card, MonadVision (`09-explorer-nft.png`) and MetaMask (if the footage has it). "Drawn by a contract. The same picture everywhere." Then the transfer: owner `0x…A` → `0x…B` rolls over in mono while the line `LEVEL 02 • EFFICIENCY 12 • DURABILITY 100` stays locked. |
| 6 | 0:31–0:38 | 1860–2280 | **The rules are on-chain, black.** One mono stat card per beat: `10 ENERGY` · `1 POINT = 1 MINUTE` · `0.5 STRIDE × EFFICIENCY / MIN` · `1–20 KM/H` · `LEVEL 30 MAX`. Then the four contract addresses run past, with `VERIFIED • MONAD TESTNET`. Line: "The contract enforces the rules. The app only estimates." |
| 7 | 0:38–0:45 | 2280–2700 | **End card, off-white.** **Walk. Earn. Upgrade.** builds line by line on three beats. The dark Sneaker panel, the `StrideMon` wordmark, meta `LIVE ON MONAD TESTNET • ANDROID`, a pill with an arrow: `stridemon.yashmittal.xyz →`. Small: "STRIDE is a testnet token with no monetary value." Hold at least 2.5 s, so the last frame works as a poster. |

**Where pixels come from:**

- **Real footage** wherever reality matters: taps, walking, MetaMask, settling, the explorer. Only
  ever the recorded footage, never a re-enactment.
- **Vector rebuilds** of app screens (with the real fonts and tokens) only where you need a macro
  crop sharper than 586 px footage allows: the timer, +10 STRIDE, the Home card. Each rebuild must
  match its screenshot. Check it with a 50/50 overlay still against the PNG, and fix anything
  more than a few pixels off.
- The phone is a **plain flat frame** like the website's (`website/src/components/ui/phone-frame.tsx`:
  radius 28, 5 px bezel, ink colour). It is not a photoreal device, and certainly not an iPhone:
  this is an Android app.

**Styleframes:** render 6 stills with `remotion still` (frames from scenes 1, 3, 4, 5, 6 and 7)
at 4:5, plus scenes 3 and 7 at 16:9 and 9:16.

**STOP 2:** send me the script (all on-screen text, in order), the storyboard table as you
revised it, the styleframes, and three alternative hook lines for scene 1.

### 4. Motion language (non-negotiable)

Translate the Lusion system into time:

- **Easing:** only `Easing.bezier(0.4, 0, 0.1, 1)` (standard), `(0.35, 0, 0, 1)` (emphasised) and
  `(0.16, 1, 0.3, 1)` (out-expo, for big entrances). If you use `spring()`, set `damping: 200` and
  `overshootClamping: true`. **Nothing bounces, nothing overshoots.** No linear moves, except
  counters' digits and continuous drifts.
- **Durations:** most moves 18–30 frames (300–500 ms at 60 fps). Big camera pulls up to 42 frames.
- **Type entrances:** a masked rise (each line slides up 100% from behind its own clip, staggered
  4 frames per word), and the **label roll** from the site's pills (the text slides up while a copy
  slides in from below) for swapping words. No typewriter text, no per-letter scatter, no blur-in.
- **Cuts:** hard cuts. Section changes are **instant full-frame flips** between black (`#000000`)
  and off-white (`#F0F1FA`), with every element's colour flipping too, as Lusion's sections do.
  The only other transition is a ~0.2 s opacity dip inside the same colour. No wipes, no
  glitch, no zoom-blur transitions.
- **Punch-ins are cuts:** go from a full UI to a 250–400% macro of one number in a single cut on a
  beat, rather than an animated zoom.
- **Never a dead frame:** every hold has a slow eased drift (scale 1.00 → 1.03 or a 1–2% pan)
  so nothing is ever fully still.
- **Counters:** IBM Plex Mono with tabular digits, so the width never changes. Ease-out, and the
  final value lands on a beat.
- **Line draw:** the Sneaker's strokes draw with `strokeDasharray`/`strokeDashoffset` (or
  `@remotion/paths` `evolvePath`), 40 frames, standard ease, 3-frame stagger per path. Lime
  draws last.
- **"+" cross marks** snap in 2–4 frames before what they frame, so they read as registration
  marks. Draw them at least 2 px at 1080 wide: 1 px lines shimmer and disappear after X's
  re-encode.
- **Colour:** lime `#C1FF00` **only on dark**, never as text on light. Blue `#1A2FFB` at most once
  or twice (the VIEW TRANSACTION link is the natural place). No gradients anywhere, no glow, no
  drop shadows except the site's one floating-pill shadow.
- **Type:** Satoshi 400 for everything readable; 500 only for uppercase meta and the pill. No
  bold. Display type line height 0.9–1.0, tracking −0.02 em, and optical pull-left (−0.05 ×
  font size) so the glyph edge sits on the margin. At 1080 wide: headlines 150–240 px, captions
  ≥ 44 px, meta ≥ 30 px, mono callouts ≥ 56 px.
- **Reading time:** every caption stays on screen at least `0.4 s + words ÷ 3.5 s`. Read the film
  muted and check that each scene still lands.
- **Motion blur:** use `@remotion/motion-blur` only on fast camera pulls and the walking speed
  ramp, subtly, never on type at rest.
- **Banned defaults:** glow, bounce, typewriter, gradient text, purple-to-blue backgrounds,
  particles, 3D grids, lens flares, coin or cash-register imagery, emoji, stock footage,
  confetti.

### 5. Sound (built for muted viewing, finished with sound)

- **Grid:** build the edit on **120 BPM**: one beat is 30 frames at 60 fps, and one bar is 2 s.
  Scene changes, flips, punch-ins and counter landings sit on beats. Keep the grid in one
  `beats.ts` so it can be re-timed.
- **Music:** I'll choose the track. Propose three from **Pixabay Music** (free commercial use, no
  attribution) with the criteria: minimal electronic, UK garage or minimal techno, 116–124 BPM, no
  vocals, a clear hit near 0:08 and a resolve near 0:38. Give me search terms and what to listen
  for. When I drop the file into `launch-video/public/audio/`, find its BPM and downbeats (Python
  `librosa` if available, otherwise ffmpeg onset analysis), then shift the grid to it. Trim and
  fade the music to fit the picture, not the other way around.
- **SFX:** quiet and tactile, from **CC0** sources (Kenney's UI and interface packs, Freesound CC0
  only). Include a soft tick for each counter landing, a low muted thump on each black/white flip,
  a real-feeling tap on STOP and the MetaMask confirm, and one clean tone for "+10 STRIDE". No
  whooshes on every move, no risers, no coin sounds. Record each file's source and licence in
  `launch-video/CREDITS.md`.
- **Mix:** music ducks about 4 dB under the key SFX. The final mix is **−14 LUFS integrated, −1 dBTP**
  (two-pass `loudnorm`), AAC 48 kHz.
- Until the music arrives, render a version with a click track on the grid so I can feel the timing.

### 6. Build

- **Project:** `launch-video/` at the repo root, its own Remotion project on Bun (its own
  `package.json` and `bun.lock`). Like `website/`, it is **not** a Bun workspace: don't add it to
  the root `package.json` and don't import `@stridemon/*`. Copy the token values from
  `apps/mobile/src/theme/` into `launch-video/src/theme.ts`, with a comment naming the source file.
  Scaffold the project, then install Remotion's agent skills (`bunx remotion skills add`) and
  follow them.
- **Structure:** `src/Root.tsx` registers three compositions (`Launch4x5`, `Launch16x9`,
  `Launch9x16`) that share `src/scenes/*` and a `layouts.ts` keyed by format. Keep copy and facts in
  `src/content.ts`, mirroring `FACTS.md`. Use full-word names with units (`durationInFrames`,
  `beatFrames`), as in `docs/conventions/coding-standards.md`.
- **Footage:** never point Remotion at the variable-frame-rate originals. Cut each needed segment
  to a **constant 60 fps** intermediate (`-vf fps=60`, high-quality H.264, no audio) in
  `launch-video/public/footage/`, with the status bar painted over as the screenshots are. Build
  speed ramps there with ffmpeg (`setpts` per segment) or by mapping composition frames to source
  time, and keep each ramp smooth.
- **Fonts:** load Satoshi from the app's TTFs and IBM Plex Mono through `@remotion/google-fonts`,
  and wait for both to load before rendering (`delayRender`), so no frame renders in a fallback font.
- **Biome:** `bun run lint` at the repo root must pass. Remotion doesn't need default exports, so
  keep named exports. Exclude `launch-video/public` and `launch-video/out` from Biome as `website/public` is.
- **Gitignore:** add `launch-video/out/`, `launch-video/public/footage/` and
  `launch-video/public/audio/` to the root `.gitignore` (a "Launch video" block). The source stays
  committable; renders and media don't.

**First, an animatic:** the whole 45 s at 4:5, with real timing and grey boxes or rough type, and
the click track. **STOP 3:** send me the animatic render and a contact sheet of it (one frame
every 0.5 s).

Then build the full film at 4:5. **STOP 4:** send the 4:5 render, a contact sheet, and six full-size
frames. After my notes, lay out 16:9 and 9:16 again.

### 7. Render and deliver

- Render with `--codec h264 --crf 16 --pixel-format yuv420p --color-space bt709`. Then remux or
  encode with `-movflags +faststart`, AAC 320 kbps at 48 kHz, and BT.709 tags, so lime and black
  don't wash out on X or YouTube.
- Into `launch-video/out/`:
  - `stridemon-launch-4x5.mp4`, `stridemon-launch-16x9.mp4`, `stridemon-launch-9x16.mp4`
  - a poster PNG per format (the end card)
  - `stridemon-launch-thumbnail-1280x720.png` for YouTube
  - `stridemon-launch-4x5-silent.mp4` (no audio, for autoplay embeds)
- **The compression test:** re-encode the 4:5 master the way X would (about 5 Mbps, 1080p) and
  inspect frames from it. Check that the hairlines and cross marks survive, that dark areas show no
  banding, and that the small text stays readable at phone size (look at a still downscaled to
  390 px wide).
- **QA before you call it done:** a contact sheet per format; one frame from the middle of every
  shot, checked for cut-off text, overlaps, safe-zone breaches and any word or number not in
  `FACTS.md`; `ffprobe` shows 60 fps, 2700 frames, the right size, and audio at −14 LUFS.
- Write `launch-video/README.md`: how to install, preview (`bunx remotion studio`), swap the music,
  re-time `beats.ts` and render each format with its exact commands.

**STOP 5:** report the files, their sizes and durations, the three contact sheets, and anything you
had to cut or change from the storyboard and why. Give me a ready-to-paste X post: two lines, no
hashtag spam, the URL. Don't post anything anywhere, and don't touch `website/` (embedding the
film on the landing page is a separate decision).

### Stretch (only if I say yes at STOP 5)

- A **15 s cut-down** at 9:16: scenes 1, 3 and 7 only.
- Two **6 s loops** for replies and Discord: the Sneaker levelling up 01 → 05, and +10 STRIDE
  settling.
