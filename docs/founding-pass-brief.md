# Founding Pass: the brief

Written 2026-10-08 for a fresh start on `main`. It replaces a first attempt (a verified waitlist
line with waves, see "What the first attempt taught us" below) that Yash dropped because it
didn't feel rewarding. **This file is self-contained**: nothing else from that attempt exists on
`main`.

**How to use it:** start a new Claude Code session in the repo root and say: *"Read
`docs/founding-pass-brief.md`, ask me the open questions in §9, then give me a plan and wait."*
Follow `CLAUDE.md` as always: docs first (a new decision, the next free number), phase by phase,
never git.

---

## 1. The idea in one paragraph

The first **1,000 players** each mint a free **Founding Pass**, and the pass is their early access
to StrideMon. They don't get a single generic pass: they see a **collection of 5 different
pass designs**, each limited to 200, with live "left" counters. They **pick the one they want**,
verify their email, connect a wallet, and mint it in about a second on Monad, gas-free. Then
comes a **reveal**: their number (#0137) and one random trait. The pass is soulbound (it can't be
sold or sent). It unlocks the app (the starter Sneaker), **evolves after the player's first real
walk**, and makes a share card for X. When all 1,000 are minted, the game opens to everyone.

## 2. Why this gives dopamine (and the first attempt didn't)

The first attempt's reward was a number in a line ("you're #312") and a wait. Nothing was owned,
nothing was chosen, and the payoff came days later in an email. This version puts five rewarding
moments in the first two minutes:

| Moment | Why it works |
|---|---|
| **Choose** from 5 designs | Choosing is ownership before the mint ("my Dusk pass"). StrideMon already sounds like Pokémon, and picking a starter is the most remembered moment in that genre. |
| **Scarcity you can see**: "Dusk · 37 of 200 left" | Live counters create urgency without money. Each design running out is its own event, and a post ("Dusk is gone"). |
| **Instant mint** | Monad confirms in about a second, and the server pays the gas. The reward lands right after the click. Speed is the product's argument for Monad, and the user feels it. |
| **Reveal**: number + a random trait | A variable reward on top of the chosen one (for example 1 in 10 passes gets a gold lace). It's cosmetic, and the pass can't be sold, so it's a flex, not a lottery prize. |
| **Share card** | Every pass has its own page and Open Graph image (`stridemon.xyz/pass/137`). Posting it on X is the growth loop: other people's passes are the ad. |

And one moment later: **the pass evolves after the first walk** (the art changes on-chain). That
pulls people from "minted" to "played", which is what the product needs, and what Google's closed
test checks (§8).

**Tone:** the user prefers a calm, quiet UI. The reveal should be **one well-made moment** in the
site's Lusion look (a card turn, the number counting up, a haptic in the app), not confetti and
sound everywhere.

## 3. The user's flow

```text
stridemon.xyz/pass   (its own page, so the landing page stays fast)

1. THE COLLECTION
   Five pass cards side by side (a swipeable row on a phone), each with its name,
   its look, and "143 of 200 left". A total bar: "612 of 1,000 Founding Passes minted".
   A live feed under it: "#0611 Dusk · just now".

2. PICK  →  "Lock in Dusk"
   The chosen card lifts; the others dim. The choice is held for 10 minutes.

3. EMAIL  →  6-digit code  →  verified
   One pass per email. The email is also how we reach founders later.

4. WALLET  →  connect (MetaMask etc.)  →  sign a message (free, no gas)
   Proves the wallet is theirs. Testnet MON is never needed: the server mints.

5. MINT  →  ~1 s  →  REVEAL
   The card turns: "DUSK · #0137 · gold lace". Link to the transaction on MonadVision.

6. SHARE
   "Post my pass" opens X with the card and the link. "Get the app" links the APK / Play.

IN THE APP (same wallet)
7. Sign in → the app sees the pass → starter Sneaker → first walk → the pass evolves (on-chain)
```

**Why pick before the email:** asking for an email first is friction before any reward. Once
someone has chosen a design and seen "held for you", finishing the email and wallet steps is
finishing something they already started.

## 4. The collection

A starting proposal. Names, looks and numbers are Yash's call (§9).

- **5 designs × 200 = 1,000 passes.** Theme suggestion: *when you walk*. **Dawn, Noon, Dusk,
  Midnight, Storm.** It's easy to identify with ("I'm a Dusk walker"), and each one gets its own
  accent color and background in the same line-art style as the Sneaker.
