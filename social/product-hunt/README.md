---
status: draft
launch_date: ""            # proposed: Tue 2026-12-01, 12:01 AM PST (13:31 IST). See "When to launch"
approved: ""
ph_url: ""
results: {}
sources:
  - launch-video/FACTS.md §2 (rules), §7–§8 (on-chain art)
  - website/src/content/fair-play.ts, faq.ts, founding-pass.ts (dates, pass promise)
  - docs/founding-pass-brief.md (open mint, email codes, Brevo's 300 a day)
  - docs/hackathon-submission.md (videos), README.md "Built with AI"
---

# social/product-hunt/

StrideMon's Product Hunt launch kit (D-054): every field of the submission form, ready to paste,
the gallery images, the first comment, answers for the comments, and the launch-day checks. The
voice, vocabulary and never-say list are `../voice.md`. Claude drafts here and never submits,
schedules, logs in or comments. Yash does all of that, and only once his name is in `approved:`.

Product Hunt's own rules used below are from
[Prepare for your launch](https://www.producthunt.com/launch/preparing-for-launch) (checked
2026-10-16): tagline ≤ 60 characters, description ≤ 500, up to 3 launch tags, a square thumbnail
(240 × 240), at least 2 gallery images (1270 × 760), YouTube-only video with the full URL, no
shortened or tracking links, scheduling up to a month ahead.

## When to launch

**Proposed: Tuesday 1 December 2026, 12:01 AM PST (13:31 IST).** Yash decides.

- A product gets one real launch. Another needs a significant update, and Product Hunt reviews the
  request ([their post](https://www.producthunt.com/p/producthunt/how-often-should-you-launch-on-product-hunt)).
  So spend it when a visitor can *do* something the same day.
- Today a visitor can browse the 1,000 designs and join a waitlist for a mint six weeks away, or
  install an Android demo build whose progress resets on 21 November (D-049).
- From the open mint (Mon 30 Nov, 20:00 IST) anyone can mint a free pass on the website, on a
  laptop, then play in the app with a Founder Sneaker. Nothing resets after that.
- Tuesday, not Monday: Monday is mint day, so mint-day email codes and launch-day codes fall on
  different days of Brevo's 300-a-day limit. The full 24 hours also run with the mint already open.
- Schedule it from 1 November (a month ahead is the limit). Fill the form now: drafts save.
- If Part 10 moves the dates, move this to the day after the open mint.

Launching earlier still works with the "Launching before 21 November" variant of the first comment.

## Main info

| Field | Paste |
|---|---|
| Name | `StrideMon` |
| Tagline (46 / 60) | `Walk or run to level up a Sneaker NFT on Monad` |
| Links | `https://stridemon.xyz` (plain: Product Hunt rejects tracking links) |
| More links | `https://stridemon.xyz/pass`. Add the Google Play link here once the listing is live |
| Open source? | Yes: `https://github.com/yassmittal/StrideMon` |
| X account | `stridemon` |
| Launch tags | **Health & Fitness**, **Games**, **Web3** |

Other taglines, if the first one doesn't feel right:

- `A walking game where your Sneaker is an NFT on Monad` (52)
- `Walk to earn STRIDE, then spend it to upgrade your Sneaker` (58)

**Description (493 / 500):**

> StrideMon is a walking game on Monad testnet. Your Sneaker is an NFT. Press START, walk or run outside, press STOP, and the run settles on Monad: STRIDE lands in your wallet. Spend it to repair the Sneaker or level it up, so each minute earns more. Every run is checked before it pays, so driving earns nothing, and your route never goes on-chain. Early access: 1,000 free Founding Passes, each a one-of-one design drawn by a contract. Android first, open source. STRIDE has no monetary value.

It's true on either launch date: it never says how the first Sneaker is handed out.

## Images and media

Render everything from the repo root (headless Chrome, as for Instagram):

```bash
bash social/product-hunt/design/render.sh
```

| Field | File (in the gitignored `social/media/product-hunt/`) |
|---|---|
| Thumbnail | `thumbnail-240.png`: the app icon. Static: a GIF only moves on hover |
| Gallery 1 | `gallery-1-walk-earn-upgrade.png`: the headline, Home and an active run |
| Gallery 2 | `gallery-2-how-a-run-works.png`: START, STOP, settle, a real run summary, today's rules |
| Gallery 3 | `gallery-3-repair-and-upgrade.png`: repair, upgrade, send |
| Gallery 4 | `gallery-4-fair-play.png`: fair play, privacy, nothing to buy |
| Gallery 5 | `gallery-5-drawn-by-a-contract.png`: the contract's SVG next to MonadVision |
| Gallery 6 | `gallery-6-founding-pass.png`: four pass designs, one per rarity |
| Video | `https://www.youtube.com/watch?v=vUiliHJ99YY`: the 1:24 pitch with voiceover. The full URL: `youtu.be` links don't load |
| Interactive demo | Skip. The site is the demo |

The phone screens are the demo build's own (`website/public/screenshots/`, retaken for STRIDE on
2026-10-07). Gallery 3 uses the transfer screen, not the repair review sheet: on that sheet the
"STRIDE balance" label runs into the amount at this width.

## Makers and extras

- **Makers:** "I worked on this product": yes. Yash is the only maker, and hunts it himself.
- **Shoutouts (up to 3):** Claude Code (the README's "Built with AI"), Expo, Vercel. Use only ones
  that have a Product Hunt page.
- **Pricing:** Free.
- **Promo:** none.

## First comment

Product Hunt posts it the moment the launch goes live. Keep it plain, ask for feedback, never for
upvotes. **Yash writes the bracketed line in his own words.** It's the one thing nobody else can.

> Hi Product Hunt, I'm Yash. I built StrideMon on my own.
>
> [One or two lines on why you wanted to build it.]
>
> StrideMon is a walking game. Your Sneaker is an NFT on Monad. Press START and walk or run outside. Press STOP, the server checks the run, and the contract settles it: STRIDE goes to your wallet, and the Sneaker loses a little durability. Spend STRIDE to repair it or level it up, so each minute earns more.
>
> What I cared about:
> - Nothing to buy. There's no token sale and no airdrop. It runs on Monad testnet, and STRIDE has no monetary value.
> - The Sneaker is really yours. Its level, efficiency and durability live on-chain, and its picture is an SVG drawn by a contract, so the app and the explorer show the same image.
> - Fair and private. A minute only counts at 1–20 km/h on average, so driving earns nothing. Only minutes and distance go on-chain, never your route.
>
> How to try it today:
> 1. Pick one of the 1,000 Founding Passes at stridemon.xyz/pass and mint it. It's free, with no gas to pay. You need a wallet with Monad Testnet added, and stridemon.xyz/help shows how.
> 2. Get the Android app from stridemon.xyz and sign in with the same wallet. You get a Founder Sneaker in your pass's design.
> 3. Go for a walk.
>
> It's Android first. iOS comes later. The code is open: github.com/yassmittal/StrideMon
>
> I'd love your feedback on three things:
> - Was it clear what to do from the first screen?
> - If the wallet setup lost you, where?
> - What would make you open it again tomorrow?
>
> I'm here all day and will answer every comment.

### Launching before 21 November

Replace "How to try it today" and its three steps with:

> How to try it today: it's an Android demo build. Add Monad Testnet to MetaMask, get the app from stridemon.xyz and sign in. You get a free starter Sneaker and a little testnet MON for gas. This is a test period: on 21 November the game restarts on fresh contracts for early access, so what you earn now doesn't carry over. Early access comes as 1,000 free Founding Passes at stridemon.xyz/pass, and people on the waitlist mint first, from 28 November.

## Answers for the comments

The standing answers in `../voice.md` §4 apply as they are (airdrop, "can I play", iOS, driving,
what STRIDE is worth, the code). These cover what Product Hunt asks more often:

| Asked | Answer |
|---|---|
| "Why does this need crypto or an NFT?" | So the Sneaker is yours, not a row in my database. Its level and stats live on-chain, every reward is a transaction you can check on the explorer, and you can send the Sneaker to any wallet with its stats. On testnet none of it costs money. |
| "Do I need to buy crypto?" | No. You need a free wallet such as MetaMask with Monad Testnet added. StrideMon gives new players a little test MON for gas. |
| "What happens to my location data?" | Only active minutes and distance go on-chain, never your route. The server keeps the raw GPS points for 30 days to check runs, then deletes them. Details: stridemon.xyz/privacy |
| "How is it different from STEPN?" | The mechanics are STEPN-style: a Sneaker, energy, repairs and upgrades. In StrideMon you start with nothing to buy, the rules live in a verified contract, and it's on Monad testnet, so nothing has a price. |
| "Mainnet? Will STRIDE be worth something?" | Nothing like that is planned. StrideMon runs on Monad testnet, and STRIDE is a game token with no monetary value. |
| "Did you use AI?" | Yes, Claude Code, and the working instructions are public in the repo. I set the direction, made the calls and checked everything on a real Android phone. |

## The week before

- [ ] **The dates still hold:** the open mint is on, and passes are left. If Part 10 moved
      anything, update the first comment and `launch_date`.
- [ ] **The game-server key has MON:** each new founder costs it about 0.17 MON, the 0.1 MON drip
      included (1,000 founders ≈ 170 MON, `CLAUDE.md`). Top it up from the faucet.
- [ ] **Brevo's 300 emails a day.** Every mint needs an email code. A good launch day can pass
      300, and then codes stop until the next day. Decide before the launch: accept it, or move
      to SES ($0.10 per 1,000), as the brief suggests.
- [ ] **The help chatbot's $5 monthly cap** (`HELP_CHAT_MONTHLY_CAP_USD`). Visitors will ask it
      things: check this month's spend.
- [ ] `https://api.stridemon.xyz/health` answers `ok`, and the website runs its latest deploy.
- [ ] The YouTube video is public.
- [ ] If Google Play is live: add the link under "More links" and say "Get it on Google Play"
      in the first comment's step 2.
- [ ] Optional: Product Hunt adds `?ref=producthunt` to the links it sends people to, but the
      waitlist only records `?source=` (D-037), so Product Hunt sign-ups show as unknown. Reading
      `ref` as a fallback is a one-line change in `website/src/lib/waitlist-request.ts`.

## Launch day

- It goes live by itself at 12:01 AM PST if scheduled. The first comment posts with it.
- Share it in the first hour: a post on @stridemon and @yash_mittal_dev (draft them in
  `../posts/` once the date is set), LinkedIn, and the week's DeltaV update. Say it's live and
  ask for feedback. Never ask for upvotes, and never use upvote groups or paid services:
  Product Hunt discounts those votes.
- Answer every comment, quickly. Use the answers above.
- Keep an eye on the API's health, the game-server balance, Brevo's count and the chatbot.

## After

About 48 hours later, fill in `ph_url` and `results`: the day's rank, upvotes, comments, waitlist
sign-ups and mints that day.
