# Social Plan (X)

The plan for running StrideMon on X from this repo. There are two accounts:
**[@stridemon](https://x.com/stridemon)** (the product, no Premium) and Yash's personal
**[@yash_mittal_dev](https://x.com/yash_mittal_dev)** (has Premium). The posts and the rules for
writing them live next to the code. This is a plan only: nothing in it is built yet, and it waits
for Yash's go-ahead.

The research was done on 2026-10-05 with web search. @stridemon exists but is empty (no avatar,
banner or bio, per Yash). x.com pages can't be fetched from here, so neither account was checked
directly. Yash answered §12's questions on 2026-10-05, and the plan below includes his answers.

## Why it's shaped this way (research, 2026-10-05)

Each point is dated and cited. **Unconfirmed** marks claims that only third-party blogs make and
that X's own docs or code don't back up.

### 1. How X distributes posts now

- **The ranking is a model, and its inputs are public.** xAI open-sourced the For You pipeline
  (`xai-org/x-algorithm`) in January 2026 and released the complete version on 2026-05-15. A
  Grok-based transformer predicts the probability of each action, and the score is
  `Σ weight × P(action)`. Positive actions: like, reply, repost, quote, share (DM and copy-link
  too), clicks on the post, profile, link and photo, video quality view, dwell time, and
  **follow author**. Negative actions: not interested, mute, block, report, "not dwelled". [1][2]
- **Three adjustments matter for a new account.** (a) Each post after an author's first in a
  feed session is scaled down by a decaying factor. (b) Posts from accounts you don't follow are
  discounted. (c) **Posts from authors with low impressions are lifted toward a target position**
  (a new-author boost). [1] So: post once a day rather than in bursts, and make posts that
  non-followers stop for.
- **Links:** blogs say a link in the main post costs 30–50% of initial reach. [3] **Unconfirmed:**
  the published code has no hard-coded link penalty. [2] Still, a link post has to compete with
  posts that keep people on X, and the API charges 13× more to create a post that contains a URL
  [5]. Putting the link in the first reply costs nothing, so we do that.
- **Replies outweigh likes**, and a reply the author answers is scored separately. [2][3] The
  cheapest growth lever is answering every reply.
- **Video:** dwell time and watch time are among the predicted actions, and a video-view signal
  only counts above a minimum duration. [1][2] The duration isn't given, so **unconfirmed**.
- **Premium:** blogs say Premium accounts get a growing reach advantage. [3] **Unconfirmed:** the
  published ranking doesn't mention Premium or verification. Premium does buy concrete things:
  higher posting limits, longer posts, the analytics dashboard, and possibly scheduling (§2). It
  isn't free, so this plan doesn't assume it.
- **When to post:** OpusClip's data (380,299 X clips, published 2026-04-01) shows creators *post*
  most between 15:00 and 18:00 UTC, and on Wednesdays. That measures when people post, not what
  performs. [4] We start at 14:30–16:30 UTC (20:00–22:00 IST) and adjust from our own numbers.

### 2. API, automation and scheduling

- **The X API has no free tier.** Since February 2026 it's pay-per-use only. Creating a post
  costs $0.015, a post containing a URL $0.200, and reading a post $0.005. You buy credits with a
  card, and saving the card gives $20 of credit. [5][6] By the "free only" rule, an API script is out.
- **Automation rules:** scheduling and drafting original content are allowed. These are not:
  keyword auto-replies, duplicate posts across accounts, posting into trending topics, follow
  scripts, scraping and browser automation (the last two mean a permanent ban). AI-generated
  replies need X's written approval first. An automated account must show the "Automated" label
  and say so in its bio. [7] Posting by hand needs none of this.
- **Posting limits for unverified accounts** (since about May 2026): 50 original posts and 200
  replies a day. [8] That's far more than we need.
- **X's own scheduler:** you schedule from the web composer (the dropdown next to Post), up to
  18 months ahead. Long posts can't be scheduled. [9] **Whether a free account gets the
  scheduler is disputed:** one 2026 source says yes [10], another says Premium only [11], and
  X's help page couldn't be fetched (403). Threads can't be scheduled natively. [11] **Check it
  yourself:** open the composer on x.com and look for the calendar icon.
- **Free third-party schedulers:** Buffer's free plan covers 3 channels, keeps 10 queued posts
  per channel, and needs no card. [12] It needs OAuth access to the account. Whether it can post
  threads on the free plan is **unconfirmed**.

### 3. Media specs

- **Images:** at most 5 MB each (JPG, PNG, WEBP). GIFs at most 15 MB. [13] Common shapes are
  16:9 (1600 × 900), 4:5 (1080 × 1350) and 1:1. [14] **Unconfirmed:** how much of a tall image the
  feed crops. The composer shows the crop, so check it before posting.
- **Video:** an upload must be ≤ 60 fps with an aspect ratio between 1:3 and 3:1. 1280 × 720,
  720 × 1280 and 720 × 720 are recommended. [13] Most sources give a limit of **140 s and 512 MB**
  for a free account posting from the app. [14][15] The API docs allow longer uploads [13]. Since
  the sources disagree, keep every clip under 140 s.
- **Our cuts fit:** the launch film (45 s; 4:5 master, plus 16:9 and 9:16), the website demo
  (78 s, 540 × 1136) and the walk loop (5 s). Use **4:5 in the feed**. Use 16:9 when someone
  asks for a wide version (judges, YouTube). Use 9:16 only off X.
- **Alt text:** up to 1,000 characters per image. [16] Every image gets alt text.
- **Profile:** avatar 400 × 400 (shown as a circle, ≤ 2 MB). Header 1500 × 500 (3:1, ≤ 5 MB).
  The avatar covers the header's bottom-left corner, and some screens trim about 60 px off the
  top and bottom. [17][18]

### 4. Crypto X norms and what we may claim

- **What works for small builders:** build-in-public progress, clear explanations of hard
  things, and threads that argue one point. **What gets ignored:** announcements with no
  context, engagement bait, and agency words ("leverage", "unlock", "dive into"). [19] A common
  rule of thumb is that 70% of posts should be useful to someone who will never use the product,
  and 30% about the product. [20]
- **Watch out: X locks an account the first time it posts about crypto.** On 2026-04-01 Nikita
  Bier (X's head of product) said X is "in the process of implementing auto-locking +
  verification if a user posts about cryptocurrency for the first time in the history of their
  account". [21][22] Whether it's live now is **unconfirmed**. @stridemon has never posted, so the
  launch post could be the one that triggers the lock. So we post once **the day before launch**,
  with verification details ready, and turn on 2FA first: phished accounts are the reason the
  lock exists.
- **Paid promotion:** since 2026-03-01, X's Paid Partnerships Policy bans sponsored creator posts
  about crypto. A project posting about itself, unpaid, isn't affected. [23] Never pay anyone to
  post, and never accept payment to post.
- **Testnet farmers:** a whole genre of sites ranks testnets by expected airdrop. [24] A testnet
  game that pays a token will attract people asking "airdrop?". The answer is always the same
  plain no (§5.4).
- **MON has value now.** Monad's mainnet is live (the main account is labelled "mainnet arc", and
  there was a MON airdrop). [25] So "MON" on its own reads as real money. Always write **testnet
  MON**.

### 5. The Monad ecosystem on X

Every handle below is listed on Monad's own **Official Links** page (docs.monad.xyz, checked
2026-10-05), and the main one is also in monad.xyz's footer. [25][26] Follower counts aren't
quoted, because they couldn't be checked first-hand.

| Handle | What it is |
|---|---|
| [@monad](https://x.com/monad) | Main account (formerly @monad_xyz) |
| [@monad_dev](https://x.com/monad_dev) | DevNads, the developer community |
| [@monad_eco](https://x.com/monad_eco) | Ecosystem account |
| [@pipeline_xyz](https://x.com/pipeline_xyz) | The Pipeline (ecosystem) |

Also official: Discord `discord.gg/monad` (community) and `discord.gg/monaddev` (developers),
r/Monad, and the newsletter at `news.monad.xyz`. [26] **No official hashtag was found.** Don't
invent one.

- **Metropolis**, Monad's six-week global online hackathon, runs **2026-09-01 to 2026-10-13**
  (judging 10-14 to 10-27, winners 11-03). It has four tracks, including Consumer Products &
  Payments and Social, Attention & Culture. The prize pool is "$250,000+" (Monad's own page and
  launch post; one secondary source says $145k). A submission needs "a working product with a
  public project profile: a demo, a short write-up, and a link to the code". [27][28] Whether open
  source is *required* is disputed: Monad's page says encouraged, a GitHub listing says required
  [29]. **Whether StrideMon is entered isn't in the repo** (§12).
- **How other Monad hackathon projects launched:** Blitz (one-day hackathons, 282 projects
  deployed across nine events in 2026) judges by live demo and audience vote, and projects post
  their repos and demos. [30] No first-hand study was made of how individual testnet projects
  launched on X, because X threads can't be fetched from here. **Unconfirmed**, so it isn't used.

### 6. Move-to-earn precedent

- STEPN grew fast in early 2022 (more than $26.8M of Sneaker NFT sales in Q1) and was criticised
  as needing a constant inflow of new users to keep its rewards paying. [31][32] In May 2022 its
  GMT token fell 37% in minutes after it barred players in China, and it ended up 74% below its
  all-time high. [33][34] People now hear "move-to-earn" as a token price story.
- **What that means for us:** never talk about the token's price, yield, or "earning". StrideMon
  is the opposite story: a game loop with the rules on-chain and in the open, a token with no
  value, and nothing to buy. "STEPN-style" is fine as a one-line description of the mechanics
  (the repo uses it). Never use STEPN as a hype comparison ("the next STEPN").

### 7. Build in public

- Post one substantial thing a day, mixing formats. Repeat a recap on the same day each week.
  [20] Lauren Mae's suggestion of 2–4 posts a day and 1–3 hours of replies [19] is more than a
  solo hackathon build can keep up, and author-diversity decay [1] gives less back for each
  extra post. So: **one post a day on weekdays, plus replies**.
- A launch thread opens with one specific claim, then 5–8 posts that each make sense alone, then
  the call to action. [20]
- Starting from zero: reply to every reply within the first hour, and leave substantive replies
  on Monad builders' posts. [20] Real numbers beat vague progress ("+10 SOLE for 2 rewarded
  minutes" beats "rewards work"). [20]

### 8. Measurement

- **Free accounts see per-post numbers in the mobile app** (the bar-chart icon): impressions,
  engagements, profile visits and link clicks. The account dashboard needs Premium. [35][36]
- **Free signals off X:** GitHub's traffic page (the repo owner sees views, clones and referring
  sites, `t.co` included) and starter Sneaker mints on testnet. The landing page has no analytics
  by design (D-035), so link clicks are its only signal.

**Sources** (all read 2026-10-05):
[1] [xai-org/x-algorithm README](https://github.com/xai-org/x-algorithm/blob/main/README.md) ·
[2] [postory: what xAI open-sourced](https://postory.io/blog/x-algorithm-2026) ·
[3] [SocialPilot: X algorithm, Aug 2026](https://www.socialpilot.co/blog/twitter-algorithm) ·
[4] [OpusClip X video data](https://www.opus.pro/research/twitter-x-video-guide) ·
[5] [X API pricing (docs.x.com)](https://docs.x.com/x-api/getting-started/pricing) ·
[6] [wearefounders: X API tiers 2026](https://www.wearefounders.uk/the-x-api-price-hike-a-blow-to-indie-hackers/) ·
[7] [X developer guidelines](https://docs.x.com/developer-guidelines) ·
[8] [Social Media Today, 2026-05-19](https://www.socialmediatoday.com/news/x-implements-new-posting-restrictions-on-nonpaying-users/820671/) ·
[9] [X Help: scheduled posts](https://help.x.com/en/business-and-advertising/scheduled-tweets) (via search; 403 when fetched) ·
[10] [tweetviewer, 2026-07-06](https://tweetviewer.com/blog/how-to-schedule-posts-on-x) ·
[11] [Lilach Bullock, 2026](https://www.lilachbullock.com/schedule-twitter-posts-free/) ·
[12] [Buffer free plan 2026](https://postory.io/blog/free-alternative-to-buffer) ·
[13] [X media upload best practices](https://docs.x.com/x-api/media/quickstart/best-practices) ·
[14] [posteverywhere: X aspect ratios](https://posteverywhere.ai/blog/x-twitter-aspect-ratios) ·
[15] [Neal Schaffer: X banner size 2026](https://nealschaffer.com/twitter-banner-size/) ·
[16] [accessible-social: platform image accessibility](https://www.accessible-social.com/images-and-visuals/platform-image-accessibility) ·
[17] [linearity: X image sizes 2026](https://www.linearity.io/blog/x-twitter-size-guide/) ·
[18] [Neal Schaffer: banner safe zones](https://nealschaffer.com/twitter-banner-size/) ·
[19] [Lauren Mae: what to post on CT, 2026-06-01](https://paragraph.com/@laurenmae/what-to-post-crypto-twitter-2026) ·
[20] [FounderDistro: build in public on X](https://www.founderdistro.com/blog/build-in-public-x-twitter-guide) ·
[21] [Nikita Bier on X, 2026-04-01](https://x.com/nikitabier/status/2039341761156538644) ·
[22] [crypto-economy: first-time crypto posts](https://crypto-economy.com/x-weighs-new-rules-for-first-time-crypto-posts-after-tortoise-scam/) ·
[23] [spendnode: Paid Partnerships Policy](https://www.spendnode.io/blog/x-paid-partnership-policy-bans-crypto-influencer-promotions-ads-still-allowed/) ·
[24] [airdrops.io: testnets to farm](https://airdrops.io/blog/best-testnets-to-farm-airdrops/) ·
[25] [monad.xyz](https://www.monad.xyz/) ·
[26] [Monad docs: Official Links](https://docs.monad.xyz/official-links) ·
[27] [Metropolis (monad.xyz)](https://monad.xyz/developers/hackathons/metropolis) ·
[28] [@monad: Metropolis announcement](https://x.com/monad/status/2094826883049205806) ·
[29] [Blockchains/hackathons #2](https://github.com/Blockchains/hackathons/issues/2) ·
[30] [Monad hackathons](https://monad.xyz/developers/hackathons) ·
[31] [TechCrunch, 2022-05-22](https://techcrunch.com/2022/05/22/play-move-to-earn-solana-stepn-gamefi/) ·
[32] [disrupt: M2E craze](https://www.disrupt.co.kr/en/blog-post/unfinished-move-to-earn-game-craze-and-the-next-generation-of-m2e) ·
[33] [CoinDesk, 2022-05-26](https://www.coindesk.com/business/2022/05/26/stepn-to-bar-move-to-earn-for-china-based-users-in-july) ·
[34] [FXStreet: GMT crash](https://www.fxstreet.com/amp/cryptocurrencies/news/stepns-gmt-price-crashes-after-china-ban-showing-serious-red-flags-202205271435) ·
[35] [Brandwatch: X analytics tools](https://www.brandwatch.com/blog/x-analytics-tools/) ·
[36] [xholic: X analytics free vs Premium](https://xholic.ai/guides/twitter-analytics/)

### Where the repo and the web disagree

1. **Open: `launch-video-prompt.md` misreads its OpusClip source.** It says "X ranks by completion
   rate. The best-performing range across 380k X clips is 30–60 s." In the source, 40.7% is the
   *share of clips* made at 30–60 s, which measures what's popular, not what performs. [4] A 45 s
   film is still a sound choice, but that bullet's reason should be reworded. Leave it until the
   agent working in `launch-video/` is done.
2. **Answered: the site and GitHub are final** (Yash, 2026-10-05). Both answered 200 that day:
   `https://stridemon.yashmittal.xyz` is the main URL, and `github.com/yassmittal/StrideMon` is
   public. `CLAUDE.md`'s "waits on the GitHub URL and the Vercel deploy" is out of date, and so is
   the PLACEHOLDER comment on `githubRepositoryUrl` in `website/src/content/site.ts`.
3. **Answered, with a catch: MetaMask.** Yash checked it: MetaMask shows the Sneaker art. But
   **it didn't update when the art changed** (MetaMask keeps the old picture even though the
   contract emits ERC-4906 `MetadataUpdate`, D-030). So the art is the same in the app, on the
   explorer and in MetaMask at mint, but only the app and the explorer follow repairs and
   upgrades. Two places say more than that:
   - the landing page (`website/src/content/contracts.ts` → `onChainContent.artText`: "…and
     MetaMask all show the same image, and it changes when you repair or upgrade")
   - `launch-video/FACTS.md` §7 (MetaMask still marked ⚠). Update it once that folder is free.
4. **Answered: walk and run** (Yash, 2026-10-05). The vocabulary table in `coding-standards.md`
   §1.6 says "activity session, not run" for the UI copy too, but the app's own screens ("RUN IN
   PROGRESS") and the website say "run". Posts use **walk** and **run** in prose, and **activity
   session** only when talking about code (§5.2).

---

## The plan

### 1. Folder: `social/` at the repo root

`social/` rather than `x/`, because a bare `x` reads as a typo. Today it holds X content only. If
another platform is ever added, it gets its own subfolder then, not now.

```text
social/
├── README.md            How this works: the states, the workflow, how to post, the commands below
├── voice.md             Voice, vocabulary, banned phrases, disclaimers, tagging, visual rules (§5)
├── profile.md           Display name, bio, link, pinned post, avatar and header (where they come from)
├── ideas.md             Backlog: one line per idea, with its pillar and source doc
├── reviews.md           Weekly review notes, newest first (§9)
├── templates/
│   ├── single.md
│   ├── thread.md
│   ├── reply.md
│   ├── launch.md
│   └── changelog.md
├── posts/
│   └── 2026-10-08-launch.md     One file per post or thread, named <slot date>-<slug>.md
└── media/               X-only files that exist nowhere else (cards, short cuts). Gitignored:
                         each file is rebuilt from the command written in its post file
```

- **No tooling. Not a Bun workspace, no `package.json`.** It's Markdown. The commands it needs
  are ones the repo already uses: `ffmpeg` for clips, `rsvg-convert` for the avatar, and
  `remotion still` in `launch-video/` for cards. Biome doesn't lint Markdown, so it needs no config.
- **No `facts.md`.** Every number in a post cites a file that already exists (usually
  `launch-video/FACTS.md`, `game-rules.md` or a decision). A post with a fact that isn't checked
  anywhere adds a row to `FACTS.md` first.
- **No calendar file.** The dated file names in `posts/` *are* the calendar (`ls social/posts`),
  and `grep -H '^status:' social/posts/*.md` shows every post's state. Undated ideas live in
  `ideas.md`.
- **Root `.gitignore` gets** a "Social" block with `social/media/`. Yash adds it; Claude doesn't
  touch git.

### 2. Workflow and state

A post moves **idea → draft → approved → scheduled → posted** (or **dropped**). Its state lives in
the post file's front-matter, so the file is the single source of truth:

```markdown
---
status: draft            # idea | draft | approved | scheduled | posted | dropped
account: stridemon       # stridemon | yash_mittal_dev (§2a)
slot: 2026-10-08 15:00 UTC
format: thread           # single | thread | reply | quote
pillar: proof            # proof | build-story | deep-dive | conversation (§6)
media:
  - path: launch-video/out/stridemon-launch-4x5.mp4
    alt: "…"
link_reply: https://stridemon.yashmittal.xyz
sources: [launch-video/FACTS.md §3, docs/decisions.md D-007]
approved: ""             # Yash writes "Yash 2026-10-07". Claude never fills this in
x_url: ""
results: {}              # filled at +48 h (§9)
---

## Post 1
…text exactly as it will be pasted…

## Post 2 (reply to 1)
…
```

1. **Idea:** a line in `ideas.md`.
2. **Draft:** Claude (or Yash) copies a template into `posts/`, writes it, cites sources, and
   picks the media and alt text. Claude can take a post this far and no further.
3. **Review:** Yash edits in place and writes his name and the date in `approved:`. **That line
   is the only gate.** Nothing without it gets posted.
4. **Scheduled or posted:** Yash pastes the text into X himself, sets `status` and `x_url`, and
   pins the post if it's the launch.
5. **Results:** at about 48 h, Yash copies the numbers from the post's stats in the X app into
   `results` (§9).

### 2a. Two accounts, two jobs

| | **@stridemon** (no Premium) | **@yash_mittal_dev** (Premium) |
|---|---|---|
| Voice | The product: what it does and how it works. "StrideMon…", never "we raised / we're hiring" | The builder: "I built…", "I learned…" |
| Posts | Proof and deep dives (§6) | Build stories, the launch quote-post, the weekly changelog |
| Why | Visitors to @stridemon should see the product working | Premium's long posts, scheduler and analytics are on this account, and the bugs and decisions are Yash's story |
| Links to the other | Reposts the build stories | Quote-posts the launch and proof posts with one line of his own |

- **Never the same text on both accounts.** X's rules ban duplicate posts across accounts [7],
  and it reads as a bot. The second account quotes or reposts, and adds its own line.
- Every post file has `account:` in its front-matter, and its file name stays dated, so one
  `ls` still shows the whole calendar for both.

**How to post: manual copy-paste on x.com, plus X's scheduler for single posts on
@yash_mittal_dev (it has Premium).**

| Option | Cost | Risk | Verdict |
|---|---|---|---|
| **Manual copy-paste** from the post file | $0 | None. Each post is what Yash approved, and he's there to answer the first replies, which the ranking rewards [2] | **Yes, for every thread, the launch, and @stridemon** |
| **X's native scheduler** (web composer) | $0 on @yash_mittal_dev (Premium). For @stridemon, check whether the calendar icon shows | None from the platform. It can't schedule threads [11] or long posts [9] | **Yes, for single posts on the personal account**; @stridemon too if the icon shows |
| Buffer free plan | $0 (3 channels, 10 queued, no card) | A third party gets OAuth access to the account. Thread support on the free plan is unconfirmed | Only if Yash can't be online at posting time |
| Our own API script | Not free: there's no free API tier, $0.015 a post and **$0.20 if it contains a URL**, and a card is needed for credits [5] | Key handling, automation-label rules [7], and something to maintain | **No.** It breaks the free-only rule, and at one post a day it saves nothing |

### 3. Profile setup (the account is empty)

Do this before any post. Draft copy for `profile.md`:

- **Name:** `StrideMon`
- **Bio** (≤ 160 characters, the composer will enforce it):
  `A walking game on Monad testnet. Own a Sneaker NFT, walk to earn SOLE, upgrade it. SOLE has no monetary value. Built by @yash_mittal_dev`
  (136 characters)
- **Link:** `stridemon.yashmittal.xyz`
- **Avatar:** the site's mark (`website/src/app/icon.svg`: the Sneaker line on `#141515` with the
  lime stroke), rendered at 400 × 400. The circle crop hides the rounded corners.
  `rsvg-convert -w 400 -h 400 website/src/app/icon.svg -o social/media/avatar-400.png`
- **Header (1500 × 500):** the on-chain Sneaker art on a black field, sitting **centre to right**,
  with the meta line `WALK • EARN • UPGRADE • MONAD TESTNET` in Satoshi 500 caps. Keep the
  bottom-left corner empty (the avatar covers it) and nothing within 60 px of the top or bottom
  edge. [18] It will be a `remotion still` in `launch-video/` once that folder is free (§7).
  Until then, a header isn't required to launch: X shows a plain colour.
- **Pinned post:** the launch post, from D0.
- **Security:** 2FA with an authenticator app (not SMS), and a verified email and phone, before
  the first post (§4, the crypto lock).
- No "Automated" label: a person does the posting.

### 4. Pre-launch order

1. Profile complete (§3), 2FA on.
2. **D−1: a warm-up post** (calendar row 1). It's the account's first crypto post, so if X locks
   the account, it happens a day early and not mid-launch.
3. D0: the launch.

### 5. Voice and rules (`voice.md`)

#### 5.1 Tone

Simple and quiet, like the app. Plain sentences. Show the thing and let the numbers be the
excitement. First person singular is fine ("I built…"). It's a solo build, and saying so is the
build-in-public voice. No exclamation marks. No emoji, except at most one ✓ or → where it does a
job. No "gm" posts, no engagement bait ("RT if…", "drop your wallet").

#### 5.2 Vocabulary

| Use | Not |
|---|---|
| **StrideMon** | Stridemon, STRIDEMON in prose |
| **Sneaker** (capital S, the NFT) | shoe, NFT on its own, item |
| **SOLE** (always caps) | soles, coins, points, tokens on its own |
| **Monad testnet**, **testnet MON** | Monad on its own when it means the network, MON on its own |
| **walk**, **run** (what the screens say); **activity session** only about code | workout, session on its own |
| **rewarded minutes**, **energy**, **durability**, **level**, **efficiency** | stamina, HP, XP |
| **settles on Monad** | "instant", or a seconds figure nobody measured |

#### 5.3 Never say (banned)

- Money: *earn money, income, passive income, yield, APY, ROI, profit, cash out, worth, price,
  value* (about SOLE), *investment, presale, mint price, floor*.
- Farming: *airdrop, points program, eligibility, whitelist/WL, allowlist, early users will…,
  snapshot*. On crypto X, "whitelist" means a guaranteed spot in a token or NFT sale, so the
  landing page's sign-up is a **waitlist**: "Get notified when StrideMon opens". The same word is
  used in posts.
- Hype: *revolutionary, next-gen, game-changer, unleash, the future of fitness, LFG, WAGMI, moon,
  gem, alpha, don't miss out, 100x, first-ever / first on Monad* (unverified).
- False facts: *mainnet, download now, App Store / Play Store, iOS (live), N users / runners*,
  any number not in `FACTS.md`. Never "a 2-minute walk paid 10 SOLE" (it was a 3:05 walk with 2
  rewarded minutes, FACTS §3), "MetaMask updates the art when you level up" (it doesn't refresh:
  say "the app and the explorer redraw it", disagreement 3), "cheat-proof", or
  speed-band rules under an "on-chain" claim (that check is in the API, FACTS §2).
- Other projects: no claims about other apps ("most step apps…"), and no STEPN dunking or "the
  next STEPN".

#### 5.4 Disclaimers

- **Every post that shows an amount of SOLE** ends with, or has in its thread:
  `Monad testnet. SOLE has no monetary value.`
- **The launch thread** also says: there's no token sale, no airdrop and nothing to buy, and the
  Android build is a demo build that isn't publicly downloadable yet. Its last post links the
  **waitlist** on the landing page (once it ships, §15).
- **The standing answer to "airdrop?" / "wen token?":** "No. SOLE is a testnet game token with
  no monetary value, and there's no sale or airdrop. The game is the point." Same words every time.

#### 5.5 Hashtags and tagging

- **No hashtags** by default. Monad has no official one, and an invented one reads as spam. The
  one exception: if a hackathon's submission rules ask for a tag, use exactly that one, once.
- **Tag at most one account per post**, only when the post is genuinely about them: @monad in
  the launch or Metropolis post, @monad_dev in a developer deep-dive. Never tag in replies to
  get attention, and never tag big accounts that have nothing to do with the post.
- **Replying to others:** only with something specific (a question about their build, a detail
  from ours that's relevant). Never drop the StrideMon link in someone else's thread unless asked.

#### 5.6 Visual rules for images and clips

From `docs/architecture/design-system.md` and `launch-video-prompt.md` §4, unchanged:

- Backgrounds `#F0F1FA` (off-white) or `#000000`. Dark panels `#141515`, radius 10. **Lime
  `#C1FF00` only on dark**, never as text on light. Blue `#1A2FFB` at most once.
- Satoshi 400 for reading, 500 only for uppercase meta. IBM Plex Mono for every number and
  address. No bold.
- Phone screens in the site's plain flat frame (`website/src/components/ui/phone-frame.tsx`):
  radius 28, 5 px bezel, ink colour. Never a photoreal iPhone.
- "+" cross marks at least 2 px wide at 1080 px, so they survive X's re-encode.
- **Banned:** gradients, glow, drop shadows, emoji in images, coins or cash imagery, purple, and
  Monad's logo (text only, unless Monad's brand kit says otherwise).
- **Sizes:** single images 1080 × 1350 (4:5). Link previews come from the site's existing
  1200 × 630 Open Graph image. Video 4:5, ≤ 60 fps, ≤ 140 s, H.264 + AAC, `-movflags +faststart`.
  Every clip makes sense muted (on-screen text carries the claim).
- **Every image has alt text** saying what the screen shows and its key numbers.

### 6. Content pillars

| Pillar | Share | What | Source in the repo |
|---|---|---|---|
| **Proof** | ~30% | The product doing the thing: clips, a real transaction, the art changing | `website/public/`, `launch-video/`, FACTS §3–§8 |
| **Build stories** | ~30% | A bug or a decision, told as what happened → what we learned | `docs/decisions.md`, `docs/phases/` |
| **Deep dives** | ~30% | How one part works, for builders. One idea per thread | `docs/architecture/`, contracts |
| **Conversation** | daily, unscheduled | Replies, answers, other Monad builders' work | — |

The 70/30 split from §7 of the research: build stories and deep dives are useful to people who'll
never install the app.

### 7. Asset pipeline (reuse, don't copy)

| Asset | Where it lives | Use on X |
|---|---|---|
| Screenshots `01`–`09` (1080 × 2340) | `website/public/screenshots/` | Never posted raw (too tall). Placed in the phone frame on a 4:5 card |
| Demo video (78 s, 540 × 1136, silent) | `website/public/videos/stridemon-demo.mp4` | Launch fallback, and chapter clips via `ffmpeg -ss … -t …` (chapter times in `website/src/content/demo-video.ts`) |
| Walk loop (5 s) | `website/public/videos/stridemon-walk-loop.mp4` | A reply under the launch, or a GIF-like accent |
| Raw recordings (586 × 1280, about 7 min each) | `website/media-source/` (gitignored) | Source for new short cuts. Times are in `launch-video/FOOTAGE.md` |
| Sneaker art, 48 states | `launch-video/public/sneaker/*.svg` (real `renderImageSvg` output) | Level 1 → 5 strip, durability fade |
| Launch film (4:5 / 16:9 / 9:16) | `launch-video/out/` (**not rendered yet**) | The launch post's media |
| Open Graph card (1200 × 630) | `website/src/app/opengraph-image.tsx` | Shows automatically under the link reply |

- **Cards** (a screenshot in a frame, a rule card, the header) will be **`remotion still`
  compositions in `launch-video/`**, which already holds the tokens, both fonts and the real art.
  They render to `social/media/`. **On hold:** another agent is building the launch film in
  `launch-video/` right now, so nothing is added there until Yash says it's free (2026-10-05).
  **Until then, no card needs `launch-video/`.** The D−1 art card is the real Sneaker SVG
  rendered with `rsvg-convert` onto a 1080 × 1350 black canvas (the SVG is already dark and
  on-brand), and the D0 launch can use the 78 s demo, which exists. Any other card waits.
- **Clips** are cut with `ffmpeg` from the files above into `social/media/`. The exact command
  goes in the post file, so `media/` can stay gitignored and be rebuilt.
- **Never copy** a screenshot, video or SVG into `social/`. Post files point at the original paths.

### 8. The first three weeks

D0 is launch day: **as soon as everything is ready** (Yash, 2026-10-05). "Ready" means the profile
(§3), the waitlist on the landing page (§15) and the D−1 to D1 posts approved. Times are
14:30–16:30 UTC (20:00–22:00 IST, confirmed). "Exists" means the asset is in the repo today. If
StrideMon is entered in Metropolis, the launch must come **before 2026-10-13**.

**Which account:** proof and deep-dive rows post from **@stridemon**. Build-story and changelog
rows post from **@yash_mittal_dev**, and @stridemon reposts them. On D0, @stridemon posts the
launch thread, and about an hour later @yash_mittal_dev quote-posts it with his own line ("I
spent the last few weeks building this…").

| Day | Pillar | Topic | Format | Asset | Why |
|---|---|---|---|---|---|
| D−2 | — | Profile: avatar, header, bio, link, 2FA | — | `icon.svg` (exists), header card (new) | An empty profile turns visitors away |
| D−1 | Proof | "This Sneaker is drawn by a contract on Monad testnet. It changes when you walk, repair and level up." | Single + image | Level-2 art on a dark 4:5 card (art exists) | The first crypto post triggers any lock a day early. The profile isn't empty on launch day |
| **D0** | Proof | **Launch:** "Walk. Earn. Upgrade." The film, then a thread: the loop · a real settled run · the rules on-chain · fair play and privacy · "testnet, no value, no sale" · links | Thread, pinned | Launch film 4:5. **Fallback:** the 78 s demo (exists) | One specific claim with proof, as in §7 of the research |
| D1 | Proof | "The app estimated 15. The server counted 2 minutes. The contract paid 10." | Single + 2 images | `04-run-summary` card + the explorer transaction (FACTS §4) | It shows the trust model in one line, with numbers anyone can check |
| D2 | Deep dive | The Sneaker's picture is an SVG drawn by a contract (D-030): renderer split, ERC-4906, durability fading the lime | Thread (4–5) | Level 1 → 5 strip (SVGs exist), `09-explorer-nft` | The most visual, most "only on-chain" idea we have |
| D3 | Build story | The crash at the first GPS fix: `RECEIVE_BOOT_COMPLETED` and expo/expo#48935 (D-023) | Single (≤ 280) + link reply | Code snippet card | A useful find for any Expo developer. Gets the account in front of builders |
| D4 | Proof | Send a Sneaker A → B, stats intact (`LEVEL 02 • EFFICIENCY 12 • DURABILITY 100`) | Single + clip (~15 s) | Demo chapter "Send to another wallet" (exists) | Ownership is the third of `MVP.md` §25's three points |
| D5–6 | Conversation | Replies only | — | — | Weekend. Answer everything and engage with Monad builders |
| D7 | Deep dive | The outbox: sign, save, then broadcast, so a crash never double-sends (D-012, D-019) | Thread (5) | Simple diagram card | Strong developer content, and why "a demo vs a system" |
| D8 | Proof | Repair and upgrade from the player's own wallet: 98 → 100, level 1 → 2 | Single + clip (~20 s) | Demo chapter "Repair and upgrade" (exists) | The other half of the loop. MetaMask on screen |
| D9 | Build story | Android hands you a location from 10 minutes before START (D-024) | Single | Text, or a timeline card | Short, surprising, and true |
| D10 | Deep dive | Why driving earns nothing: 1–20 km/h per minute, 40 km/h jumps dropped, mock locations rejected (D-021) | Thread (4) | Walk loop (exists) + a rules card | Answers the first question everyone asks about move-to-earn |
| D11 | Build story | The contract computes the reward and the server only reports minutes (D-007) | Single | Rules card | The trust boundary, said plainly |
| D12 | Changelog | Week 1 recap: what shipped, what broke, what's next | Single | None, or the best clip of the week | A fixed weekly slot readers can expect |
| D13 | Conversation | Replies only | — | — | — |
| D14 | Deep dive | The rules on-chain: energy, 0.5 SOLE × efficiency per minute, upgrade 50 × level (`game-rules.md`) | Single + card | The site's rules table as a dark card | Keeps every number checkable |
| D15 | Build story | `bson@7` crashing at import on Bun, and the pin (D-015) | Single | Text | For developers, short |
| D16 | Proof | Gas drip and starter mint: "connect wallet → you own a Sneaker" (D-009) | Single + clip | Demo chapter "Sign in with MetaMask" (exists) | Onboarding is the friction every Web3 game has |
| D17 | Build story | What I'd do differently, and what's next (marketplace, the iOS day) | Single + question | None | Invites replies. Honest about what isn't done |
| D19 | Changelog | Week 2 recap | Single | — | Weekly slot |
| — | Proof | **Metropolis submission** (if entered): "Submitted to @monad's Metropolis…" with the demo | Single | Launch film 16:9 | On the day it's submitted, before 2026-10-13 |
| 11-03 | — | Metropolis results (if entered), either way | Single | — | Close the loop in public |

### 9. Templates (`social/templates/`)

Each one is the front-matter block from §2 plus the body below.

- **single.md:** one claim in the first line. One or two lines of proof (a number, with its
  source in front-matter). The disclaimer if SOLE is shown. The link goes in the reply, not here.
- **thread.md:** Post 1 is a hook with one specific claim and the media. Posts 2–n each make
  sense alone, one idea each. The last post links (site, GitHub, the relevant decision or file)
  and carries the disclaimer. At most 8 posts.
- **reply.md:** the reusable answers: "airdrop?", "is it live / iOS?", "can I cheat by driving?",
  "where's the code?", "what's SOLE worth?". Each one is the FAQ wording from
  `website/src/content/faq.ts`, so the site and X never disagree.
- **launch.md:** the D0 thread skeleton: hook + film, the loop in one post, the real settled run
  (FACTS §3–§4), the rules on-chain, fair play and privacy, "testnet · no value · no sale ·
  Android demo build", then the links. Plus the pin step and the warm-up check.
- **changelog.md:** "This week in StrideMon": 3–5 lines starting with *Shipped / Fixed /
  Learned / Next*, each linking a decision number or a file. The same day every week.

### 10. Metrics (`results` in each post, `reviews.md` weekly)

- **At +48 h, per post** (free, from the post's stats in the X app): impressions, engagements,
  replies, reposts, bookmarks, profile visits, link clicks, video views if shown, and follower
  count before and after (approximate). Plus a line on any reply worth acting on.
- **Weekly, 15 minutes** (the changelog day): which pillar and format did best, judged by
  **replies, profile visits and follows per 1,000 impressions** (rates, not raw counts). Also
  GitHub traffic (views, `t.co` referrals), new starter Sneakers minted that week (one read-only
  count), and **waitlist sign-ups by source**. Links from X carry `?source=x-stridemon` or
  `?source=x-yash`, and the form stores that value (§15). It's the only free way to see which
  account brings sign-ups, with no analytics on the site. Then one change for next week, written
  in `reviews.md`.
- Two accounts, two places to read the numbers: @yash_mittal_dev has Premium's analytics
  dashboard; @stridemon has per-post stats in the app only.
- Don't track likes as a goal (the lowest-weighted positive action [2]), and never buy
  followers or engagement.

### 11. Safety

- **Nothing goes on X without Yash.** Claude drafts in `social/posts/`, and never posts,
  schedules, logs in, connects a tool or calls the X API. A post needs `approved:` filled in by
  Yash, and Yash does the posting himself.
- **No API keys exist under this plan.** If that ever changes (a decision first), keys go in
  `social/.env`, which the root `.gitignore`'s `.env` rule already covers, plus a
  `social/.env.example`.
- **No third-party OAuth** to the account (Buffer and the like) without asking Yash first.
- **Nothing private in media:** use the screenshots and footage already cleared for privacy
  (status bars painted out, `FOOTAGE.md`'s privacy pass). Testnet addresses and hashes are
  public and fine.
- 2FA on the account, and a dedicated email for it (§3).

### 12. Questions

**Answered by Yash on 2026-10-05:**

- Accounts: @stridemon, plus personal @yash_mittal_dev, which posts too (§2a).
- Launch date: as soon as everything is ready (§8).
- Premium: on @yash_mittal_dev only, not on @stridemon.
- The site (`https://stridemon.yashmittal.xyz`, the main URL) and the GitHub repo are final.
- MetaMask shows the art but doesn't refresh it (disagreement 3).
- Trying it: a waitlist form on the landing page (§15). Yash called it a "whitelist"; §5.3 explains
  why the page should say "waitlist".
- Wording: walk and run. Posting at 20:00–22:00 IST suits him.

**Still open:**

1. **Metropolis:** is StrideMon entered (submissions close **2026-10-13**)? If yes, which track?
   That gives the launch a deadline and adds the submission post.
2. **The launch film:** will it be rendered before D0? If not, the launch uses the 78 s demo
   video, and the film becomes its own post later.
3. **An email for @stridemon:** is it on its own email, with 2FA by authenticator app?
4. **Waitlist storage:** decided in §15's prompt, at its plan gate.

### 13. Proposed decision and CLAUDE.md line

**For `docs/decisions.md`:**

> ## D-036 — StrideMon's X presence is run from `social/`, by hand
>
> Made 2026-10-05, after Phase 8.8.
>
> - **Decision:**
>   0. Two accounts: **@stridemon** posts the product (proof, deep dives), and Yash's
>      **@yash_mittal_dev** posts the build stories and quote-posts launches. They never post the
>      same text.
>   1. `social/` at the repo root holds both accounts' posts and rules: Markdown only, no
>      tooling, **not a Bun workspace**. One file per post, with its state in front-matter
>      (`idea → draft → approved → scheduled → posted`). `voice.md` holds the voice and the
>      banned phrases, and `profile.md` the bio and images.
>   2. **Posting is manual:** Yash pastes each approved post into x.com, and may use X's own
>      scheduler for single posts. Claude drafts and never posts, schedules or connects. A post
>      goes live only with Yash's name in its `approved:` field.
>   3. **No X API**: it has no free tier since February 2026 ($0.015 a post, $0.20 with a URL).
>   4. Media reuses `website/public/`, `website/media-source/` and `launch-video/`. Cards are
>      `remotion still` renders in `launch-video/`. X-only outputs go in the gitignored
>      `social/media/`, each rebuilt from the command in its post file.
>   5. Every number in a post cites `launch-video/FACTS.md` or a doc. Every post showing SOLE
>      says "Monad testnet. SOLE has no monetary value." No hashtags, and at most one tag a post.
>   6. The research and full plan are in [`social-plan.md`](social-plan.md).
> - **Why:** the facts, footage and voice already live in this repo, so posts written next to
>   them stay true. Manual posting is free, follows X's automation rules with nothing to label,
>   and puts Yash there to answer the first replies, which the ranking rewards.
> - **Trade-off:** someone has to be online at posting time, and threads can't be scheduled.
>   Metrics are copied by hand from the X app.
> - **Revisit when:** posting needs to happen while Yash is away, or the account needs the
>   analytics dashboard (Premium).

**For `CLAUDE.md`** (under Current phase):

> **X (D-036):** `social/` holds the posts for [@stridemon](https://x.com/stridemon) and Yash's
> [@yash_mittal_dev](https://x.com/yash_mittal_dev), one Markdown file each (`account:` in the
> front-matter), with the rules in `social/voice.md` (plan: `docs/social-plan.md`). Claude drafts
> there and **never posts, schedules, logs in to X or calls its API**. Only Yash publishes, and
> only posts with his name in `approved:`. Every SOLE amount carries "Monad testnet. SOLE has no
> monetary value."

### 14. What happens after the go-ahead

1. Answer §12.
2. Create `social/` with `README.md`, `voice.md`, `profile.md`, `ideas.md`, `reviews.md` and the
   five templates, plus the D−1, D0 and D1 post files as drafts. Add D-036 and the CLAUDE.md line,
   and update `docs/README.md`'s reading-order table.
3. Then the header and the cards, via a `SocialCard` composition in `launch-video/`. That waits
   until the agent working there is finished **and** Yash gives a separate go-ahead. Nothing in
   step 2 touches `launch-video/`.
4. Stop for review before anything goes near X.

### 15. The waitlist on the landing page

Yash wants interested people to sign up on the landing page (2026-10-05). The brief for building
it is [`waitlist-prompt.md`](waitlist-prompt.md), to run in its own Claude Code session. In short:

- It's called a **waitlist**, never a whitelist (§5.3). It asks for an **email only**, plus an
  optional "which phone" (Android or iPhone). It never asks for a wallet address: a list of
  wallets reads as an airdrop list and draws farmers.
- It changes D-035 ("no newsletter form"), so it needs its own decision, numbered after D-036.
- The site is a static export with no server, so the form needs somewhere to send its data.
  **Recommended:** a `POST /waitlist` route on the hosted StrideMon API (free, and the data stays
  in our own Atlas database), with CORS limited to the site's origin, the existing rate limit and
  a hidden honeypot field. The alternative is a Google Form link (no code, but off-brand, and
  Google holds the emails). The prompt stops at a plan gate so Yash picks one.
- The form records `?source=` from the page URL, which feeds §10's metrics.
- The X links point at the waitlist only once it's live. Until then they point at the site.