- **Drawn on-chain, as SVG**, like the Sneaker (D-030): a swappable `FoundingPassArtRenderer`
  draws each design from `(design, number, trait, stage)`. No IPFS, no image hosting, and the art
  can be improved later with one `setArtRenderer` call.
- **One random trait at mint** (suggestion: lace color, with 1 in 10 gold). It's random on-chain
  at mint time. That's fine here: the pass is free and soulbound, so nobody gains by gaming it.
- **Two stages:** *Unlaced* at mint, *Laced* after the holder's first settled walk.
- Per-design supply is enforced by the contract, not just the website.

## 5. Where the mint happens (recommended: the website)

| Option | For | Against |
|---|---|---|
| **A. Mint on `stridemon.xyz/pass` (recommended)** | The reward is immediate, and people can mint without installing anything. It's the page that gets shared. | Needs wallet code on the website (Reown AppKit for web, wagmi). Load it **only on `/pass`**, so the landing page keeps its speed targets (D-035). Overturns D-037's "the website never asks for a wallet". |
| B. Pick on the website, mint in the app | The website stays email only. | The mint, the best moment, happens later on another device. That's the same delay that killed the first attempt. |
| C. Email login creates a wallet (Privy, thirdweb…) | No MetaMask needed. | The pass would be in a different wallet from the one used in the app, and Privy's free plan stops at 500 users. Revisit for mainnet. |

With A, the server still pays gas: the player signs a free message, and the API mints through the
existing transaction outbox (as it does for the starter Sneaker). Mints queue one after another,
so a rush is slower but never fails.

## 6. What the pass does

- **Early access (the gate):** while the gate is on, the API only mints a starter Sneaker for a
  wallet that holds a pass (it reads the chain, which is the source of truth). Wallets that already
  have a Sneaker are never blocked.
- **The hackathon:** Metropolis judging runs until 2026-10-27, and judges install the README's APK.
  Keep the gate **off until judging ends**, or give judges a code. Minting can open before that.
- **After 1,000:** the gate turns off and everyone can play. The passes stay as the record of who
  was first.
