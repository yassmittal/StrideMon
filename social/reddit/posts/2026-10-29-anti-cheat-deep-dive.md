---
status: draft
subreddit: r/Monad
slot: 2026-10-29 15:00 UTC
flair: ""                    # Dev / Discussion, whichever the sub has
sources:
  - apps/api/src/lib/activity-validation/speed-band.ts (1–20 km/h per minute, 40 km/h jumps)
  - apps/api/src/lib/activity-validation/filter-plausible-samples.ts (mocked samples dropped)
  - website/src/content/fair-play.ts (the four checks, route never on-chain, 30-day deletion)
  - website/src/content/game-rules.ts (10 energy, one point back every 30 minutes)
  - social/voice.md §3 (the speed band runs in the API, not on-chain: the post says so)
approved: ""
reddit_url: ""
---

<!-- Reddit likes a builder showing the guts and admitting the gaps. Keep the "is it uncheatable?
     no" paragraph: it's what makes the post credible. No STRIDE amount, but the disclaimer line is
     there anyway because the post is about rewards. -->

## Title

how i stop people farming a walk-to-earn game by driving around (open source, Monad testnet)

## Body

building StrideMon: you walk or run outside, earn STRIDE on Monad testnet, and level up a Sneaker NFT. the first thing every crypto person asks me is "ok but can i just put my phone in a car / tape it to a ceiling fan / spoof gps"

so here's what actually runs. nothing fancy.

1. **speed band.** a minute only counts if your average speed that minute is 1–20 km/h. sitting still earns nothing, a car earns nothing. a fast cyclist also earns nothing, which is a tradeoff i'm ok with for now

2. **gps jumps.** if two fixes are more than 40 km/h apart, the jump gets thrown away instead of counted as distance. stops the "teleport across the city" thing

3. **mock locations.** android flags a mocked location, and those samples get dropped

4. **energy.** this one does more than all the gps stuff tbh. each Sneaker holds 10 energy, one point is one rewarded minute, and a point comes back every 30 min. so even a perfect cheat caps out at 10 minutes and then has to wait like everyone else

5. **settles once.** the server checks the run, then the contract settles it exactly once. you can't replay a run for double

1 to 3 run on the server, not on-chain. putting gps on-chain would be expensive and a privacy nightmare. what goes on-chain is just your active minutes and distance, never your route, and raw gps samples get deleted after 30 days.

is it uncheatable? no. someone with a rooted phone and enough patience can probably fake a believable walk. but the energy cap means there's not much to farm, and STRIDE has no monetary value (it's testnet), so the incentive to try is pretty low rn.

all of it is MIT, the checks are in `apps/api/src/lib/activity-validation`: https://github.com/yassmittal/StrideMon

what would you try first to break it? i'd rather hear it here than find out after the 28 Nov mint

(site's here if you want the rest: https://stridemon.xyz?source=reddit-monad)
