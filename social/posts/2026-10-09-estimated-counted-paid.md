---
status: idea             # BLOCKED: needs a fresh walk on the 2026-10-06 contracts (see below)
account: stridemon
slot: 2026-10-09 15:00 UTC   # proposed (D1)
format: single
pillar: proof
media:
  - path: social/media/2026-10-09-plus-10-stride.png   # replace with a still from the new run, or keep if the new run also pays 10
    alt: "A pale card. Small caps at the top: YOU EARNED • RUN SETTLED. A huge mono +10, then STRIDE. Underneath: A 3-MINUTE WALK • SETTLED ON MONAD TESTNET. Lower down: Earn STRIDE. Stop the run, and STRIDE lands in your wallet."
link_reply: ""           # the new run's settle transaction: https://testnet.monadvision.com/tx/<hash>
sources:
  - launch-video/FACTS.md §3, §9 (the shape of the post: estimate vs counted vs paid, from the 2026-10-04 run)
  - docs/decisions.md D-007 (the API reports minutes and distance; the contract computes the reward)
  - the new run: its summary screen and its SessionSettled event (add a row to FACTS.md)
approved: ""
x_url: ""
results: {}
---

<!-- Why this post: it shows the trust model in three lines, with a transaction anyone can open.

     Why it's blocked: the run behind these numbers (+15 estimated, 2 minutes, +10 paid; tx
     0x4c61…3a1b) settled on the abandoned 8.3 contracts in SOLE. Linking it now would send people
     to a dead contract with the old name (voice.md §4). Fix: walk once on the new contracts until
     the live estimate runs ahead of the final count (stop just after a minute ticks over), then
     put that run's three numbers and its transaction below. Its summary screenshot can be the media. -->

## Post

The app estimated 15 STRIDE.
The server counted 2 active minutes.
The contract paid 10.

The app only estimates. The server checks the GPS and reports minutes and distance. The contract applies the rules and mints.

Monad testnet. STRIDE has no monetary value.

## Reply (the link)

The settlement, on the explorer: https://testnet.monadvision.com/tx/<new hash>

## Media command

```bash
# Placeholder, from the launch film:
ffmpeg -y -ss 20.5 -i launch-video/out/stridemon-launch-4x5.mp4 -frames:v 1 social/media/2026-10-09-plus-10-stride.png
```
