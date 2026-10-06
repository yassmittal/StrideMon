---
status: draft
account: stridemon
slot: 2026-10-07 15:00 UTC   # proposed: the day before launch (D−1)
format: single
pillar: proof
media:
  - path: social/media/2026-10-07-sneaker-art-card.png
    alt: "A dark square card on a pale background with a white line drawing of a sneaker and one lime accent stroke. Top left reads STRIDEMON, top right #0002. Below it: LEVEL 02 / 30 with two lime ticks out of thirty, and DURABILITY 096 / 100 with a lime bar almost full. This is the Sneaker NFT's picture exactly as the contract on Monad testnet draws it."
link_reply: ""
sources:
  - docs/decisions.md D-030 (renderer, level ticks, durability bar, ERC-4906)
  - launch-video/FACTS.md §7–§8 (art is on-chain; lime fades as durability drops)
  - website/public/sneaker-art/sneaker-0002-level-02.svg. On 2026-10-06 it was byte-for-byte what the new renderer (0x080Dbf4D…f229) returns for renderImageSvg(2, (2, 12, 96, 10, 0))
approved: ""
x_url: ""
results: {}
---

<!-- Why this post: the account's first crypto post. If X locks new accounts on their first crypto
     post (announced 2026-04-01, unconfirmed whether live), it happens today, not on launch day.
     It also means the profile isn't empty when the launch goes out. No link, no tag, no STRIDE. -->

## Post

This Sneaker is drawn by a contract on Monad testnet.

The level ticks and the durability bar are read from the chain, so the picture changes as you walk, repair and level up.

Tomorrow: the game it belongs to.

## Media command

```bash
rsvg-convert -w 960 -h 960 website/public/sneaker-art/sneaker-0002-level-02.svg -o /tmp/art-960.png
ffmpeg -y -i /tmp/art-960.png -vf "pad=1080:1350:60:195:color=0xF0F1FA" social/media/2026-10-07-sneaker-art-card.png
```
