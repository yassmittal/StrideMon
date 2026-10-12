---
status: draft
account: yash_mittal_dev
slot: 2026-10-15 16:00 UTC   # proposed: the day after 2 of 3 (the outbox)
format: thread
pillar: build-story
media:
  - post: 1
    path: social/media/2026-10-15-drawn-by-a-contract.png   # bash social/posters/render-poster.sh social/posters/2026-10-15-drawn-by-a-contract.html
    alt: "A pale poster. Small caps: STRIDEMON • BUILD NOTES, 03 / 03. Headline: No image file. A contract draws it. Below: Same Sneaker, two moments. The picture follows its level and durability. Two dark cards side by side, each a white line drawing of a sneaker, Sneaker #0002, as the contract on Monad testnet draws it. Left, captioned Worn down: level 02 / 30 with two lime ticks and durability 060 / 100, the lime dimmer and the bar a bit over half. Right, captioned Repaired, levelled up: level 03 / 30 with three lime ticks and an extra speed line, durability 100 / 100, the lime bright and the bar full. Footer: MONAD TESTNET • EXAMPLE, STRIDEMON.XYZ."
link_reply: https://github.com/yassmittal/StrideMon/blob/main/packages/contracts/src/SneakerArtRenderer.sol
sources:
  - social/posts/2026-10-08-launch-quote-yash.md (the promise)
  - docs/decisions.md D-030 (the art lives in its own renderer contract; setArtRenderer swaps it without touching any Sneaker)
  - the poster's two drawings: the live SneakerArtRenderer (0xFd44…9669) via cast call renderImageSvg(2, (2, 12, 60, 10, 0), 0) and (2, (3, 14, 100, 10, 0), 0) on 2026-10-12, saved in social/posters/art/. Illustrative states (FACTS §8: no Sneaker was repaired from 60 or is at level 3), so the poster says EXAMPLE
  - launch-video/FACTS.md §7 (no IPFS, no server), §8 (a lime tick per level; lime opacity falls with durability)
  - FoundingPassArtRenderer deployed bytecode: 68,166 bytes with no linked libraries (packages/contracts/out/, measured 2026-10-12), about 66 KB; Ethereum's limit is 24 KB (EIP-170); Monad's is 128 KB (docs/decisions.md, CLAUDE.md)
approved: ""
x_url: ""
results: {}
---

<!-- 3 of 3, which closes the promise. Casual builder's voice. No STRIDE amount, so no disclaimer.

     Before posting:
- [ ] Check the 4:5 crop in the composer

     Overlaps the @stridemon art deep-dive in ideas.md. If both go out, @stridemon's should
     quote this one. -->

## Post 1 (with the art card)

Last hard part of building @stridemon: the Sneaker's picture.

There's no image file anywhere. A contract on Monad testnet draws it, from the Sneaker's level and durability.

## Post 2

Level up and it gets another lime tick. Walk a lot without repairing and the lime starts to fade. Repair it and it comes back.

So the picture always shows how your Sneaker is actually doing.

## Post 3

The tricky bit: I wanted to be able to change the drawing later without touching anyone's Sneaker.

So the drawing lives in its own small contract. For new art, I deploy a new one and point the Sneakers at it. Nobody's Sneaker changes.

## Post 4

The Founding Pass art is way bigger. That contract is about 66 KB. Ethereum's limit is 24 KB, so it wouldn't even fit there.

Monad allows 128 KB, so it went up as one contract. No splitting it into pieces.

## Post 5 (last)

That's all three. Thanks for reading along.

The code that draws the Sneaker: https://github.com/yassmittal/StrideMon/blob/main/packages/contracts/src/SneakerArtRenderer.sol
