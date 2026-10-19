# social/directories/

The kit for free launch directories (`docs/waitlist-growth-plan.md` §4.6): every field ready to
paste, and the files to upload. Claude drafts; Yash submits. `voice.md` applies.

Give each directory its own link, `https://stridemon.xyz/pass?source=dir-<name>` (for example
`dir-peerlist`), so the waitlist count by `source` shows which ones work. If a form refuses a link
with a query string, use the plain `https://stridemon.xyz/pass`.

## The fields

| Field | Paste |
|---|---|
| Name | `StrideMon` |
| Tagline (46) | `Walk or run to level up a Sneaker NFT on Monad` |
| Website | `https://stridemon.xyz/pass?source=dir-<name>` |
| Code | `https://github.com/yassmittal/StrideMon` (MIT) |
| X | `https://x.com/stridemon` |
| YouTube | `https://www.youtube.com/@stridemon` |
| Categories | Health & Fitness, Games, Web3 (or NFT, or Blockchain, whichever the form has) |
| Pricing | Free |
| Platforms | Android (demo build), web |

**Short description (493 / 500),** for forms that cap it at 500. It's the Product Hunt one:

> StrideMon is a walking game on Monad testnet. Your Sneaker is an NFT. Press START, walk or run outside, press STOP, and the run settles on Monad: STRIDE lands in your wallet. Spend it to repair the Sneaker or level it up, so each minute earns more. Every run is checked before it pays, so driving earns nothing, and your route never goes on-chain. Early access: 1,000 free Founding Passes, each a one-of-one design drawn by a contract. Android first, open source. STRIDE has no monetary value.

**Long description,** for forms with room (about 2,250 characters). Plain text, no Markdown: most
forms show it as typed.

```text
StrideMon is a walking game on Monad testnet. Your Sneaker is an NFT, and you level it up by walking or running outside.

How it works
Press START and go for a walk or a run. Press STOP, and the game server checks the run before the contract settles it on Monad. STRIDE, the game's token, lands in your wallet, and the Sneaker loses a little durability. Spend STRIDE to repair the Sneaker or to level it up, so each minute earns more. Your Sneaker's level, efficiency and durability live on-chain, not in our database.

Fair and private
A minute only counts at 1 to 20 km/h on average, so driving earns nothing, and GPS jumps are dropped. Only your minutes and distance go on-chain, never your route.

A Sneaker drawn by a contract
The Sneaker's picture is an SVG that the contract itself draws. The app and the block explorer show the same image, and redraw it as the Sneaker levels up.

The Founding Pass: 1,000 free one-of-one designs
Before the game opens to everyone, 1,000 Founding Passes give early access. Each one is a different Sneaker design, from common to legendary, and every design can be browsed today at stridemon.xyz/pass. A pass is free, with no gas to pay. It can't be sent or sold, it isn't a token, and it never turns into one. Mint a pass, sign in to the app with the same wallet, and you get a Founder Sneaker in your pass's design.

The waitlist mints first
Joining the waitlist takes an email, or one tap with Google. No wallet needed to join. The waitlist window opens on Saturday 28 November at 14:30 UTC (20:00 IST), and people on the waitlist get 48 hours to pick their pass before anyone else. Invite 3 friends who join through your link, and your window opens an hour early, at 13:30 UTC, for up to 250 passes.

Nothing to buy
There's no token sale, no airdrop and nothing to buy. StrideMon runs on Monad testnet, and STRIDE has no monetary value. The game is the point.

Built in the open
StrideMon is built by one developer, Yash Mittal, and the code is open source under the MIT licence: github.com/yassmittal/StrideMon. It was entered in Monad's Metropolis hackathon. The app is an Expo and React Native build for Android, with the contracts in Solidity and a Fastify API. iOS comes later.

Questions are answered at stridemon.xyz/help.
```

## The files

Render or copy them into the gitignored `social/media/directories/` (the commands are below).

