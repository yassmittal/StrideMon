---
status: draft
account: stridemon (Instagram)
slot: launch day + 3
format: carousel (4 slides)
pillar: proof
media:
  - path: social/media/instagram/post-06-pass-1-cover.png
    alt: "1,000 Founding Passes. Each design exists once. Free to mint on Monad testnet. Behind the words, all 1,000 Sneaker designs in rows, in every colour."
  - path: social/media/instagram/post-06-pass-2-designs.png
    alt: "No two alike. 10 shoe shapes, 14 colour families: 650 Common, 250 Uncommon, 90 Rare, 10 Legendary. Four designs: #0627 Lime Runner Day, Common; #0749 Rose Sock Day, Uncommon; #0888 Clay Spike Frost, Rare; #0298 Fogbow, Legendary."
  - path: social/media/instagram/post-06-pass-3-dates.png
    alt: "How to get yours. 28 November, 14:30 UTC: the waitlist mints first, for 48 hours. 30 November: the open mint, until all 1,000 are minted or 14 December. Free: StrideMon pays the gas. Planned dates."
  - path: social/media/instagram/post-06-pass-4-founder.png
    alt: "Your way into StrideMon. Pass #0137 Rose Hiker Night, a magenta hiking sneaker on a light card, and its Founder Sneaker in the app, the same shoe on a dark card at level 01. Free. Can't be sold or sent. It stays with you."
sources:
  - docs/founding-pass-brief.md §1, §3 (1,000 passes, one of one, free, can't be sent or sold; 650/250/90/10)
  - website/src/content/founding-pass-designs.ts (10 templates, 14 colour families; each design's name and rarity)
  - website/src/content/founding-pass.ts and GET /v1/pass/collection on 2026-10-16 (planned times; only #0137 minted)
  - launch-video/FACTS.md §12 ("Free. We pay the gas.", "Can't be sold or sent.", "It stays with you.")
  - packages/contracts/art/founding-pass/previews/ (pass-0137-minted, founder-sneaker-0137-minted)
approved: ""
ig_url: ""
results: {}
---

<!-- No price, worth, floor, "limited" or "don't miss out". "Free" and "can't be sold" are the
     point. Not "it isn't a token" (an ERC-721 pass is one in the technical sense, FACTS §12).

     Slide 2's four designs were unminted on 2026-10-16; check stridemon.xyz/pass/627, /749, /888
     and /298 on the day. Slide 4 is #0137's preview, labelled Example ("FOUNDER 042" is the
     preview's own example number).

     The dates are planned (Part 10 sets them). If they move, re-render slide 3 and fix the
     caption. -->

## Caption

1,000 Founding Passes. Each design exists once.

Every pass is a different Sneaker design, drawn on-chain by the contract: 10 shoe shapes, 14 colour families, 10 Legendaries. Mint one free on Monad testnet, and the app gives you a Founder Sneaker in the same design.

The waitlist mints first, for 48 hours from 28 November (planned). Then anyone can mint what's left.

It's free, StrideMon pays the gas, and a pass can't be sold or sent.

All 1,000 designs are on the website. Link in bio.

#indiedev #gamedev #web3gaming
