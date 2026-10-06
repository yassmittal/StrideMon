# Script and storyboard (STOP 2)

4:5 master, 60 fps, 2700 frames, 120 BPM (1 beat = 30 frames). Every line below is in
`src/content.ts`, and `FACTS.md` §9 gives each one its source.

## Spine

1. Hook: you walk, and the run settles on Monad.
2. Stakes: your Sneaker and its rewards aren't rows in our database.
3. Reveal: own a Sneaker NFT, walk with it, earn SOLE, upgrade it.
4. Proof: the run's real settle transaction and four verified contracts.
5. Action: stridemon.yashmittal.xyz.

## Storyboard as built

| # | Time | Frames | Section | What happens |
|---|---|---|---|---|
| 1 | 0:00–0:03 | 0–180 | black | Macro (1.45×, 3.5× the phone view) of the rebuilt run screen: `RUN IN PROGRESS • SNEAKER #2`, timer **1:53 → 1:56** (ticks on beats 1, 3, 5). "Walk." rises on beat 2. On beat 4, a 36-frame pull-back to the phone |
| 2 | 0:03–0:08 | 180–480 | black | Real run footage, 1× → 8× → 1× (video2 187.75–212.0 s). Distance, speed and energy callouts mirror the phone frame by frame (energy 9 → 8, +5 → +10 estimate). Caption from beat 4 |
| 3 | 0:08–0:15 | 480–900 | black → off-white | Real STOP tap cropped to the button (press on beat 1). Real "Settling on Monad…" in the phone. Flip on beat 6, `+10` counts up and lands on beat 7, "Earn." rises. Hash, decoded event and VIEW TRANSACTION (the one blue) on beat 8 |
| 4 | 0:15–0:24 | 900–1440 | black | The contract's SVG draws in. Durability 060 → 100 through the renderer's real output. Real MetaMask confirm (1 s, tap on beat 8). Levels 02–05 on beats 9–12, each adding a speed line. Efficiency 10 → 18 and SOLE/min 5 → 9 roll. "Upgrade." on beat 13 |
| 5 | 0:24–0:31 | 1440–1860 | off-white | Statement, then the app card and MonadVision side by side, both from video2 at level 02 / durability 100. Beat 7: transfer, owner rolls `0xdfAb…1465 → 0xe4ae…356f`, stats locked |
| 6 | 0:31–0:38 | 1860–2280 | black | Five rule rows, one per beat. Beat 7: four contract addresses, `VERIFIED • MONAD TESTNET`, closing line |
| 7 | 0:38–0:45 | 2280–2700 | off-white | Walk. / Earn. / Upgrade. on beats 0–2. Beat 4: panel, wordmark, meta, pill. Beat 5: disclaimer. Holds 4 s (poster) |

**Changes from the brief's storyboard, and why**

- **Timer 1:53 → 1:56, not 2:49 → 2:52.** The walk footage follows the cold open, and there's too
  little footage after 2:52 for an 8× ramp, so the timer would have run backwards.
- **Scene 5 uses footage frames, not screenshots `02`/`09`.** Those two show durability 096 and 095,
  which contradicts "the same picture".
- **Scene 6 drops `1–20 KM/H`.** The API enforces it, not the contract (FACTS §9).
- **No MetaMask frame in scene 5:** no footage of it exists.
- **Settle speed isn't stated anywhere:** "seconds" was the default, and in the end no line needs it.

## On-screen text, in order

1. `RUN IN PROGRESS • SNEAKER #2` · `TIME` · `1:53`–`1:56` · `DISTANCE` `64 m` · `SPEED • 4.0 KM/H` ·
   `ENERGY LEFT (ESTIMATED) 9 / 10` · `ESTIMATED REWARD` `+5 SOLE` · app captions · `STOP` — **Walk.**
2. `DISTANCE` `64 → 93 m` · `SPEED` `4.0 → 3.2 KM/H` · `ENERGY LEFT (ESTIMATED)` `9 → 8 / 10` —
   *1–20 km/h counts. Cars don't.*
3. (footage: `STOP`, `Settling on Monad…`) · `YOU EARNED • RUN SETTLED` · `+10 SOLE` ·
   `SETTLED ON MONAD TESTNET • BLOCK 68183542` · `0x4c614ce4…9a233a1b` (full, 2 lines) ·
   `event SessionSettled` · `tokenId 2 · rewardedMinutes 2 · 10 SOLE` · `VIEW TRANSACTION ↗` — **Earn.**
4. *Repair it with SOLE.* · (art: `LEVEL 01 / 30`, `DURABILITY 060 → 100 / 100`) · *Your wallet signs it.* ·
   (footage: MetaMask `Transaction request`, `Monad Testnet`, `0.0126 MON`, `Confirm`) · *Each level pays
   more.* · `EFFICIENCY 10 → 18` · `SOLE / MIN 5 → 9` — **Upgrade.**
5. *Not points in an app. An NFT in your wallet.* · `ERC-721 • ART DRAWN BY THE CONTRACT` ·
   `IN THE APP` · `ON MONADVISION` · `OWNER 0xdfAb…1465 → 0xe4ae…356f` ·
   `LEVEL 02 • EFFICIENCY 12 • DURABILITY 100` — *Send it to any wallet. Its stats go with it.*
6. `THE RULES • ON-CHAIN` · `10 ENERGY` · `1 POINT = 1 MINUTE` · `0.5 SOLE × EFFICIENCY / MIN` ·
   `+2 EFFICIENCY / LEVEL` · `LEVEL 30 MAX` · four names and addresses · `VERIFIED • MONAD TESTNET` —
   *The contract enforces the rules. The app only estimates.*
7. **Walk. Earn. Upgrade.** · `StrideMon` · `MONAD TESTNET • ANDROID DEMO` · `stridemon.yashmittal.xyz →` ·
   *SOLE is a testnet token with no monetary value.*

## Three alternative hooks for scene 1

1. *This walk settles on Monad.* States the hook outright, but loses the triad.
2. *3 minutes. 2 counted. +10 SOLE.* All true (FACTS §3) and very concrete, but it spoils scene 3.
3. *Your steps, on-chain.* Short and punchy. It reads as a claim, so it needs scene 3 to back it.

## Styleframes

`out/styleframes/`: `4x5-1-cold-open`, `4x5-3-earn`, `4x5-4-upgrade`, `4x5-5-own-it`, `4x5-6-rules`,
`4x5-7-end-card`, `16x9-3-earn`, `16x9-7-end-card`, `9x16-3-earn`, `9x16-7-end-card` (all PNG).
