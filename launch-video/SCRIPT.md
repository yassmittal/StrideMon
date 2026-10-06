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
4. Action: stridemon.yashmittal.xyz.

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
7. **Walk. Earn. Upgrade.** · `StrideMon` · `MONAD TESTNET • ANDROID DEMO` · `stridemon.yashmittal.xyz →` ·
   STRIDE is a testnet token with no monetary value.

## Reading time

Each sentence stays up at least `0.4 s + words ÷ 3.5`: the longest, scene 6's 14 words, needs
4.4 s and has about 5.5 s.
