---
status: draft
account: stridemon
slot: 2026-10-15 15:00 UTC   # proposed: the day after the gallery post, so people have seen the designs first
format: thread           # two posts: @stridemon has no Premium, so 280 characters each
pillar: proof
media:
  - path: launch-video/out/stridemon-waitlist-4x5.mp4
    alt: "A 23-second film, 4:5, black and off-white. On black, a magenta hiking sneaker draws itself as a white outline, fills with colour and gets a lime heel tab, under the words 1,000 Founding Passes. A grid of 25 different flat sneaker cards fills the screen, then one card, #0137 Rose Hiker Night, then on black the Legendary #0020 Earthshine, in pink, mint and indigo, with LEGENDARY, 10 OF 1,000. The line says Each design exists once. Then: Your way into StrideMon, over the #0137 card, and Your Founder Sneaker, in the same design, over the same shoe on a dark panel whose laces draw in as a lime LACED label appears. Three lines: Free. We pay the gas. Can't be sold or sent. It stays with you. Last, Join the waitlist. Mint 48 hours before everyone else, with a waitlist form: you@example.com is filled in, Join the waitlist is pressed and the form says You're on the list. It ends on black: stridemon.xyz/pass, StrideMon, Monad testnet."
link_reply: https://stridemon.xyz/pass?source=x-stridemon#waitlist
sources:
  - docs/founding-pass-brief.md §5.1 (the mint opens with a 48-hour waitlist window), §5.3 (free, the server pays the gas), §1 and §3.1 (1,000 passes, each one of one)
  - website/src/content/waitlist.ts (heading "mint 48 hours before everyone else"; email only; "one email, when the waitlist window opens, and nothing else")
  - D-037 (the waitlist asks for an email, never a wallet)
  - launch-video/FACTS.md §12 (every word and number in the film)
approved: ""
x_url: ""
results: {}
---

<!-- Why this post: it gives one plain reason to join the waitlist (you mint 48 hours early) and
     says what joining takes (an email). This is the ideas.md line "The waitlist mints first",
     which waited on the site saying it. The waitlist section says it now (waitlist.ts).

     It gives no date. The planned times (website/src/content/founding-pass.ts) are only final
     after Part 10 sets them, and /pass shows the countdown. If someone asks "when?", give the
     reply below.

     If the first-look post (2026-10-10) hasn't gone out, post that one first. It uses the teaser
     image this post used before; this post now carries the waitlist film.

     Before posting:
- [ ] Open the link on a phone and check it lands on the waitlist form
- [ ] Check the 4:5 crop in the composer, and that the film plays muted
- [ ] Stay for the first hour and answer every reply (answers below) -->

## Post 1 (with the film)

Introducing the StrideMon Founding Pass.

It's your early access to the game. There are only 1,000 passes, and every one is a different Sneaker design. No two are the same.

Pick the one that fits you best.

## Media command

The film is rendered in `launch-video/` (not copied into `social/`). From `launch-video/`:

```bash
bun install
bash scripts/copy-pass-art.sh   # the pass art the film shows, from website/ and the art previews
bash scripts/fetch-audio.sh     # the music and sound effects (CREDITS.md)
bash scripts/render.sh waitlist-4x5
```

It writes `out/stridemon-waitlist-4x5.mp4` (22.7 s, 1080 × 1350, 60 fps, H.264 + AAC, −14 LUFS),
`-poster.png` and `-silent.mp4`. The script, sources and music are in `launch-video/SCRIPT.md`,
`FACTS.md` §12 and `CREDITS.md`.

## Post 2 (reply to Post 1)

When minting opens, people on the waitlist get the first 48 hours to themselves. You choose your pass before anyone else.

To join the waitlist, leave your email on the website. It's free, and there's nothing to buy.

https://stridemon.xyz/pass?source=x-stridemon#waitlist

## Replies to expect

| Asked | Answer |
|---|---|
| "When?" | Late November. The countdown is on stridemon.xyz/pass, and the waitlist gets one email when the window opens. |
| "Airdrop?" / "Wen token?" | No. STRIDE is a testnet game token with no monetary value, and there's no sale or airdrop. The game is the point. |
| "Can I sell it later?" | No. A pass can't be sold or sent, and it isn't a token. It's your way in, and it stays with you. |
| "How much?" | Nothing. Minting is free and we pay the gas. |
| "Why an email and not a wallet?" | You only need a wallet when you mint. Until then, an email is all we need to tell you the window is open. |
| "Can I choose mine?" | Yes. All 1,000 are on stridemon.xyz/pass. Heart the ones you like. |
| "iOS?" | Android first. iOS comes later. |
| "Mainnet?" | No, Monad testnet. |
