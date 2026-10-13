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
