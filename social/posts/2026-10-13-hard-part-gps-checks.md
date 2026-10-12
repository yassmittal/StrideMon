---
status: posted
account: yash_mittal_dev
slot: 2026-10-13 16:00 UTC   # proposed. The launch quote promised these "this week": 1 of 3, then the outbox and the art on the next two days
format: thread
pillar: build-story
media:
  - post: 1
    path: social/media/2026-10-13-gps-minutes.png   # bash social/posters/render-poster.sh social/posters/2026-10-13-gps-minutes.html
    alt: "A pale poster. Small caps: STRIDEMON • BUILD NOTES, 01 / 03. Headline: Did you actually walk? Below: A minute only counts if you averaged 1–20 km/h during it. A dark panel, labelled ONE RUN, MINUTE BY MINUTE • EXAMPLE, shows four minutes on a 0 to 40 km/h track with the 1–20 km/h band marked: minute 1, walking at 4.2 km/h, counts. Minute 2, a 30-second red light at 2.5 km/h, counts. Minute 3, stood still at 0.0 km/h, doesn't. Minute 4, took the bus at 31 km/h, doesn't. Under it: Also thrown out: blurry fixes, jumps over 40 km/h, faked locations. Footer: MONAD TESTNET, STRIDEMON.XYZ."
link_reply: https://github.com/yassmittal/StrideMon/blob/main/docs/architecture/security.md
sources:
  - social/posts/2026-10-08-launch-quote-yash.md (the promise: "the GPS checks, a transaction outbox that never sends twice, and the on-chain art")
  - docs/architecture/security.md:56–60 (mock location rejects the run; bad-accuracy fixes dropped; jumps over 40 km/h dropped)
  - docs/decisions.md D-021 (a minute counts at an average of 1–20 km/h; 30 s standing inside a walking minute still counts)
  - docs/decisions.md D-024 (Android's cached last location: the first fix was 550–660 s before START in two real runs; fixes more than 60 s old on arrival are dropped)
approved: ""
x_url: ""
results: {}
---

<!-- 1 of 3 of the hard parts the launch quote (2026-10-08) promised. Casual builder's voice.
     No STRIDE amount, so no disclaimer. "About 10 minutes" is D-024's 550–660 s. Nothing here
     says the speed check is on-chain (it runs on the server). Post 1 can go out as a quote of
     the launch quote, so people see it's the promised follow-up. -->

## Post 1

I said I'd write about the hard parts of building @stridemon. First one: GPS.

The app has to know you actually walked. Not drove, not faked your location, not just stood around.

## Post 2

The rule I landed on: a minute counts if you averaged between 1 and 20 km/h during it.

Stop at a red light for 30 seconds? Still counts. Sit on a bus? Doesn't.

## Post 3

GPS is messier than I thought. Sometimes the phone thinks you teleported down the street.

So I throw out readings that are too inaccurate, and any jump faster than 40 km/h. If the phone reports a fake location, the whole run is rejected.

## Post 4

The weirdest bug: when you press START, Android first hands you the last location it remembers. In my test runs, that one was about 10 minutes old.

Now the app just ignores any location that's more than a minute old when it shows up.

## Post 5 (last)

Next up: how the server sends transactions without ever sending one twice.

All the rules are here if you're curious: https://github.com/yassmittal/StrideMon/blob/main/docs/architecture/security.md
