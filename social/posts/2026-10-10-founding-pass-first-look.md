---
status: draft
account: stridemon
slot: 2026-10-10 15:00 UTC   # proposed: two days after the launch thread. If the launch moves, keep this two days after it
format: quote            # a quote-post of @stridemon's own "Who wants early access?" (2026-10-08)
pillar: proof
media:
  - path: packages/contracts/art/founding-pass/previews/x-founding-pass-teaser.png
    alt: "Six flat-panel sneaker drawings on a pale background, two per row. Each has a thick black outline, a cream sole, cream lace slats and a small lime tab at the heel. An orange runner; a blue high-top with a pale lightning bolt; a lime trail shoe with a jagged overlay and a lugged sole; a gold racing shoe with a tall curved sole; a mint-green chunky shoe with a layered sole; a red and pink skate shoe. Above them: STRIDEMON · FOUNDING PASS, and the line 1,000 designs. Each one minted once. Below: MONAD TESTNET · FREE · CAN'T BE SOLD OR SENT."
link_reply: https://stridemon.xyz/?source=x-stridemon#waitlist
sources:
  - docs/founding-pass-brief.md v5 §1, §3.1 (1,000 passes, one of one, each design minted once), §4.1 (drawn by a contract), §7 (the Founder Sneaker in the pass's design; can't be sold or sent), §5.3 (free, the server pays the gas)
  - docs/founding-pass/README.md (the gate opens after Metropolis judging ends on 2026-10-27, so minting is after the hackathon)
  - packages/contracts/art/founding-pass/README.md (the art system the image is drawn by)
  - website/src/content/waitlist.ts ("One email when it opens, nothing else")
approved: ""
x_url: ""
results: {}
---

<!-- Why this post: the first look at the Founding Pass, and a reason to join the waitlist. Post
     it as a quote of the account's own "Who wants early access?" (posted 2026-10-08): that post
     asked, and this one answers. The account is new, so the image does the work (a post
     non-followers stop for), and the closing question invites replies, which the ranking weighs
     above likes. Drop the question if it feels like bait.

     Before posting:
- [ ] The launch thread (2026-10-08-launch.md) went out first, so the account introduces the
      game before the hype
- [ ] Check the 4:5 crop in the composer
- [ ] Stay for the first hour and answer every reply (answers below)

     Claims, checked: "drawn by a contract" is how the passes are built (brief §4.1). The image
     is drawn by the Solidity renderer itself (Part 1b), and the designs are frozen (2026-10-08).
     It still shows no pass numbers, so nothing here promises a specific pass.

     Don't say the waitlist mints first (the 48-hour window) yet: the waitlist section on the site
     doesn't say so until Part 4. That gets its own post (ideas.md). -->

## Post (quote of "Who wants early access?")

StrideMon opens with 1,000 Founding Passes.

Every pass is a one-of-one design, drawn by a contract on Monad testnet, and can be minted once.

It also gives you your first Sneaker in the app, in the same design. That's the one you walk in.

Which would you pick?

## Reply (the link)

Free to mint, and we pay the gas. A pass can't be sold or sent, and it never turns into a token.

Minting opens after the Metropolis hackathon. The waitlist gets one email when it does: https://stridemon.xyz/?source=x-stridemon#waitlist

## Replies to expect

| Asked | Answer |
|---|---|
| "Airdrop?" / "Wen token?" | No. STRIDE is a testnet game token with no monetary value, and there's no sale or airdrop. The game is the point. |
| "Can I sell it later?" | No. A pass can't be sold or sent, and it isn't a token. It's your way in, and it stays with you. |
| "How much?" | Nothing. Minting is free and we pay the gas. |
| "When?" | After the Metropolis hackathon. The waitlist gets one email when minting opens: stridemon.xyz/#waitlist |
| "Can I choose mine?" | Yes. The whole gallery goes up before minting, and you pick the one you want. |
| "Which is the rarest?" | There are ten Legendaries. You'll see them when the gallery goes up. |
| "Mainnet?" | No, Monad testnet. |

## Media command

The image is generated with the rest of the art previews, from the repo root (needs
`rsvg-convert`; IBM Plex Mono and Satoshi come from the repo):

```bash
bun packages/contracts/art/founding-pass/build-founding-pass-art.ts
```

It writes `packages/contracts/art/founding-pass/previews/x-founding-pass-teaser.png` (1080 × 1350),
from the Solidity renderer's output.