- **Later perks, honest ones only:** a Founder badge in the app, the first Google Play closed-test
  seats, and maybe 3 invite codes after the first walk (STEPN's mechanic). Never tokens or money.

## 7. Guardrails

- **Words:** Founding Pass, mint, collection, design. Never *whitelist*, *WL*, *allowlist*,
  *airdrop*, *alpha*, *sold out* (nothing is sold: say "all minted").
- **Every surface with the pass says:** "Free. Soulbound: it can't be sold or sent. It isn't a token
  and never turns into one." STRIDE stays "Monad testnet. STRIDE has no monetary value."
- **Testnet** for the contract (CLAUDE.md: testnet until Phase 10).
- **One pass per email and per wallet.** Mints are rate-limited per IP, and the email code stops
  most bots. Cloudflare Turnstile (free) is the next step if junk appears.
- **Expect "airdrop?" replies.** Monad's own soulbound "1 Million Nads" NFT drew airdrop rumours
  even though it said it holds no value. Answer the same plain "no" every time.
- **Privacy:** the policy page must name the email provider and say the wallet address is now
  collected on the website.

## 8. What gets built (outline; the session's plan fills in the details)

1. **Contract `FoundingPass`** (Foundry, its own contract, separate from the game so a game
   redeploy never wipes the founders): ERC-721 + ERC-5192 (soulbound), `MAX_PER_DESIGN = 200`,
   5 designs, one per wallet, minted only by the game-server key, `setLaced`, plus the renderer.
   Tests: transfers revert, caps, one per wallet, roles. Deployed and verified on testnet, then
   `bun run chain:export-abis`.
2. **API:** email code (send + verify), a short-lived design hold, "mint my pass" (SIWE-signed,
   queued in the outbox), public counts and a recent-mints feed for the page, the starter-Sneaker
   gate behind a flag, and lacing after the first settled walk. Emails go through **Brevo's free
   plan** (300 a day).
3. **Website `/pass`:** the collection, the hold, email, wallet, the reveal, a per-pass page with
   its Open Graph image, and the share button. A link to it from the landing page.
4. **App:** show the pass on Home or Profile, the gate's "you need a pass" state with a link to
   `/pass`, and the evolve moment after the first walk.

Build it in parts with a check after each (memory: stop after each part): contract → mint on the
website → the app and the gate → lacing.

## 9. Open questions for Yash (answer these first)

1. **Mint on the website (A), or in the app (B)?** Recommended: A.
2. **The 5 designs:** names and theme (proposal: Dawn, Noon, Dusk, Midnight, Storm), and is
   200 each right?
3. **A random trait at mint?** Recommended: yes, cosmetic, about 1 in 10 rare.
4. **Keep the email step?** Recommended: yes. It's one pass per person, our way to reach
   founders, and a bot filter. Without it, a wallet alone is enough to mint.
5. **When does the gate turn on?** Recommended: after judging ends (2026-10-27), with minting open
   before that.
6. **Before or after the submission** (deadline **2026-10-14 09:29 IST**)? Still left there: the
   recorded repair and upgrade, the ≤ 3-minute demo video and the dashboard
   (`docs/hackathon-submission.md`).

## 10. Research (2026-10-07)

| Finding | Use |
|---|---|
| **STEPN gated its beta behind activation codes**; players earned codes by moving, and drops were gone in minutes. [1][2] | Same genre: scarcity plus earning access by moving. Invite codes after the first walk come from here. |
| **Robinhood's waitlist reached ~1M sign-ups** with a visible place and referrals. [3][4] | Proof that progress you can see drives sharing. Here it's the per-design counters and the share card instead of a line. |
| **Monad sent 600k+ soulbound "1 Million Nads" NFTs** that it said hold no value; airdrop rumours followed. [5][6] | The community knows soulbound commemoratives. Expect the airdrop question. |
| **Dynamic NFTs that level up with activity** (Typus "Tails", Station3's free Passport). [7] | The pass evolving after the first walk. |
| **Sybil filtering in 2026** rewards deep activity on few wallets. [8] | A free soulbound pass plus perks earned by walking is little use to farmers. |
| **Google Play still requires 12 testers for 14 days** for new personal accounts, and rejects tests where testers barely used the app. [9] | Founders are the natural closed test. |
| **Email:** Resend's free plan is 3,000/month but only 100/day; Brevo's is 300/day; SES is $0.10 per 1,000. [10][11] Brevo rewrites the sender to `@brevosend.com` unless the domain is DKIM-authenticated. [16] | Brevo, with the domain authenticated. |
| **Monad gas:** ~$0.0005 for a 200k-gas transaction at the minimum base fee; MON ~$0.034. [12][13] | Even on mainnet, 1,000 mints cost under $1. On testnet they're free. |
| **Privy's free plan:** 500 MAU, then $299/month. [14] | Embedded wallets wait (option C). |
| **ERC-5192** is the final standard for soulbound ERC-721s. [15] | Wallets and explorers can tell the pass can't move. |

## 11. What the first attempt taught us (kept from the dropped branch)

- **Keep:** 6-digit email codes, not magic links (mail scanners click links and burn them). Store
  codes only as a hash (10 minutes, 5 tries), send at most one a minute per email, and answer the
  same for new and known emails so the form never reveals who signed up.
- **Keep:** CORS stays limited to the routes the website calls, from `WAITLIST_ALLOWED_ORIGINS`
  only. Every public route gets its own per-IP rate limit.
- **Brevo setup:** add Brevo's `brevo-code` and DKIM records in Namecheap. **Don't** add Brevo's
  suggested DMARC record: `_dmarc` already exists (`p=reject`, `deployment.md` §11.2), and it still
  passes because Brevo's DKIM signs for `stridemon.xyz`. Check with Gmail's "Show original":
  DKIM and DMARC both PASS. In production the API must refuse to boot without `BREVO_API_KEY`;
  in development, log the code instead.
- **Drop:** the line, the waves and the referral queue. They delay the reward, and a number in a
  line isn't something you own.
- **The existing waitlist** (`waitlistSignups`) stays. Its emails get one message when minting
  opens: "Your Founding Pass is ready to mint."

## Sources (read 2026-10-07)

[1] [followchain: STEPN activation codes](https://www.followchain.org/?p=32591) ·
[2] [screensdesign: STEPN onboarding](https://screensdesign.com/showcase/stepn) ·
[3] [The Growth Playbook: Robinhood's 1M waitlist](https://thegrowthplaybook.substack.com/p/how-robinhood-turned-a-landing-page) ·
[4] [LaunchList: waitlist referral programs](https://blog.getlaunchlist.com/blog/waitlist-referral-program-guide) ·
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
[15] [ERC-5192: Minimal Soulbound NFTs](https://eips.ethereum.org/EIPS/eip-5192) ·
[16] [CaptainDNS: Brevo transactional email guide](https://www.captaindns.com/en/blog/brevo-transactional-email-technical-guide)
