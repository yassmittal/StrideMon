# Script and storyboard

4:5 master, 60 fps, 2700 frames, 120 BPM (1 beat = 30 frames). Every line below is in
`src/content.ts`, and `FACTS.md` §9 gives each one its source.

**Revision 2 (2026-10-06, after STOP 4).** Yash's notes: this is the project's first film and
nobody knows StrideMon yet, so it has to be as simple as possible; and the token is renamed
**SOLE → STRIDE** everywhere. The film is now an intro, four numbered steps, one line on
ownership and the end card. Each scene says one thing in one headline and one plain sentence.

## Spine

1. What it is: a move-to-earn game on Monad.
2. How it works, in four steps: get a Sneaker, walk or run, earn STRIDE, level it up.
3. Why it matters: the Sneaker is really yours.
4. Action: stridemon.xyz.

## Storyboard as built

| # | Time | Beats | Section | What happens |
|---|---|---|---|---|
| 1 Intro | 0:00–0:04 | 0–8 | black | "Meet / StrideMon." rises on beat 0, "A move-to-earn game on Monad." on beat 2 |
| 2 Get a Sneaker | 0:04–0:10 | 8–20 | off-white | `STEP 1 OF 4`. The contract's starter Sneaker (level 01, durability 100) draws in. "Get a Sneaker." on beat 1, "Your Sneaker is an NFT. The first one is free." on beat 2 |
| 3 Walk or run | 0:10–0:16 | 20–32 | black | The music's kick comes in. `STEP 2 OF 4`. The rebuilt run screen, speed-ramped 1× → 6× → 1× over the real run (timer 1:53 → 2:17), with DISTANCE and ESTIMATED REWARD lifted out beside it. "Walk or run." / "The app tracks your time and distance as you go." |
| 4 Earn STRIDE | 0:16–0:23 | 32–46 | black → off-white | `STEP 3 OF 4`. The real STOP tap (press on beat 1). Flip on beat 3, `+10 STRIDE` counts up and lands on beat 4, with `A 3-MINUTE WALK • SETTLED ON MONAD TESTNET`. "Earn STRIDE." / "Stop the run, and STRIDE lands in your wallet." |
| 5 Level it up | 0:23–0:31 | 46–62 | black | `STEP 4 OF 4`. Durability 060 → 100 on beats 2–4 through the renderer's real output, then levels 02–05 on beats 6–9, each adding a speed line, and `STRIDE / MIN` 5 → 9. "Level it up." / "Spend STRIDE to repair and upgrade it. Each level earns more." |
| 6 Yours | 0:31–0:38 | 62–76 | off-white | The Sneaker; the owner rolls `0xdfAb…1465 → 0xe4ae…356f` on beat 4. "It’s really yours." / "It lives in your wallet. Send it to any wallet, and its stats go with it." |
| 7 End card | 0:38–0:45 | 76–90 | off-white | Walk. / Earn. / Upgrade. on beats 0–2. Beat 4: panel, wordmark, meta, pill. Beat 5: disclaimer. Holds (poster) |

**What changed from revision 1, and why**

- **Cut as jargon for a first-time viewer:** the settle transaction's hash and decoded event, the
  rule table, the four contract addresses, "1–20 km/h counts. Cars don't.", the MetaMask insert
  and the app-vs-MonadVision comparison. They're all still true (FACTS.md keeps them); they just
  aren't what a stranger needs in 45 s.
- **SOLE → STRIDE.** Real footage that shows the old name is out: the walk recording shows
  `+5/+10 SOLE` in the phone, and the settling screen says "Minting your SOLE". The walk now uses
  the vector rebuild of the run screen (checked against screenshot 03 within ±3 px), set in
  STRIDE and driven by the same recorded readouts. The STOP tap stays: its crop shows no token.
- **No cold-open macro:** the film opens by saying what StrideMon is. The old macro pull-back (and
  its motion blur) went with it; motion blur now runs only on the walk's fast stretch.
- **The music starts four bars earlier in the track** (46.045 s), so its kick lands on the walk.

