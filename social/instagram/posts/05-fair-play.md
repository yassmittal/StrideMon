---
status: draft
account: stridemon (Instagram)
slot: launch day + 2
format: image
pillar: deep-dive
media:
  - path: social/media/instagram/post-05-fair-play.png
    alt: "Driving earns nothing. 1 to 20 km/h on average, or the minute doesn't count. GPS jumps over 40 km/h are dropped, and mock locations are rejected on Android. Only minutes and distance go on-chain, and raw GPS is deleted after 30 days."
sources:
  - website/src/content/fair-play.ts
  - launch-video/FACTS.md §2 (the speed band is checked by the API, not on-chain)
  - docs/decisions.md D-021
approved: ""
ig_url: ""
results: {}
---

<!-- These checks run on the server. Never say "on-chain" or "the contract enforces" about the
     speed band, and never "cheat-proof" (voice.md §3). -->

## Caption

Driving earns nothing.

Every run is checked before it pays. A minute only counts at 1–20 km/h on average, so idling and riding in a car earn nothing. Jumps faster than 40 km/h between GPS fixes are dropped, and mock locations are rejected on Android.

Your route stays yours: only your active minutes and distance go on-chain. Raw GPS samples are deleted after 30 days.

#walking #running #indiedev
