---
status: draft
account: yash_mittal_dev
slot: 2026-10-16 16:00 UTC   # proposed: the day after the hard-parts series ends. Move it before the Metropolis deadline (2026-10-14 09:29 IST) if you want judges to see it
format: single
pillar: build-story
media:
  - path: social/media/2026-10-16-why-monad.png   # bash social/posters/render-poster.sh social/posters/2026-10-16-why-monad.html
    alt: "A pale poster. Small caps: STRIDEMON • BUILD NOTES, WHY MONAD. Headline: Why I built it on Monad. A dark panel lists three reasons, numbered in lime. 01, One transaction per run: Press STOP, and the run settles on its own. The reward is on the summary screen seconds later. 02, Gas for every new player: Cheap enough to send each one a little, so they repair and upgrade from their own wallet. 03, Just the EVM: Plain ERC-721 and ERC-20 contracts, Foundry, MetaMask. Nothing new to learn. Footer: MONAD TESTNET, STRIDEMON.XYZ."
link_reply: https://stridemon.xyz/?source=x-yash
sources:
  - website/src/content/why-monad.ts (fast settlement, "seconds after STOP"; cheap gas pays for a drip to each new player; plain EVM, standard wallets like MetaMask)
  - docs/decisions.md D-005 (every run ends in its own transaction), D-016 (Foundry on Monad testnet)
  - social/voice.md §5 (one @ tag, only when the post is about them: this one is about why Monad)
approved: ""
x_url: ""
results: {}
---

<!-- Why this post: the reasons behind the chain, in Yash's own voice, with @monad tagged once
     because the post is about them. No STRIDE amount, so no disclaimer.

     Claims, checked: "seconds" is the website's own wording (why-monad.ts). "Cheap" is about
     the gas drip working at all; don't add a fee figure. Nothing compares Monad to a named chain.

     The 128 KB contract limit (the Founding Pass renderer at about 66 KB) is the most
     Monad-specific reason, but it's already Post 4 of the art thread (2026-10-15). If this goes
     out first, move that line here and drop it from the thread. -->

## Post

Why I built StrideMon on @monad, in plain words:

Every run is its own transaction. You press STOP and the reward is on your screen seconds later. That only works if blocks are fast.

Gas is cheap enough that I can send every new player a little, so they repair and upgrade from their own wallet, not mine.

And it's just the EVM. Normal contracts, Foundry, MetaMask. I didn't have to learn a new stack to build a game on it.

## Reply (the link)

The site and the waitlist: https://stridemon.xyz/?source=x-yash
