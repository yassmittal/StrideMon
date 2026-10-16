---
status: draft
account: stridemon (Instagram)
slot: launch day + 1
format: image
pillar: deep-dive
media:
  - path: social/media/instagram/post-04-rules.png
    alt: "The rules live in the contract. 10 energy: 1 point is 1 rewarded minute, one comes back every 30 minutes. 0.5 STRIDE a minute per efficiency point. +2 efficiency per level, an upgrade costs 50 STRIDE times the level, up to level 30. 0.3 durability per minute."
sources:
  - docs/architecture/game-rules.md; launch-video/FACTS.md §2 (SneakerGame.getGameConfig, 2026-10-05)
approved: ""
ig_url: ""
results: {}
---

<!-- Today's values: an admin can retune them (setGameConfig), so the caption says "today", never
     "fixed forever" (FACTS §2). -->

## Caption

The rules live in the contract, not the app.

Energy: 10 points. 1 point is 1 rewarded minute, and one comes back every 30 minutes.
Reward: 0.5 STRIDE per efficiency point, for each rewarded minute.
Upgrade: 50 STRIDE × the level, for +2 efficiency. Up to level 30.
Durability: 0.3 lost per rewarded minute, rounded up for each run.

These are today's values. The app only estimates: the contract pays.

Monad testnet. STRIDE has no monetary value.

#gamedev #indiedev #web3gaming
