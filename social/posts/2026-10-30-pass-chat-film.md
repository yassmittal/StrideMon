---
status: draft
account: stridemon
slot: 2026-10-30 12:30 UTC   # Fridays: a film. Moved from 10-19 (never posted) on 2026-10-21
format: thread           # two posts: the film, then the link in the reply
pillar: proof
media:
  - path: launch-video/out/stridemon-pass-chat-16x9.mp4
    alt: "An 11.7-second film, 16:9, set to phonk music. A lime phone swings in over a blue sky with white clouds and shows a group chat: \"did u see the Founding Passes?\", \"the free ones on Monad?\", \"yeah, 1,000 designs. all 1 of 1\", \"i'm taking #0627\". The phone spins and becomes a card where the pass's sneaker, #0627 Lime Runner Day, a lime runner with a white sole, floats in the same sky. Ten other passes' sneakers burst out from behind it in different colours. It flips to black, \"isn't\" writes itself in lime by hand, and the line reads: \"This isn't a JPEG. It's your way into StrideMon.\" Under it, a white pill: stridemon.xyz/pass. The passes are minted on Monad testnet."
link_reply: https://stridemon.xyz/pass?source=x-stridemon
sources:
  - docs/founding-pass-brief.md §1 (1,000 passes, free, soulbound: it can't be sold or sent; early access to the app)
  - docs/founding-pass-brief.md §3 (the art is SVG the contract renders on-chain, FoundingPassArtRenderer)
  - launch-video/FACTS.md §14 (every word and design in the film)
  - launch-video/CREDITS.md (the music, the effects and the sky photo, with their licences)
approved: ""
x_url: ""
results: {}
---

<!-- Why this post: the film's joke ("This isn't a JPEG.") only lands because it's literally true.
     The art is an SVG the contract draws, and the pass can't be sold or sent. Post 1 says both
     plainly, so the joke reads as a fact and not as a dig at other NFTs. Say nothing about other
     projects in replies either.

     The end card no longer says MONAD TESTNET (Yash, STOP 1), and the chat says "on Monad" in a
     friend's words. So Post 1 and the alt text say "Monad testnet" (FACTS §14). No STRIDE amount
     is shown, so no STRIDE disclaimer is needed.

     The film is 16:9, like the reference it copies (Yash: 16:9 only), not the 4:5 that
     voice.md §6 suggests for clips. X plays 16:9 fine; check how it sits in the feed.

     #0627 and the ten burst designs were unminted and not pending on 2026-10-16
     (GET /v1/pass/collection: only #0137 minted). If one of them is minted before this goes out,
     the post is still true, but "The group chat picked #0627" would point at a pass someone owns:
     check again on the day.

     Before posting:
- [ ] Watch it once with sound on the phone (the drop should land on the spin's whip, and the
      music should stop dead on the flip to black)
- [ ] Watch it muted: the chat must read at phone size
- [ ] Re-check #0627 on stridemon.xyz/pass/627 (not minted)
- [ ] Open the link on a phone and check it lands on the gallery -->

## Post 1 (with the film) (crypto voice, voice.md §7)

the group chat picked #0627.

not a JPEG. every Founding Pass is an SVG the contract draws on Monad testnet. 1,000 designs, each a 1/1, free mint.

soulbound, so it's not for flipping. it's your way into StrideMon.

## Post 2 (reply to Post 1)

all 1,000 are in the gallery. which one would your group chat pick?

https://stridemon.xyz/pass?source=x-stridemon

## Media command

The film is rendered in `launch-video/` (not copied into `social/`). From `launch-video/`:

```bash
bun install
bash scripts/fetch-audio.sh           # the music and effects (CREDITS.md)
bash scripts/copy-pass-chat-art.sh    # the shoes and the sky (the sky photo is a hand download: the script says how)
bash scripts/render.sh pass-chat-16x9
```

It writes `out/stridemon-pass-chat-16x9.mp4` (11.7 s, 1920 × 1080, 60 fps, H.264 + AAC,
−14 LUFS), its `-poster.png` and `-silent.mp4`. The storyboard and sources are in
`launch-video/SCRIPT.md`, `FACTS.md` §14 and `CREDITS.md`.

## Replies to expect

| Asked | Answer |
|---|---|
| "What's the song?" | "Brazilian Phonk" by ScrewedQueen, from Pixabay. |
| "So what is it, if not a JPEG?" | An SVG the contract draws on Monad testnet, and early access to StrideMon. It can't be sold or sent. |
| "Can I buy one?" / "How much?" | There's nothing to buy. The passes are free to mint, and we pay the gas. |
| "When can I get #0627?" | The waitlist mints first, for 48 hours, then anyone can mint what's left. The dates are on stridemon.xyz/pass. |
| "Airdrop?" / "Wen token?" | No. STRIDE is a testnet game token with no monetary value, and there's no sale or airdrop. The game is the point. |
| "Mainnet?" | No, Monad testnet. |