## On-screen text, in order

1. **Meet StrideMon.** · A move-to-earn game on Monad.
2. `STEP 1 OF 4` · (art: `LEVEL 01 / 30`, `DURABILITY 100 / 100`) · **Get a Sneaker.** · Your Sneaker
   is an NFT. The first one is free.
3. `STEP 2 OF 4` · (rebuilt run screen) · `DISTANCE` `64 → 87 m` · `ESTIMATED REWARD` `+5 → +10 STRIDE` ·
   **Walk or run.** · The app tracks your time and distance as you go.
4. `STEP 3 OF 4` · (footage: `STOP`) · `YOU EARNED • RUN SETTLED` · `+10 STRIDE` ·
   `A 3-MINUTE WALK • SETTLED ON MONAD TESTNET` · **Earn STRIDE.** · Stop the run, and STRIDE lands
   in your wallet.
5. `STEP 4 OF 4` · (art: durability `060 → 100`, levels `01 → 05`) · `STRIDE / MIN` `5 → 9` ·
   **Level it up.** · Spend STRIDE to repair and upgrade it. Each level earns more.
6. (art) · `OWNER` `0xdfAb…1465 → 0xe4ae…356f` · **It’s really yours.** · It lives in your wallet.
   Send it to any wallet, and its stats go with it.
7. **Walk. Earn. Upgrade.** · `StrideMon` · `MONAD TESTNET • ANDROID DEMO` · `stridemon.xyz →` ·
   STRIDE is a testnet token with no monetary value.

## Reading time

Each sentence stays up at least `0.4 s + words ÷ 3.5`: the longest, scene 6's 14 words, needs
4.4 s and has about 5.5 s.

# The waitlist film

The Founding Pass waitlist film (`Waitlist4x5`), from `docs/waitlist-video-prompt.md`, for the post
`social/posts/2026-10-15-waitlist-mints-first.md`. 4:5, 60 fps, 1,364 frames (22.7 s), on the
music's grid: 124.052 BPM, so one beat is 29.02 frames (`src/waitlist/beats.ts`). Every line is in
`src/waitlist/content.ts`, and `FACTS.md` §12 gives each one its source.

**One job:** get a stranger to leave their email at `stridemon.xyz/pass`, for one reason: the
waitlist mints 48 hours before everyone else. It works muted. No dates, prices, counts or STRIDE
amounts.

## Storyboard as built

| # | Time | Beats | Frames | Section | What happens |
|---|---|---|---|---|---|
| 1 Hook | 0:00–0:03 | 0–6 | 0–174 | black | "1,000 Founding Passes." is set on frame 0 (the thumbnail). Founder Sneaker #0137 draws itself: its light rim as a line (already part drawn on frame 0), the panels fill from the sole up at beat 2.4, and the lime heel tab lands last on beat 4 (tick) |
| 2 One of one | 0:03–0:07 | 6–15 | 174–435 | off-white → black | The flip (thump) lands on the music's kick. Five rows of five real cards rise, one row per half beat (ticks); "Each design exists once." on beat 7. One cut to #0137 alone on beat 10. Flip to black on beat 12: the Legendary #0020 Earthshine, `LEGENDARY` in lime, `10 OF 1,000`. The line stays on through all three, flipping colour |
| 3 What it is | 0:07–0:12 | 15–25 | 435–726 | off-white → black | The #0137 card rises; "Your way into StrideMon." Flip on beat 19: its Founder Sneaker on the dark panel; "Your Founder Sneaker, in the same design." Its seven lace slats draw in from beat 21 as the eyelets give way, and `LACED` rises on beat 22.5 (tick) |
| 4 Promise | 0:12–0:15 | 25–32 | 726–929 | off-white | "Free. We pay the gas." / "Can't be sold or sent." / "It stays with you." stack on beats 25, 26.5 and 28 (ticks), with a `01 / 03` counter that label-rolls. The words dip out over 0.2 s before the cut |
| 5 Ask | 0:15–0:20 | 32–41 | 929–1190 | off-white | "Join the waitlist." / "Mint 48 hours before everyone else." The site's waitlist panel, rebuilt at 2.5×, rises on beat 33. The field label-rolls to `you@example.com` on 34 (tick). JOIN THE WAITLIST presses on 35 (tap): it steps from `#2B2E3A` to black like the site's, and rolls to `JOINING`. On 36 the panel answers "You're on the list." (tone) |
| 6 End card | 0:20–0:23 | 41–47 | 1190–1364 | black | Flip (thump): the two lines stay, now white. The white `stridemon.xyz/pass →` pill, then `StrideMon` and a lime dot with `MONAD TESTNET`. Holds 2.9 s; the music fades out. The last frame is the poster |

