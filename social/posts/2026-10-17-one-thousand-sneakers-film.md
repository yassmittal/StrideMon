---
status: posted           # Yash, 2026-10-14 21:56 IST
account: stridemon
slot: 2026-10-17 15:00 UTC   # proposed: after the waitlist film (10-15) and Yash's Monad post (10-16)
format: thread           # two posts: @stridemon has no Premium, so 280 characters each
pillar: proof
media:
  - path: launch-video/out/stridemon-sneaker-drop-4x5.mp4
    alt: "A 30-second film, 4:5, cut to phonk music, with every cut on a beat. On black, a hiking sneaker draws itself as a white outline, then flips to ink on off-white and shrinks in a moment of silence. On the drop it fills in magenta and pink, edge to edge, labelled #0137 Rose Hiker Night, and the camera punches in on its heel and toe. Then a different flat-panel sneaker on every beat, all standing on the same line, while the background flips between black and off-white. The screen splits into 2, 4 and 9 sneakers that change on the beat, then pulls back until all 1,000 designs fill the frame. Out of the grid comes one shoe on black, #0020 Earthshine, LEGENDARY, in pink, mint and indigo, and then its Founder Sneaker card: Earthshine, level 01 of 30, durability 100 of 100. It ends on black: stridemon.xyz, StrideMon, Monad testnet."
link_reply: https://stridemon.xyz/pass?source=x-stridemon
sources:
  - docs/founding-pass-brief.md §1, §3.1 and §4.1 (1,000 designs, each one of one, drawn on-chain by the contract)
  - launch-video/FACTS.md §13 (every word and design in the film)
  - launch-video/CREDITS.md (the music and its licence)
approved: ""
x_url: ""
results: {}
---

<!-- Why this post: the other films explain the game and sell the waitlist. This one is just
     something to watch: the 1,000 Sneakers on the beat. It asks for nothing in Post 1, and the
     reply points to the gallery for anyone who wants to look closer.

     It says "Sneaker", never "drop" (no sale or date is implied), and shows no STRIDE amount, so
     it needs no testnet disclaimer beyond the end card's MONAD TESTNET.

     Before posting:
- [ ] Watch it once with sound on the phone (every cut should land on a hit)
- [ ] Check the 4:5 crop in the composer, and that it still reads muted
- [ ] Open the link on a phone and check it lands on the gallery -->

## Post 1 (with the film)

Pause it on any beat and pick one.

Which StrideMon Sneaker would you walk in?

## Post 2 (reply to Post 1)

All 1,000 are on the website. Find the one you'd walk in.

https://stridemon.xyz/pass?source=x-stridemon

## YouTube Shorts (the 9:16 cut)

File: `launch-video/out/stridemon-sneaker-drop-9x16.mp4`.

**Title:** 1,000 Sneakers, one beat · StrideMon

**Description:**

> Every Sneaker design in StrideMon's Founding Pass collection is drawn on-chain on Monad testnet,
> and each one exists once. All 1,000: stridemon.xyz/pass
>
> Music: "Drift Phonk" by Sub_Clair (Pixabay Content License).

The track is Content ID registered: expect an automatic claim, and dispute it with the Pixabay
Content License (`launch-video/CREDITS.md`).

## Media command

The film is rendered in `launch-video/` (not copied into `social/`). From `launch-video/`:

```bash
bun install
bash scripts/fetch-audio.sh            # the music (CREDITS.md)
bash scripts/copy-sneaker-drop-art.sh  # the Sneakers, #0020's picture and the flood's atlas
bash scripts/render.sh sneaker-drop-4x5
bash scripts/render.sh sneaker-drop-9x16
```

It writes `out/stridemon-sneaker-drop-4x5.mp4` and `-9x16.mp4` (30.0 s, 60 fps, H.264 + AAC,
−14 LUFS), each with a `-poster.png`, and a 4:5 `-silent.mp4`. The storyboard, sources and music
are in `launch-video/SCRIPT.md`, `FACTS.md` §13 and `CREDITS.md`.

## Replies to expect

| Asked | Answer |
|---|---|
| "What's the song?" | "Drift Phonk" by Sub_Clair, from Pixabay. |
| "Can I buy one?" / "How much?" | There's nothing to buy. The passes are free to mint, and we pay the gas. |
| "Airdrop?" / "Wen token?" | No. STRIDE is a testnet game token with no monetary value, and there's no sale or airdrop. The game is the point. |
| "Are they AI?" | No. Every design is built from flat-panel templates and colour families, and the contract draws it on-chain. |
| "Which one is the rarest?" | The ten Legendaries, one per template. #0020 Earthshine is the one at the end. |
| "Mainnet?" | No, Monad testnet. |
