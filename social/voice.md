# Voice

How StrideMon writes on X. The reasoning and sources are in
[`../docs/social-plan.md`](../docs/social-plan.md) §5.

## 1. Tone

Simple and quiet, like the app. Plain sentences. Show the thing and let the numbers be the
excitement.

- @stridemon speaks as the product ("StrideMon…", "Your Sneaker…"). @yash_mittal_dev speaks as the
  builder ("I built…", "I learned…").
- No exclamation marks. No emoji, except at most one → or ✓ where it does a job.
- No "gm" posts, no engagement bait ("RT if…", "drop your wallet", "tag a friend").
- One idea per post. If it needs "and also", it's two posts.
- On @stridemon, a post is at most 280 characters (no Premium). A URL counts as 23.

## 2. Vocabulary

| Use | Not |
|---|---|
| **StrideMon** | Stridemon, STRIDEMON in prose |
| **Sneaker** (capital S, the NFT) | shoe, NFT on its own, item |
| **STRIDE** (always caps, the token) | stride, coins, points, tokens on its own |
| **Monad testnet**, **testnet MON** | Monad on its own when it means the network, MON on its own (mainnet MON has value) |
| **walk**, **run** (what the screens say); **activity session** only about code | workout, session on its own |
| **rewarded minutes**, **energy**, **durability**, **level**, **efficiency** | stamina, HP, XP |
| **settles on Monad** | "instant", or a seconds figure nobody measured |
| **waitlist** | whitelist, WL, allowlist |

## 3. Never say

- **Money:** earn money, income, passive income, yield, APY, ROI, profit, cash out; worth, price
  or value about STRIDE; investment, presale, mint price, floor.
- **Farming:** airdrop (except to say there isn't one), points program, eligibility, whitelist,
  WL, allowlist, "early users will…", snapshot.
- **Hype:** revolutionary, next-gen, game-changer, unleash, the future of fitness, LFG, WAGMI,
  moon, gem, alpha, don't miss out, 100x, "first ever" or "first on Monad" (unverified), leverage,
  unlock, dive into.
- **Untrue or unchecked:**
  - mainnet; download now; App Store or Play Store; "live on iOS"
  - "N users" or "N runners"; any number that isn't in `launch-video/FACTS.md` or a doc
  - "a 2-minute walk paid 10 STRIDE". It was a 3-minute walk with 2 rewarded minutes (FACTS §3).
  - "MetaMask updates the picture when you level up". It shows the art but doesn't refresh it.
    Say "the app and the explorer redraw it".
  - "cheat-proof"
  - the speed band (1–20 km/h) under an "on-chain" claim. That check runs in the API.
- **Other projects:** no claims about other apps ("most step apps…"), no STEPN dunking, and never
  "the next STEPN". "STEPN-style" is fine as a plain description of the mechanics.

## 4. Disclaimers

- **Any post that shows an amount of STRIDE** says, in the post or in its thread:
  `Monad testnet. STRIDE has no monetary value.`
- **The launch thread** also says there's no token sale, no airdrop and nothing to buy, and that
  the Android build is a demo build that isn't public yet. Its last post links the waitlist.
- **Old footage says SOLE.** The contracts were redeployed for STRIDE on 2026-10-06 (D-038), so
  the explorer and MetaMask now say STRIDE. But the website's screenshots, its demo video, the
  raw recordings and every transaction before that date say SOLE, on the abandoned contracts.
  - **Prefer new material:** a fresh walk on the new contracts, or the launch film (which says
    STRIDE).
  - **If a post must use old material,** it adds:
    `Recorded before the token was renamed from SOLE to STRIDE.`
  - **Never link a transaction or contract from before 2026-10-06** as if it were live. Current
    addresses are in `packages/contracts/README.md`.

### Standing answers (paste as they are)

| Asked | Answer |
|---|---|
| "Airdrop?" / "Wen token?" | No. STRIDE is a testnet game token with no monetary value, and there's no sale or airdrop. The game is the point. |
| "Can I play?" | It's an Android demo build on Monad testnet for now. The waitlist gets one email when it opens: stridemon.yashmittal.xyz/#waitlist |
| "iOS?" | Android first. iOS comes later. |
| "Can I cheat by driving?" | No. A minute only counts at 1–20 km/h on average, and GPS jumps over 40 km/h are dropped. |
| "What's STRIDE worth?" | Nothing. It's a testnet token for the game. |
| "Where's the code?" | github.com/yassmittal/StrideMon |

These match `website/src/content/faq.ts`. If one changes, change the other.

## 5. Hashtags, tags and replies

- **No hashtags.** Monad has no official one, and an invented one reads as spam. The one
  exception: if a hackathon's rules ask for a tag, use exactly that, once.
- **At most one @ tag per post**, and only when the post is about them: @monad for the launch and
  the Metropolis submission, @monad_dev for a developer deep dive. Never tag to get attention.
- **Replying to others:** only with something specific (a question about their build, a relevant
  detail from ours). Never drop the StrideMon link in someone else's thread unless they ask.
- **Links** go in the first reply, not in Post 1. Add `?source=x-stridemon` or `?source=x-yash` to
  site links, so the waitlist records which account sent people.

## 6. Images and clips

Taken from `docs/architecture/design-system.md`:

- Backgrounds are `#F0F1FA` (off-white) or `#000000`, and dark panels `#141515`. **Lime `#C1FF00`
  only on dark.** Blue `#1A2FFB` at most once.
- Satoshi 400 for reading text and 500 only for uppercase meta. IBM Plex Mono for numbers and
  addresses. No bold.
- Phones go in the site's plain flat frame. Never a photoreal iPhone: it's an Android app.
- "+" cross marks at least 2 px wide at 1080 px.
- **Banned:** gradients, glow, drop shadows, emoji in images, coins or cash, purple, and Monad's
  logo (text only).
- **Sizes:** images 1080 × 1350 (4:5). Video 4:5, ≤ 60 fps, ≤ 140 s, H.264 + AAC with
  `+faststart`, and it must make sense muted.
- **Every image has alt text:** what the screen shows, plus its key numbers.