## On-screen text, in order

1. `FOUNDING PASS` · **1,000 Founding Passes.**
2. (25 cards) · **Each design exists once.** · (#0137 Rose Hiker Night, `COMMON · 1 OF 1`, on the
   card) · (#0020 Earthshine, `LEGENDARY · 1 OF 1`, on the card) · `LEGENDARY` `10 OF 1,000`
3. **Your way into StrideMon.** · (`FOUNDER SNEAKER #0137`, `Rose Hiker Night`, `LACED`, in the art) ·
   **Your Founder Sneaker, in the same design.**
4. `FOUNDING PASS` · **Free. We pay the gas.** · **Can't be sold or sent.** · **It stays with you.** ·
   `01 / 03` → `03 / 03`
5. `WAITLIST • FOUNDING PASS` · **Join the waitlist.** · **Mint 48 hours before everyone else.** ·
   `EMAIL` · `you@example.com` · `JOIN THE WAITLIST` → `JOINING` · "One email, when the waitlist
   window opens, and nothing else." → **You're on the list.** · "We'll email you once, when the
   waitlist window opens."
6. (the two lines stay) · `stridemon.xyz/pass →` · `StrideMon` · `MONAD TESTNET`

## Reading time

Each line stays up at least `0.4 s + words ÷ 3.5`. "Mint 48 hours before everyone else." (2.1 s)
is up for 7.0 s, enough to read it twice, and the end card holds 2.9 s. The tightest is "It stays
with you." (1.3 s needed, 1.7 s up).

## What changed from the brief, and why (approved at STOP 1)

- **22.7 s, not about 20:** what every line's reading time, the 48-hour line read twice and a 2.9 s
  end card add up to.
- **"Your Founder Sneaker, in the same design."** for the draft "Your first Sneaker…": players
  from the test period already had a Sneaker.
- **"It stays with you."** for the draft "Not a token.": a pass is an ERC-721, a token in the
  technical sense, and the film has no room to say what the site means by it.
- **The Founder Sneaker picture is cropped above its stats:** the laced preview shows level 06
  and durability 064, which a first walk doesn't give.
- **The headline is set on frame 0,** so the thumbnail isn't black; the drawing and the drift move
  from frame 1.
- **The end card is on black,** so it flips away from the off-white form. The form leaves out the
  optional phone choice.
- **The pass art** is the renderer's own SVGs, animated (drawn, revealed, cropped, the laced
  picture's slats drawn over the minted one, which shares every coordinate), never edited.

# The Sneaker drop film

The Sneaker drop film (`SneakerDrop4x5` for X, `SneakerDrop9x16` for YouTube Shorts), from
`docs/sneaker-drop-video-prompt.md`. 60 fps, 1,802 frames (30.0 s), music only: clip A of "Drift
Phonk" (`CREDITS.md`), 96.004 BPM, so a beat is 37.5 frames (`src/sneaker-drop/beats.ts`).

**One job:** something to watch. The Sneakers hit the beat, with almost no words. Every cut and
move is a hit from the measured hit map (`src/sneaker-drop/hits.ts`, made by
`scripts/build-sneaker-drop-hits.py`), named by its beat and kind in `src/sneaker-drop/timeline.ts`,
never a typed frame. The words are in `src/sneaker-drop/content.ts`, and `FACTS.md` §13 sources
each one.

## The mapping (decided once, `content.ts`)

| Hit | One shoe on screen | A split (2, 4 or 9) | The flood |
|---|---|---|---|
| kick | cut to the next shoe; on a bar's downbeat, flip black ↔ off-white | the next cell stamps a new shoe; on a downbeat, the next split cuts in | a step back |
| clap (0.65 strength and up; quieter ones are ghost notes) | cut | stamp | step |
| cowbell | a 3% punch, eased back over 14 frames | stamp | step |
| hat | nothing | nothing | step |
| stop (the music falls silent) | cut | | |

## Storyboard as built

| # | Frames | Beats | Section | What happens | On which hits |
|---|---|---|---|---|---|
| 1 Cold open | 0–149 | 0–3 | black | #0137 Rose Hiker Night draws itself in white: its outline is part drawn on frame 0 (the X thumbnail) and closes on the second cowbell note; its panels draw through the bar | cowbells on 16ths 3 and 6 punch it |
| 2 Build | 150–299 | 4–7 | black → off-white → black | The laces fill in. A punch-in on the heel. Flip to off-white with the drawing in ink. In the silence before the drop, back to black with the drawing small | cowbell beat 4 (laces), cowbells punch; clap beat 5¼ (punch-in); beat 7's hit (flip); the stop on 7¾ |
| 3 Drop | 300–449 | 8–11 | black | #0137 in colour, edge to edge, with the renderer's light rim; `#0137  ROSE HIKER NIGHT` rises. Punch-in on the heel, then the toe, then down to the size every shoe after it shares | the four kicks; cowbells punch |
| 4 One per kick | 450–899 | 12–23 | off-white, black, off-white | 12 shoes, one per beat, each on the same ground line and heel | kicks cut, downbeats flip, cowbells punch |
| 5 Escalation | 900–1349 | 24–35 | black, off-white, black | 2-up, 4-up, then 9-up splits; each new split cuts in on the downbeat, then every kick and cowbell stamps a new shoe into the next cell | downbeat kicks; kicks and cowbells stamp |
| 5 The flood | 1350–1499 | 36–39 | off-white | All 1,000 from the atlas: ten hard steps back around #0020's cell, from 4 columns to all 25 × 40 | every hit in the bar, hats included |
| 6 Legendary | 1500–1649 | 40–43 | black | Out of the flood to #0020 Earthshine alone. `#0020  EARTHSHINE` and `LEGENDARY` (lime) rise and stay. Cut to its Founder Sneaker picture as `SneakerArtRenderer` draws it | the join's kick; the clap on 41; the clap on 43 |
| 7 End card | 1650–1801 | 44 → | black | The music stops: the white `stridemon.xyz →` pill, then `StrideMon` and a lime dot with `MONAD TESTNET`. Holds through the tail; the last frame is the poster | the stop on beat 44 |

9:16 is the same timeline, laid out on its own (`src/sneaker-drop/layout.ts`): the shoes stand
higher so their toes clear the Shorts buttons, the splits fill the taller frame, the flood is
20 × 50, and no text sits below y 1536 or on the right edge.

## On-screen text, in order

1. (no words: the drawing)
2. `#0137  ROSE HIKER NIGHT`
3. `#0020  EARTHSHINE` · `LEGENDARY` · (`FOUNDER SNEAKER`, `#0020`, `Earthshine`, `LEVEL 01 / 30`,
   `DURABILITY 100 / 100`, in the art)
4. `stridemon.xyz →` · `StrideMon` · `MONAD TESTNET`

## Reading time

Each line stays up at least `0.4 s + words ÷ 3.5`. `#0137 ROSE HIKER NIGHT` (1.5 s needed) is up
2.5 s; `#0020 EARTHSHINE / LEGENDARY` (1.3 s) is up 1.9 s; the end card holds 2.5 s.

## Checks

- **Cut sync:** `bun scripts/check-sneaker-drop-cuts.ts <render> [threshold]` finds every cut
  (ffmpeg scene detection) and matches it to the hit map. On the final renders: 4:5, 23 cuts at
  the brief's 0.3 and 59 at 0.05; 9:16, 22 and 53. Every one sits on its hit's frame (offset 0).
- **The picture against the sound:** in the sync check's encoded file, each kick's frame starts
  8–26 ms before the onset's peak, so the picture never trails the hit.

## What changed from the brief, and why

- **The clip's cut points are 45 ms earlier** (`CREDITS.md`): every kick's attack starts about
  35 ms before the measured grid, so the approved join fell inside a kick and notched it. The
  bars, their order and the timeline are unchanged.
- **The build doesn't speed up to 16ths:** the music's build doesn't. It has the cowbell, two
  real claps, one big hit on beat 7 and 200 ms of near silence before the drop, so the picture
  follows exactly that, and the silence is its own beat (`stop`, a fifth kind in the hit map).
- **One scale for every shoe, not one height:** the renderer already registers all ten templates
  (ground at y 520, heel near x 56, about 890 units long). Equal heights would make a spike 1.57×
  longer than a hoop; one scale keeps the heel and ground fixed, so a cut reads as one Sneaker
  changing.
- **The drop holds #0137 for a bar,** framed four ways on its four kicks, so the biggest moment
  isn't one beat long and its label can be read.
- **Cowbells stamp the splits** (rather than straight 8ths, which would mean cutting on hats).
- **The Legendary is #0020 Earthshine:** its Founder Sneaker picture is the only Legendary one in
  a committed file. The picture cuts in on beat 43's clap (beat 42 has only a hat).

# The Pass chat film

The Pass chat film (`PassChat16x9`), from `docs/pass-chat-video-prompt.md`. 16:9 only, 1920 ×
1080, 60 fps, 702 frames (11.7 s). It copies the motion of a silent 7.5 s reference clip closely
(measured in `src/pass-chat/reference.md`), for StrideMon. Every frame is named once in
`src/pass-chat/timeline.ts`, every word is in `src/pass-chat/content.ts`, and `FACTS.md` §14
sources each one. Set to "Brazilian Phonk" by ScrewedQueen with Pixabay effects (`CREDITS.md`).

**One job:** a friend picks a pass in a group chat, and the film shows what it is: a Sneaker drawn
on-chain, one of 1,000, and a way into StrideMon, not a picture.

## Storyboard as built

| # | Scene | Frames | What happens | Sound |
|---|---|---|---|---|
| 1 | Phone in | 0–30 | The lime 3D phone swings in from the right over the sky photo, motion blurred. Frame 0 (the X thumbnail) already shows its back swinging in | a whoosh; the music fades in over 6 frames |
| 2 | Chat | 24–300 | Bubbles land on 24, 90, 156 and 222, each popping from its tail corner; the older ones scroll up 2 frames before each pop, so a new one never overlaps the last. The camera never stops: the phone turns, rolls and pushes in so the newest bubble sits near the middle. The sky pans | a pop per bubble (sent ones two semitones higher), over the track's lighter, bass-less part; a riser from the last bubble into the spin |
| 3 | Spin | 300–336 | The phone spins on Y, faster and faster, through its edge to its lime back with the StrideMon mark, motion blurred from 312 | a deep whoosh peaking on 336 |
| 4 | Card | 336–420 | A whip into the off-white page: the card arrives blurred and too big and settles in 12 frames. #0627 Lime Runner Day floats in the same sky, bobbing. `#0627  LIME RUNNER DAY` rises on 348 and drops out from 408 | **the drop** lands on 336 |
| 5 | Burst | 420–478 | The card grows to about 90% of the frame and ten other passes' shoes burst out from behind #0627 on a 2-frame stagger (first on 426), spinning and blurred, past the card's edges, then drift. Shoes over sky only, no track | a whoosh on 426, the music dipping 4 dB under it |
| 6 | Ring | 478–504 | The card shrinks into the middle, accelerating, and on 488 the frame flips to black. A lime scalloped ring closes in on `This`, fading over its last half | **the music stops dead** on 488, under a boom |
| 7 | "isn't" | 500–568 | "isn't" writes itself on in lime Knewave, stroke by stroke (7 strokes, 37 frames). Then the camera whips back (542) as `a JPEG.` slides in from the right with a horizontal blur (544) | a marker stroke per pen stroke over the boom's tail; a swoosh on 544, and **the drop again** from 543 |
| 8 | End | 568–701 | `It’s your way into StrideMon.` rises under the line (572). The white `stridemon.xyz/pass →` pill lands on 612. The last frame is the poster | a pop on the pill; the music fades out over the last 72 frames |

## On-screen text, in order

1. `Today 7:30 AM` · `Message`
2. did u see the **Founding Passes**? · the free ones on **Monad**? · yeah, **1,000** designs. all
   1 of 1 · i’m taking **#0627** (the bold words in lime script)
3. `#0627  LIME RUNNER DAY`
4. This **isn’t** a JPEG.
5. It’s your way into StrideMon. · `stridemon.xyz/pass →`

## Reading time

Each line stays up at least `0.4 s + words ÷ 3.5`.

- **The bubbles:** each stays on screen until the spin at 300, except bubble 1, which scrolls off
  the top as bubble 4 lands. Bubble 1 (needs 2.1 s) is up about 3.4 s, bubble 2 (1.8 s) 3.5 s,
  bubble 3 (2.4 s) 2.4 s and bubble 4 (1.3 s) 1.3 s.
- **The card's label** (1.5 s needed) is up 1.2 s, from 348 to 420, and fully risen for 0.8 s of
  that. It's under the rule, by choice: it repeats bubble 4's `#0627`, which the viewer has just
  read, and a longer hold stalls the reference's pace. It was already 0.2 s longer after STOP 2.
- **"This isn’t a JPEG."** (1.5 s) is whole from 558 to the end, 2.4 s. **"It’s your way into
  StrideMon."** (1.8 s) is up 2.2 s, and the pill 1.5 s.

At 390 px wide (a phone in the X feed) the bubble text, the label and the end card still read
(`out/pass-chat/delivery/at-390-sheet.png`).

## What changed from the brief, and why

- **No running track in the burst** (Yash, STOP 1: "remove these circles and black background,
  only sky background will look good"). The shoes burst out over the sky only.
- **The end card has no `StrideMon` wordmark or `MONAD TESTNET`** (Yash, STOP 1). The X post and
  its alt text say "Monad testnet" instead (`FACTS.md` §14).
- **The shoes have no ground ellipse:** a shoe floating in the sky has nothing to cast it on (Yash
  left the call to Claude at STOP 1).
- **Knewave**, not one of the three faces the brief named: the closest OFL match to the
  reference's heavy, slanted, round-ended marker (Yash's pick at STOP 1).
- **12 frames longer (702, not 690):** the card holds 84 frames, not 72, so its label gets more
  time and the growing card never runs into it. Every later scene follows from `timeline.ts`, so
  the flip is on 488 (not 476) and the pill on 612 (not 600). The pen takes 37 frames (the brief
  said about 34) for a natural hand.
- **The card's exit accelerates** (progress², as measured in the reference) instead of the
  standard ease, which stalled before the flip.
- **The sound** (Yash, 2026-10-16, after STOP 3: "i don't like the sound and stuff, put some good
  trendy song"): the brief asked for Kenney effects and, at most, a quiet music bed. The film now
  has "Brazilian Phonk" up front, cut like an edit (the drop on the whip, a dead stop on the
  flip, the drop again on "a JPEG."), and Pixabay effects: whooshes, a riser, a boom, a recorded
  marker and pops (`CREDITS.md`).
- **Motion blur is the film's own sub-frame sampler** (`components/SubFrameMotionBlur.tsx`):
  Remotion's canvas blur drew the 3D phone black, and `CameraMotionBlur` froze the wrong frames
  inside an offset `Sequence`. The phone's faces each carry their own full transform with
  `backface-visibility: hidden`, because Chrome's sorting dropped faces under a shared
  `preserve-3d`.
