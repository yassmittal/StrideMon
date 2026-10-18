---
status: draft
account: stridemon
slot: 2026-10-21 12:30 UTC   # proposed: 18:00 IST, clear of the daily 15:00 UTC countdown post
format: thread           # two posts: the film, then the link in the reply
pillar: proof
media:
  - path: launch-video/out/stridemon-app-tour-9x16.mp4
    alt: "A 30-second vertical tour of the StrideMon app on an Android phone, with music. The StrideMon icon, a white line Sneaker with a lime stripe on a dark tile, becomes the phone. Five steps follow, each on its own colour: 1, lime, \"Meet StrideMon.\": the app mints a free starter Sneaker, #0003, and its card draws itself (level 1 of 30, durability 100, efficiency 10, energy 10 of 10). 2, black, \"Walk or run.\": the run screen counts up to 2:29 and 161 m, and the estimate rises to +10 STRIDE. 3, off-white, \"Earn STRIDE.\": the run settles on Monad and the summary shows +10 STRIDE. 4, dark grey, \"Keep it running.\": a repair for 0.7 STRIDE takes durability from 99 to 100, confirmed on Monad. 5, blue, \"Level up.\": an upgrade for 50 STRIDE, \"Level 2 reached\", level 1 to 2 and efficiency 10 to 12, and the Sneaker's card redraws at level 2. It ends on lime: the StrideMon logo, \"Ready to move?\", stridemon.xyz, and two pills, Android demo and Monad testnet."
link_reply: https://stridemon.xyz/?source=x-stridemon
sources:
  - launch-video/FACTS.md §15 (every word and number in the film, and what's footage or rebuilt)
  - launch-video/FOOTAGE.md, "The App tour film" (the submission reel's clips)
  - launch-video/CREDITS.md (the font, the effects, and the music, which is unlicensed)
  - social/voice.md §4 (STRIDE amounts on screen: the testnet line goes in the post)
approved: ""
x_url: ""
results: {}
---

<!-- Why this post: the first film that shows the whole loop in the app itself, in 30 seconds:
     mint, walk, earn, repair, level up. It's proof the app works end to end, so it's a proof post.

     STRIDE amounts are on screen (+10, 0.7, 50) and the film's end card has no testnet line
     (Yash, 2026-10-17), so Post 1 carries it (voice.md §4).

     What the film is, honestly (FACTS.md §15): the run, the settle, the summary and the repair are
     the app's own screen recording (the submission reel, 2026-10-07). The upgrade is a rebuild with
     the app's real words and rules, because the reel never upgrades #3. Post 1 says how the app
     works and claims no recorded upgrade. Never restate the run as "a 2-minute walk paid
     10 STRIDE" (voice.md §3).

     THE MUSIC IS THE REFERENCE AD'S OWN TRACK, WHICH STRIDEMON HOLDS NO LICENCE FOR (Yash's
     choice, CREDITS.md). X doesn't run Content ID, but the rights holder can still report it. Not
     for Instagram. On YouTube it may get a Content ID claim (ads on it, or blocked in some
     countries). If that happens, swap the track (launch-video/README.md, "The App tour film's
     rebuilds, music and text").

     The film is 9:16. X plays vertical video fine in the feed; check how it sits on the phone.

     Before posting:
- [ ] Watch it once with sound on the phone (the music stops as the blue wipe starts and drops
      on "Level 2 reached")
- [ ] Watch it muted: the headlines and the in-phone numbers must read at phone size
- [ ] Open the link on a phone and check it lands on the home page -->

## Post 1 (with the film)

Did you like the original demo video?

no??

not even a little???

okay, here's another banger: app icon to a level 2 Sneaker in 30 seconds. Mint, touch grass, earn STRIDE, repair, level up. All onchain on Monad testnet.

Monad testnet. STRIDE has no monetary value.

## Post 2 (reply to Post 1)

It's an Android demo build on Monad testnet for now. The waitlist gets one email when it opens.

https://stridemon.xyz/?source=x-stridemon

## YouTube Shorts (if Yash posts it there)

Title (≤ 100 characters):

> StrideMon in 30 seconds: walk, earn STRIDE, level up your Sneaker

Description:

> A move-to-earn game on Monad testnet: walk or run with your Sneaker NFT, earn STRIDE, and spend
> it to repair and upgrade the Sneaker. An Android demo build for now.
>
> Monad testnet. STRIDE has no monetary value.
>
> https://stridemon.xyz/?source=yt-stridemon

The music may draw a Content ID claim there (see the note at the top).

## Media command

The film is rendered in `launch-video/` (not copied into `social/`). From `launch-video/`:

```bash
bun install
bash scripts/cut-app-tour-footage.sh       # the clips, from ../website/media-source/submission-reel.mp4
bash scripts/fetch-app-tour-sneaker-art.sh # Sneaker #3's pictures (read-only eth_calls)
bash scripts/fetch-audio.sh                # the music (from ../reference.mp4) and the effects
bash scripts/render.sh app-tour-9x16
```

It writes `out/stridemon-app-tour-9x16.mp4` (30 s, 1080 × 1920, 60 fps, H.264 + AAC, −14 LUFS),
its `-poster.png` ("Level 2 reached") and `-silent.mp4`. The storyboard and sources are in
`launch-video/SCRIPT.md`, `FACTS.md` §15 and `CREDITS.md`.

## Replies to expect

| Asked | Answer |
|---|---|
| "Can I play?" | It's an Android demo build on Monad testnet for now. The waitlist gets one email when it opens: stridemon.xyz/#waitlist |
| "What's STRIDE worth?" | Nothing. It's a testnet token for the game. |
| "Airdrop?" / "Wen token?" | No. STRIDE is a testnet game token with no monetary value, and there's no sale or airdrop. The game is the point. |
| "iOS?" | Android first. iOS comes later. |
| "Can I cheat by driving?" | No. A minute only counts at 1–20 km/h on average, and GPS jumps over 40 km/h are dropped. |
| "What's the song?" | Leave it unanswered: the track is unidentified, and we hold no licence for it. |
| "Mainnet?" | No, Monad testnet. |
