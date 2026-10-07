# Founding Pass Plan

The plan (2026-10-07) to turn the waitlist into a hype loop: **verify your email, get a numbered
Founding Pass NFT, and get into StrideMon before everyone else.** Decided as **D-041** the same day
(Yash's answers are in §8). It's built in three parts (§7). Part 1's spec is §4.5.

## The idea in one paragraph

The first **1,000 Striders** get a free, numbered, non-transferable **Founding Pass** on Monad.
You join on the website with your email, verify it with a 6-digit code, and get a place in line.
Sharing your link moves you up. Every few days a **wave** of the line gets an email with a claim
code. In the app, the code mints your pass to your wallet (gas-free, like the starter Sneaker), and
**the pass is what lets you mint a starter Sneaker and play**. Your first real walk **laces** the
pass (its on-chain art changes) and gives you **3 invite codes** that skip the line. When all 1,000
passes are out, the game opens to everyone, and the passes stay as proof of who was first.

## 1. What the research says (2026-10-07)

| Finding | What we take from it |
|---|---|
| **STEPN gated its beta behind activation codes.** Existing players earned one code per 10 energy spent; codes were dropped in Discord and Telegram and gone in minutes. Getting one could take days, and that scarcity made the app feel in demand. [1][2] | The closest precedent, and from our own genre. Invite codes **earned by moving** are the viral loop, and moving is the anti-farmer filter. |
| **Robinhood's waitlist reached about 1M sign-ups** with a visible place in line and a referral link that moved you up. Dropbox grew ~60% of sign-ups through referrals. [3][4] | A place-in-line number plus "share to move up" is the proven pre-launch mechanic. Only **verified** emails count as referrals. |
| **Monad itself sent 600k+ soulbound "1 Million Nads" NFTs**, described as non-transferable and holding no value, and airdrop rumours followed anyway. [5][6] | The Monad community already knows soulbound commemoratives. Expect "airdrop?" replies, and answer them plainly every time. |
| **Dynamic NFTs that level up with activity** (Typus "Tails", Station3's free Passport that levels with check-ins) [7] | The pass changes with what you do. We already draw the Sneaker on-chain (D-030), so the pass can be drawn the same way. |
| **Sybil filtering:** projects now reward deep activity on few wallets and filter clusters of shallow ones. [8] | A pass that needs a verified email, then a real walk to unlock invites, is worth little to a farmer. |
| **Google Play still requires 12 testers opted in for 14 days in a row** for new personal accounts, and now rejects tests where testers barely used the app. [9] | "Early access" can be literal: **Founders are the Play closed test.** Google's rule becomes a perk. (`play-store-release.md` step 7.) |
| **Email costs:** Resend is free for 3,000/month but only 100/day. Brevo is free for 300/day. Amazon SES is $0.10 per 1,000. [10][11] | A launch day can pass 100 sign-ups, so Brevo's free plan (or SES on the AWS account we already use) fits better than Resend. |
| **Monad mainnet gas:** a 200,000-gas transaction costs about $0.0005 at the minimum base fee; MON was about $0.034 in early October 2026. [12][13] | Even on mainnet, 1,000 pass mints would cost well under $1. Cost doesn't decide testnet vs mainnet (§8.1). |
| **Embedded wallets:** Privy's free plan covers 500 MAU, then $299/month. [14] | Not now. The app already has wallet sign-in, so the pass is claimed there and the website never needs a wallet. |
| **ERC-5192** is the final standard for soulbound ERC-721s (`locked()`, a `Locked` event at mint). [15] | Wallets and explorers can tell the pass can't move. |

## 2. Why this shape, and not "verify email → mint on the website"

The rough idea was: verify email → mint one NFT → early access. Three problems with doing it
literally, and how the plan solves each:

1. **"Early access" has to mean something.** Today anyone with the APK link in `README.md` can sign in
   and get a starter Sneaker, so a pass that unlocks nothing is a JPEG. The plan makes the pass the
   key to the starter Sneaker (behind a flag), plus Play closed-test seats once the app ships there.
2. **D-037 says the website asks for an email, never a wallet.** Minting on the website would need a
   wallet connector there (also heavy JavaScript against D-035's Lighthouse targets). The plan
   keeps the website email-only. The wallet appears where it already does: sign-in in the app.
3. **A free NFT for an email alone is farm food.** Making invites depend on a settled walk, and the
   pass non-transferable, means the only way to get value from it is to actually play.

## 3. The player's journey

```text
WEBSITE (stridemon.xyz/#waitlist, email only)
  1. Enter email (+ phone platform) ─► 6-digit code by email ─► enter code ─► verified
  2. "You're #312 in line. 1,000 Founding Passes. Share to move up."  [copy link]
     Each friend who verifies moves you up 10 places.

WAVE EMAIL (Yash opens a wave: the top N in line)
  3. "Wave 2 is open. Your Founding Pass code: STRD-7K2Q-M9"  + APK / Play link
     The link stridemon://claim?code=… opens the app with the code filled in.

APP
  4. Connect wallet → sign in (as today)
  5. No pass and the gate is on → "Enter your Founding Pass code" (instead of Minting)
  6. API checks the code → outbox mints Founding Pass #0313 (soulbound) → then the starter Sneaker + gas drip
  7. Home / Profile shows the pass: "FOUNDER #0313 · UNLACED"
  8. First settled walk → pass becomes LACED (art changes on-chain) → 3 invite codes in Profile
  9. Give an invite code to a friend → they skip the line (step 6 directly)

WHEN #1000 IS MINTED
 10. The gate turns off. Anyone can play. Passes stay as the founders' record.
```

## 4. What gets built

Follows the existing layers: contract → `@stridemon/chain` → shared zod contracts → API → app →
website. Everything reuses what's there (SIWE auth, the outbox, `SneakerArtRenderer`'s style,
the waitlist route, the waitlist section).

### 4.1 Contract: `FoundingPass` (new, separate from the game)

- ERC-721 + **ERC-5192** (`locked(tokenId)` always true; `Locked` emitted at mint; every transfer
  and approval reverts with `FoundingPassIsSoulbound()`). AccessControl.
- `mint(address to) → tokenId` (`MINTER_ROLE` = game-server key). Token ids 1–1,000.
  `MAX_SUPPLY = 1_000` is `immutable`. One pass per address (`FoundingPassAlreadyClaimed`).
- `setLaced(uint256 tokenId)` (`MINTER_ROLE`), once, after the first settled walk. Emits ERC-4906
  `MetadataUpdate`.
- `tokenURI` / `imageSvg` drawn on-chain by a swappable `FoundingPassArtRenderer`, in the same
  style as the Sneaker card: dark panel, "+" corner marks, `FOUNDER #0313`, `UNLACED` / `LACED`,
  and a lime lace line that appears once laced.
- **Separate from `SneakerNft` and `SneakerGame`** on purpose: game redeploys (8.3, D-038) must
  never wipe who the founders are.
- Foundry tests: soulbound transfers revert, the cap, one per address, laced once, roles.

### 4.2 API (`apps/api`)

| Piece | What it does |
|---|---|
| `POST /v1/waitlist` (changed) | Same as today, plus an optional `referralCode` (the page's `?ref=`). Sends a 6-digit code instead of finishing at once. Still answers the same for new and known emails. |
| `POST /v1/waitlist/verify` (new) | `{ email, verificationCode }` → marks `verifiedAt`, credits the referrer once, returns the place in line. Codes are hashed, expire in 10 min, 5 tries. |
| `GET /v1/waitlist/place?referralCode=` (new) | The "you're #312" view a returning visitor sees. |
| `POST /v1/founding-pass/claim` (new, 🔒 SIWE) | `{ claimCode }` → checks the code (unused, from an opened wave or an invite) → queues `mintFoundingPass` in the outbox, then the starter Sneaker. |
| `GET /v1/founding-pass/invites` (new, 🔒) | The player's 3 invite codes once their pass is laced. |
| Starter-mint gate | `request-starter-sneaker` reads `FoundingPass.balanceOf(wallet)` from the chain (the chain is the source of truth) when `EARLY_ACCESS_REQUIRED=true`. Wallets that already own a Sneaker are never blocked. |
| Lacing | After a `settleSession` confirms for a wallet whose pass isn't laced, the outbox queues `setLaced` and three invite codes are created. |
| Outbox kinds | `mintFoundingPass`, `laceFoundingPass` (beside `mintStarterSneaker`, `sendGasDrip`, `settleSession`). |
| `scripts/open-founding-wave` | Yash runs it: picks the top N verified, unwaved emails, creates claim codes, sends the wave email. `--dry-run` prints who. |
| Email | One small `services/email-sender.ts` over Brevo's (or SES's) HTTP API. Two templates: the 6-digit code, the wave invite. Plain text plus minimal HTML. |

**Collections:** `waitlistSignups` gains the line fields (§4.5). New `waitlistVerificationCodes`
(part 1) and `claimCodes` (part 2: `code`, `kind: 'wave' | 'invite' | 'judge'`, `issuedTo`,
`usedByWallet`, `usedAt`). Waves add `invitedInWave` to `waitlistSignups` (part 3).

### 4.3 App (`apps/mobile`)

- `features/founding-pass/`: claim screen (code field, prefilled from `stridemon://claim?code=`),
  `useFoundingPass` (reads `balanceOf`, `tokenOfOwner`, `imageSvg` with wagmi), the pass card
  (`SvgXml`, like `SneakerCard`), the invite codes list with share.
- Onboarding: if the gate is on and the wallet has no pass and no Sneaker, show the claim screen
  where Minting would be. Profile: the pass card and the invites.

### 4.4 Website (`website/`)

- The waitlist section gets a second state (enter the 6-digit code) and a third ("You're #312 in
  line", the share link). Still one small island, no wallet code and no new script. The
  "412 / 1,000 passes claimed" counter comes with part 2, once passes exist.
- `?ref=CODE` on any page is carried into the form (alongside `?source=`).
- New copy in `content/waitlist.ts`, and FAQ entries: *What is the Founding Pass?* *Can I sell it?*
  (no) *Is this an airdrop?* (no) *What happens after 1,000?*
- `/privacy` gains: the email is used for the code and the wave email, Brevo delivers them, and
  referral counts are stored.

### 4.5 Part 1 in detail: the verified line

**Sign-up** `POST /v1/waitlist` `{ email, phonePlatform?, source?, referralCode?, website? }` →
`200 { status: 'codeSent' }`, always (a repeat email, a verified one, a filled honeypot).

- The first sign-up stores the email as today, plus `referredByCode` (a malformed `referralCode`
  is dropped, like `source`). A repeat changes nothing.
- Every sign-up, including a verified one coming back on a new device, gets a **new 6-digit code**
  that replaces the last one. Re-verifying is how a returning visitor sees their place again.
- A code is sent at most **once a minute per email**: a faster repeat answers `codeSent` and sends
  nothing, so nobody can flood an inbox or burn Brevo's 300 a day from one address.
- A honeypot sign-up stores nothing and sends nothing.

**Verify** `POST /v1/waitlist/verify` `{ email, verificationCode }` → `200 { placeInLine,
referralCode, referralCount }`.

- The code is stored as a SHA-256 hash (`email:code`), expires after **10 minutes**, and allows
  **5 tries**. A wrong, expired or used-up code, or an email with no code, is
  `VERIFICATION_CODE_INVALID` 400 (one code for all of them, so the answer reveals nothing).
- The first verification sets `verifiedAt`, `verificationOrder` (the count of verified sign-ups,
  plus one), `lineScore = verificationOrder` and a `referralCode` (8 characters from
  `ABCDEFGHJKMNPQRSTUVWXYZ23456789`, no 0/O/1/I/L). The code is then deleted.
- It also credits the referrer, once: the sign-up whose `referralCode` equals `referredByCode`,
  if it's verified, isn't the same email, and has fewer than **20** credited referrals, gets
  `referralCount + 1` and `lineScore − 10`.
- Verifying again (a returning visitor) changes nothing but answers the current place.

**Place** `GET /v1/waitlist/place?referralCode=…` → the same `{ placeInLine, referralCode,
referralCount }`, or `NOT_FOUND`. The referral code is already public in the owner's share link,
and the answer holds no email, so this needs no auth. The site keeps the code in `localStorage`
to show the place on a return visit.

**Place in line** = 1 + the number of verified sign-ups with a lower `lineScore`, or the same
`lineScore` and an earlier `verifiedAt`. Two verifications at the same instant can share a
`verificationOrder`; `verifiedAt` breaks the tie.

**Email** (`services/email-sender.ts`): Brevo's `POST https://api.brevo.com/v3/smtp/email` with
the `api-key` header, from `EMAIL_SENDER_ADDRESS` (`hello@stridemon.xyz`, display name
StrideMon). Subject "Your StrideMon code: 123456", a plain-text and a minimal HTML body that say
the code expires in 10 minutes and that the email can be ignored. `BREVO_API_KEY` is required in
production. In development, with no key, the code is logged instead. Tests pass a recording sender.

**CORS:** `/v1/waitlist`, `/v1/waitlist/verify` (POST) and `/v1/waitlist/place` (GET), from
`WAITLIST_ALLOWED_ORIGINS` only. Each has the 5-a-minute per-IP limit.

**Website:** the form's three states (email → code → place), `?ref=` carried into the sign-up, the
share link `https://stridemon.xyz/?ref=<code>#waitlist` with a copy button (and the native share
sheet where the browser has one), the copy in `content/waitlist.ts`, three FAQ entries and the
privacy page.

**Part 1 is done when:** API tests pass for sign-up, the once-a-minute limit, verify (right, wrong,
expired, 5 tries), the referral credit (once, and the cap of 20) and the place order; the site builds
and its three states are checked by hand against the local API; and one real code arrives from
Brevo at a Gmail address with the DKIM check passing (Yash, after the DNS records).

## 5. Guardrails (non-negotiable)

- **Words:** Founding Pass, waitlist, wave, invite code. Never whitelist, WL, allowlist, mint
  pass, airdrop, alpha, OG role, "early supporter rewards".
- **Every surface that shows the pass says:** "Free. Can't be sold or transferred. It isn't a token
  and never turns into one." The pass grants a place in the game, never tokens or money.
- **Never promise a future perk** that touches value (a mainnet token, an airdrop, a discount).
  The perks are: your number, your laced pass, invite codes, a Play closed-test seat.
- The website stays **email only** (D-037). The wallet is only ever seen at in-app sign-in.
- No Discord/Telegram code drops and no Galxe-style quest boards: they're bot magnets, and X's
  rules and the social plan already rule out engagement bait (`social-plan.md` §4).
- **Judges must never hit the gate.** Either keep `EARLY_ACCESS_REQUIRED=false` until judging
  ends (2026-10-27), or put a shared `judge` claim code in the Metropolis submission and README.
- Deleting an account (`DELETE /v1/me`) or a waitlist email removes the email, codes and
  referral link. The on-chain pass stays (like the Sneaker, D-039).

## 6. How it creates hype (the content beats)

Drafted in `social/` like every other post, approved by Yash before posting.

1. **Announce:** "The first 1,000 Striders get a Founding Pass. Here's what it looks like" (the
   real on-chain art, Unlaced → Laced side by side). Link in the first reply.
2. **Live counter posts:** "Wave 1: 50 passes. Wave 2 opens Friday." Each wave is a reason to post.
3. **Proof posts:** Founder #0001's laced pass on MonadVision (Yash's own), then real founders' walks
   (with permission).
4. **Milestones:** 100 / 500 / 1,000 passes claimed. The final 100 create urgency without any money
   involved.
5. **Build stories (@yash_mittal_dev):** "How I made an NFT that can't be farmed" (soulbound +
   earned invites), "Turning Google's 12-tester rule into an early-access program".
6. **DeltaV update:** after Wave 1, a short factual post (sign-ups, verified %, passes, first walks),
   with Yash's ok.

**What to measure** (all from our own database and the chain, no analytics added): verified ÷
sign-ups, referrals per verified email, wave email → claimed pass, pass → first walk (laced),
invite codes used, and sign-ups by `source`.

## 7. Order and timing

Started 2026-10-07, alongside the Metropolis submission (Yash). The submission's own TODO
(`hackathon-submission.md`) keeps its deadline, **2026-10-14 09:29 IST**.

| When | What |
|---|---|
| ~2 days | **Part 1:** email verification + place in line + referrals on the existing waitlist (§4.5); Brevo's DNS records on Namecheap for `stridemon.xyz`. Usable on its own: the line starts growing before the pass exists. |
| ~3 days | **Part 2:** `FoundingPass` + renderer + tests, deploy and verify on testnet; outbox kinds; claim route; app claim screen and pass card; the gate flag (off). |
| ~2 days | **Part 3:** lacing + invite codes; `open-founding-wave`; the wave email. Phone check end to end with two wallets. |
| After judging (2026-10-28) | Turn the gate on, open Wave 1, post the announcement. |

Roughly a week of focused work, built and checked part by part like Phase 8.

## 8. Decisions (Yash, 2026-10-07)

1. **Testnet.** The game, the gate check and "no monetary value" all live there.
2. **A real gate**, switched on after judging ends, with existing players grandfathered and a
   `judge` claim code.
3. **1,000 passes**, fixed at deploy.
4. **Brevo's free plan** (300 a day).
5. **Start now**, alongside the submission.
6. Turnstile is **left out of part 1** (Claude, 2026-10-07): an unverified sign-up never enters the
   line, and the per-IP and once-a-minute limits bound the email cost. It's the next step if junk
   appears (D-041).

## Sources (read 2026-10-07)

[1] [followchain: STEPN activation codes](https://www.followchain.org/?p=32591) ·
[2] [screensdesign: STEPN onboarding](https://screensdesign.com/showcase/stepn) ·
[3] [The Growth Playbook: Robinhood's 1M waitlist](https://thegrowthplaybook.substack.com/p/how-robinhood-turned-a-landing-page) ·
[4] [LaunchList: waitlist referral programs (2026)](https://blog.getlaunchlist.com/blog/waitlist-referral-program-guide) ·
[5] [Bitget: Monad's soulbound NFT passes 600,000](https://www.bitget.com/news/detail/12560604674878) ·
[6] [X: "1 Million Nads… non-transferable… holds no value"](https://x.com/bkqN0MSzMsjuQsX/status/1908144719298703549) ·
[7] [Sui blog: Typus dynamic NFT](https://www.sui.io/blog/typus-finance-dynamic-nft.md), [Station3 Passport](https://icebreakerlabs.notion.site/Station3-Generative-Passport-9c8ee7867f75463a9bde56322750462e) ·
[8] [whysogeek: airdrop farming and sybil filters, 2026](https://whysogeek.com/blog/crypto-airdrop-farming-sybil-safety-2026/) ·
[9] [extendsclass: Play closed testing in 2026](https://extendsclass.com/blog/google-plays-closed-testing-requirement-what-developers-need-to-know-in-2026) ·
[10] [automationatlas: Resend free tier 2026](https://automationatlas.io/answers/resend-free-tier-explained-2026/) ·
[11] [freetier.co: free email sending tiers 2026](https://freetier.co/articles/free-email-sending-tiers-2026) ·
[12] [Monad docs: gas pricing](https://docs.monad.xyz/developer-essentials/gas-pricing) ·
[13] [CoinGecko: MON](https://www.coingecko.com/en/coins/monad) ·
[14] [costbench: Privy pricing](https://costbench.com/software/web3-wallet-sdk/privy) ·
[15] [ERC-5192: Minimal Soulbound NFTs](https://eips.ethereum.org/EIPS/eip-5192)