| Field | File | Size |
|---|---|---|
| Logo (500 × 500) | `logo-500.png`: the app icon, from `website/src/app/icon.svg` | 19 KB |
| Cover 1 | `og-home.png`: "Walk. Earn. Upgrade." and the Sneaker card | 1200 × 630 |
| Cover 2 | `og-pass.png`: "Founding Pass, 1,000 Sneaker designs. Pick yours." | 1200 × 630 |
| Cover 3 | `og-pass-542.png`: #0542 Nacreous, the Chunky Legendary | 1200 × 630 |
| Cover 4 | `og-waitlist.png`: "Join the waitlist" | 1200 × 630 |
| Demo video | `demo-pitch-16x9.mp4`: the 1:24 pitch with voiceover, 1920 × 1080 (also on YouTube: `https://www.youtube.com/watch?v=vUiliHJ99YY`) | 5.6 MB |

Never upload the app tour film (`stridemon-app-tour-9x16.mp4`): its music isn't licensed.

```bash
cd social/media/directories   # from the repo root; mkdir -p it first
rsvg-convert -w 500 -h 500 ../../../website/src/app/icon.svg -o logo-500.png
for p in "" pass waitlist pass/542; do
  curl -s -o "og-$(echo "${p:-home}" | tr / -).png" "https://stridemon.xyz/${p:+$p/}opengraph-image"
done
cp ../../../launch-video/out/pitch/stridemon-pitch-16x9.mp4 demo-pitch-16x9.mp4
```

## Where it's listed

Fill in the date and the link once a listing is up.

| Directory | Why | Submitted | Live link |
|---|---|---|---|
| Peerlist Launchpad | Indian builders, weekly launch board | | |
| DappRadar | Free, takes upcoming projects (add the contract addresses from `packages/contracts/README.md`) | | |
| Alchemy Dapp Store | Free intake form | | |
| Monad's ecosystem listing | Ask in the Monad Discord or the DeltaV team how projects get listed | | |
| BetaList | Free queue is slow, so submit early | | |
| Launching Next | Free queue | | |
| MicroLaunch | Free queue | | |
| TinyLaunch | Free queue | | |
| Uneed | Free queue | | |
| Fazier | Free queue | | |
| Indie Hackers | A product page and one build-story post | | |
| R1M Community App (Monad) | Monad-only ecosystem list with a website link: `app.r1m.team/monad/ecosystem` → Submit Project (fields below) | | |
| Monad Intelligence (Susano Labs) | Listed us by itself from the r/Monad post, but without a link: ask them (email or Telegram on the page) to add `https://stridemon.xyz` | auto, 2026-10 | https://news.susanolabs.com/monad/en/news/stridemon-prepares-move-to-earn-game-launch-on-monad-feed:21:t3_1x1ulww |

## R1M Community App

The form (checked 2026-10-20): `Project Logo` (PNG, JPG, WebP or SVG, max 2 MB), `Project Name *`,
`Category *`, `Description`, and `Links` (Website, X / Twitter, GitHub, Medium). Then "Submit for
Review". No fee and no wallet. It doesn't say whether testnet projects are accepted: they review.

| Field | Paste |
|---|---|
| Project Logo | `logo-500.png` |
| Project Name | `StrideMon` |
| Category | `Gaming` (11 listed, so less crowded than NFT) |
| Description (156) | `A walking game on Monad testnet. Walk or run outside to earn STRIDE, then repair and level up your Sneaker NFT. 1,000 free Founding Passes mint from 28 Nov.` |
| Website | `https://stridemon.xyz/pass?source=dir-r1m` |
| X / Twitter | `https://x.com/stridemon` |
| GitHub | `https://github.com/yassmittal/StrideMon` |
| Medium | leave empty |

Other listings there run 35 to 180 characters. If the box wants it shorter, use the tagline:
`Walk or run to level up a Sneaker NFT on Monad`. After 30 Nov, change "mint from 28 Nov" to
"open mint now", or drop that sentence.
