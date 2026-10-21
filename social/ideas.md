# Ideas

One line each: `pillar · account · idea · source`. When an idea gets a date, it becomes a file in
`posts/` and its line is deleted from here. The order follows `docs/social-plan.md` §8.

## The weekly rhythm to 28 Nov (from 2026-10-24)

A fixed slot for each series, so people know when to come back. Week 1 is drafted in `posts/`
(10-24 to 10-30). Slots are 15:00 UTC unless noted; Sundays are replies only.

- **Mon · count · stridemon:** quote the last count post with the day's number from `GET /v1/waitlist/count`. Real numbers only
- **Tue · shoe of the week · stridemon:** four real passes of one shoe and its counts from the design table (each shoe: 100, 65 Common, 25 Uncommon, 9 Rare, 1 Legendary). Order: Runner (10-27), Hiker (11-03), Hoop (11-10), Racer (11-17), Skate (11-24). Poster: copy `posters/2026-10-27-silhouette-runner.html`
- **Wed + Sat · "10 Legendaries, 10 skies" · stridemon:** one Legendary with one true fact about the sky it's named after, ending with when the next one comes. Wed at 12:30 UTC, Sat at 15:00 UTC. Poster: copy a `posters/*-legendary-*.html` (shared `legendary.css`). Cite a source for every sky fact
  - 1 Nacreous #0542 (Sat 10-24) · 2 Fire Rainbow #0309 (Wed 10-28) · 3 Sun Pillar #0911 (Sat 10-31) · 4 Moonbow #0678 (Wed 11-04) · 5 Glory #0498 (Sat 11-07) · 6 Heat Lightning #0877 (Wed 11-11) · 7 Afterglow #0185 (Sat 11-14) · 8 Fogbow #0298 (Wed 11-18) · 9 Airglow #0756 (Sat 11-21) · 10 Earthshine #0020 (Wed 11-25)
- **Wed · matchmaking · stridemon:** people reply with when they walk, a colour and a style; answer each with a pass from the site's quiz. Vary the prompt each week (a pass for a friend, for a night walker, for a colour)
- **Thu · builder log · yash:** what shipped, from `templates/changelog.md`. @stridemon reposts
- **Fri · a film · stridemon:** 12:30 UTC. Week 1 is the pass chat film; after that, a Reel cut or a new clip
- **Event posts, as they happen:** the 30-day mark (Thu 10-29 14:30 UTC), 14, 7, 3 and 1 day; the count passing 50, 100, 250, 500 and 1,000 ("more people than passes"); the first person to unlock the early hour, without a name (check D-058 and D-060: no "spots left"); Metropolis results (11-03, either way); early access starts (11-21)

## Next up (the plan's first three weeks)

- proof · stridemon · Send a Sneaker A → B with `LEVEL 02 • EFFICIENCY 12 • DURABILITY 100` intact (~15 s clip, the demo's "Send to another wallet" chapter) · FACTS §6
- deep-dive · stridemon · The picture is an SVG drawn by a contract: renderer split, ERC-4906, lime fading with durability (thread, level 1 → 5 strip from `launch-video/public/sneaker/`) · D-030
- build-story · yash · The crash at the first GPS fix: `RECEIVE_BOOT_COMPLETED` and expo/expo#48935 · D-023
- deep-dive · stridemon · The outbox: sign, save, then broadcast, so a crash never sends twice (thread) · D-012, D-019
- proof · stridemon · Repair and upgrade from the player's own wallet: 98 → 100, level 1 → 2 (~20 s clip, MetaMask on screen) · FACTS §5
- deep-dive · stridemon · Why driving earns nothing: 1–20 km/h per minute, 40 km/h jumps, mock locations (thread, walk loop) · D-021
- build-story · yash · The contract computes the reward; the server only reports minutes · D-007
- changelog · yash · Week 1 recap · —
- deep-dive · stridemon · The rules on-chain, as one dark card (energy, 0.5 × efficiency, 50 × level) · game-rules.md
- build-story · yash · `bson@7` crashing at import on Bun, and the pin · D-015
- proof · stridemon · Connect a wallet → you own a Sneaker: the starter mint and the gas drip · D-009
- build-story · yash · What I'd do differently, and what's next (marketplace, the iOS day) · roadmap.md
- changelog · yash · Week 2 recap · —

## Founding Pass (each one waits for the part that makes it true)

The first look is drafted: `posts/2026-10-10-founding-pass-first-look.md`. The plan is in
`docs/founding-pass/`.

- build-story · yash · The first side marks were a "W" and a "V", and the V looked like a brand's logo: drawing 10 silhouettes with no lookalikes · art/founding-pass/README.md
- deep-dive · stridemon · How 1,000 one-of-ones get picked: a seeded script, fair counts, no two sharing more than 4 of 6 visible layers (thread, the options sheet) · art/founding-pass/README.md
- proof · stridemon · It changes after your first walk: the same pass unlaced, then laced (two cards, once Part 2 puts it on-chain) · founding-pass-brief §2
- proof · stridemon · Your Founder Sneaker: your pass's design on the Sneaker you walk in (Part 6) · founding-pass-brief §7
- proof · stridemon · Preview week: a colour family a day, and a Legendary of the day (Part 10) · founding-pass-brief §5.1

## Later

- proof · stridemon · After the D-038 redeploy: "STRIDE is live on the explorer too", with a fresh settle transaction
- proof · stridemon · Metropolis results (2026-11-03), either way
- build-story · yash · Renaming a token after deploy: why it means a full redeploy · D-038
- build-story · yash · The blue button that stuck: JS-thread colour animations vs the native driver · D-031
- deep-dive · stridemon · The waitlist asks for an email, never a wallet, and why · D-037
