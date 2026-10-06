# Landing Page Prompt (Phase 8.8)

The brief for building StrideMon's landing page (D-035). Paste everything below the line into a
fresh Claude Code session started in the repo root (`monad/`). It's self-contained: every fact the
page needs is in it, checked against the code and testnet on 2026-10-05.

Before you paste it, put your screenshots in `website/public/screenshots/` under the names in
§8 of the prompt. Any that are missing get a labelled placeholder and can be dropped in later.

---

## The prompt

You're building the landing page for **StrideMon**, a move-to-earn game on Monad. Read
`CLAUDE.md`, `docs/decisions.md` → D-035, and `docs/architecture/design-system.md` first. Then
**give me a short plan and wait for my go-ahead before writing code.**

### 1. What StrideMon is

A STEPN-style move-to-earn game. The player owns a **Sneaker NFT** on Monad, walks or runs with it
to earn **SOLE** (an ERC-20 reward token), and spends SOLE to repair and upgrade the Sneaker. The
Sneaker's stats live on-chain, and it can be sent to any wallet with its stats intact.

- One-sentence pitch: *A move-to-earn game where you own a Sneaker NFT on Monad, walk or run with
  it to earn rewards, and spend them to repair and upgrade the Sneaker.*
- The loop: **Own Sneaker → Get Energy → Move → Earn → Upgrade Sneaker → Move Again.**
- Status: complete and working end to end on **Monad testnet**, on Android (an internal demo build).
  iOS comes later. SOLE is a testnet token with **no monetary value**. Built for a hackathon.

Who reads the page: hackathon judges (they decide in a minute or two), the Monad community, and
curious players. It must make three things obvious, from `MVP.md` §25:

1. **Real-world activity:** you actually walk or run.
2. **Game progression:** you earn rewards and improve your Sneaker.
3. **Blockchain ownership:** the Sneaker is an NFT you own and can transfer. The chain isn't
   used as a database; the game asset belongs to the player.

### 2. Where and how (D-035)

- **`website/`** at the repo root, its own project: Next.js 16 (App Router) + React 19 +
  Tailwind CSS v4 + TypeScript, on **Bun**. Its own `package.json` and `bun.lock`. **Not** a Bun
  workspace: don't add it to the root `package.json`, don't import `@stridemon/*`, and never run
  `bun install` at the repo root for it. Install with `cd website && bun install`.
- `website/` already holds `public/sneaker-art/` and `public/screenshots/`. Set the project up by
  hand around them (don't run `create-next-app` over them).
- Statically generated (no server code, no API routes, no database). Deployed on Vercel's free
  plan with the project root set to `website/`.
- URL: **`https://stridemon.yashmittal.xyz`**. Keep it in one constant (`siteUrl`), because it
  may move to `stridemon.com` later.
- Lint and format with the repo's root Biome (`bun run lint` from the root covers `website/`).
  Done means `bun run lint` passes at the root and `bun run build` passes in `website/`.
  `biome.json` already allows default exports in `website/src/app/**` (Next.js routes need them)
  and skips `website/public/`. If Biome can't parse Tailwind v4's CSS directives (`@theme`,
  `@import "tailwindcss"`), turn on its Tailwind directive parsing in `biome.json` rather than
  excluding the CSS file.
- Content-driven: every piece of copy, number, link and address lives as typed data in
  `website/src/content/`. Components only present it.
- Naming follows `docs/conventions/coding-standards.md`: full words with units
  (`energyRegenerationMinutes`, not `regen`), verb-first functions, no `any`.
- **Never run git commands.** Leave changes in the working tree.
- Ask before adding a paid service, any analytics or tracking script, or anything that needs
  my accounts. The one exception is Vercel itself, which I'll connect myself.

### 3. Look and feel

Match the app: `docs/architecture/design-system.md`, a Lusion-style look. In short:

- **Colors** (CSS variables in Tailwind v4's `@theme`): page `#F0F1FA` (cool off-white, never pure
  white as a page), surface `#FFFFFF`, text `#000000`, secondary text `rgba(0,0,0,0.5)`, primary
  `#2B2E3A`, accent `#1A2FFB` (sparingly), dark sections `#000000`, dark panel `#141515`, dark
  track `#34393F`, cross marks `#999999`, hairlines `rgba(0,0,0,0.1)`. **Lime `#C1FF00` only on
  dark backgrounds** (fills, highlights), never as text on light.
- **Type:** Satoshi 400 for everything readable and 500 only for UPPERCASE labels and buttons.
  No bold anywhere. Load Satoshi with Fontshare's hosted CSS
  (`https://api.fontshare.com/v2/css?f[]=satoshi@400,500&display=swap`). Its licence doesn't allow
  self-hosting the files. **IBM Plex Mono** (400, 500) via `next/font/google` for every number,
  address and stat.
  *As built (2026-10-05):* that CSS is fetched at build time and inlined, with the two font files
  preloaded from Fontshare's CDN (a `<link>` to it blocked first paint for about 800 ms on mobile;
  the files are still never self-hosted). A metric-matched Arial fallback keeps the swap at CLS 0.
  Plex Mono loads 400 only, since nothing uses 500. Small secondary text uses black at 0.6, because
  0.5 is 3.9:1 on the page, under WCAG AA. 0.5 stays for large text.
- **Huge headlines** with tight tracking (line height 0.9–1.0, letter spacing −0.01 to −0.02 em),
  tiny uppercase metadata separated by bullets (`STRIDEMON • MOVE TO EARN • MONAD`), "+" cross
  marks on section corners, dark panels (radius 10) set into the light page, and whole sections
  that flip to black.
- **Pill buttons with an arrow** (D-029: an arrow, not Lusion's dot). On hover the label rolls
  (it slides up and a copy slides in from below) and the arrow nudges right. **No blue flood** on
  press (D-031): a pressed pill steps one shade.
- Light theme only, like the app.

### 4. Motion: subtle

- Only two easing curves, nothing bounces: `cubic-bezier(0.4, 0, 0.1, 1)` and
  `cubic-bezier(0.35, 0, 0, 1)`, at 300–500 ms.
- Section content fades and rises about 16 px into place once, as it enters the viewport
  (`IntersectionObserver` + CSS transitions). No scroll-jacking, no parallax on text, no
  autoplaying sound.
- Hero: the Sneaker art draws its lines in once (SVG `stroke-dasharray`/`stroke-dashoffset`), then
  the level ticks and the durability bar fill.
- Numbers in the rules section count up once when they come into view (mono font, so the width
  doesn't jump).
- Animate only `transform` and `opacity`. Prefer CSS; add a motion library only if CSS can't do
  something, and ask first.
- **`prefers-reduced-motion: reduce` turns all of it off**: content is simply there.

### 5. Sections, in order

The copy below is a starting draft. Keep it short, plain and confident, with no hype words
("revolutionary", "next-gen"), no exclamation marks and no price or earnings claims.

1. **Header:** the `StrideMon` wordmark. Links: How it works, Rules, Fair play, On-chain, FAQ. A
   small pill: **See it on Monad** (the `SneakerNft` explorer page).
2. **Hero:**
   - Meta: `STRIDEMON • MOVE TO EARN • MONAD TESTNET`
   - Headline (the app's welcome screen): **Walk. Earn. Upgrade.**
   - Intro: "Your Sneaker is an NFT on Monad. Walk or run with it to earn SOLE, then spend SOLE to
     repair and level it up."
   - Visual: a dark panel with the real on-chain Sneaker art
     (`public/sneaker-art/sneaker-0002-level-02.svg`), plus the Home screenshot in a plain phone
     frame.
   - CTAs: **Watch the demo** (to the video in section 4, or hidden if there's no video) and **See
     the contracts** (scrolls to section 7).
3. **How it works:** the loop as six numbered steps, each with one line and, where there is one, a
   screenshot:
   1. **Own:** sign in with your wallet and get a free starter Sneaker NFT, plus a little test MON
      for gas.
   2. **Energy:** each Sneaker holds up to 10 energy. One point is one rewarded minute, and a point
      comes back every 30 minutes.
   3. **Move:** press START and walk or run. Time, distance, speed and your estimated reward are
      live on screen.
   4. **Earn:** press STOP. The run is checked, then settled on Monad in seconds, and SOLE lands in
      your wallet.
   5. **Upgrade:** spend SOLE to repair durability or to level the Sneaker up. Each level adds
      efficiency, so the next run pays more.
   6. **Own it, really:** send the Sneaker to any wallet. Its level, efficiency and durability go
      with it.
4. **Demo (optional):** if `public/screenshots/demo-walk.mp4` exists, a muted inline video with a
   poster frame, `preload="none"`, played only on click.
   *As built (2026-10-05):* the demo is `public/videos/stridemon-demo.mp4` (78 s, cut from two
   screen recordings with [`landing-page-video-prompt.md`](landing-page-video-prompt.md)), with a
   chapter list beside it that seeks the video. How it works' Move step plays a 5 s loop of the run
   screen in place of its screenshot while on screen, unless motion is reduced.
5. **The rules are on-chain:** a dark section. The numbers in mono, each with one line of
   explanation. All from `SneakerGame`'s launch config (`docs/architecture/game-rules.md`):

   | Rule | Value |
   |---|---|
   | Max energy | 10 points; 1 point = 1 rewarded minute |
   | Energy regeneration | 1 point every 30 minutes |
   | Reward | 0.5 SOLE per efficiency point per minute (a starter at efficiency 10 earns 5 SOLE a minute) |
   | Durability loss | 0.3 per rewarded minute, rounded up per run (a 10-minute run costs 3) |
   | Repair | 0.7 SOLE per point at level 1, plus 0.1 SOLE per point for each level above 1 |
   | Upgrade | 50 SOLE × current level; +2 efficiency per level |
   | Max level | 30 |
   | Starter Sneaker | Level 1, efficiency 10, durability 100, energy 10 |

   One line under it: "The contract enforces these. The app only estimates."
6. **Fair play and privacy:** two columns.
   - Fair play: every run is checked before it pays. A minute only counts at 1–20 km/h on
     average, so idling and riding in a car earn nothing. Jumps faster than 40 km/h between GPS
     fixes are dropped. Mock locations are rejected (Android). The server validates the run, then
     the contract settles it once and only once.
   - Privacy: only your active minutes and distance go on-chain, never your route. Raw GPS samples
     are deleted after 30 days. Your wallet is your account: no email, no password.
7. **On-chain:** "Everything that matters lives on Monad." The four verified contracts, each
   with its address in mono (shortened on mobile, full on desktop, copy-on-click) and an explorer
   link. Then one sentence on the art: the Sneaker's picture is an SVG drawn by a contract, so the
   app, MonadVision and MetaMask all show the same image, and it changes when you repair or
   upgrade.

   | Contract | Address (chain 10143) |
   |---|---|
   | `SneakerNft` (ERC-721) | `0xC116917b06BD9079C87334ED5499054b1B54Fa80` |
   | `SoleToken` (ERC-20 SOLE) | `0xe52DC9df236a6A4F8653432cE6Fd94Dd41e76CC0` |
   | `SneakerGame` (the rules) | `0x36cf91880F0fb41Eeda9fe79e7C5c2BE953f45B9` |
   | `SneakerArtRenderer` (the SVG) | `0x7e01732461C1879915C35E56e73Fd8569B289ADa` |

   Explorer links: `https://testnet.monadvision.com/address/<address>`. Source of truth:
   `packages/contracts/deployments/10143.json`; copy from it, don't retype.
8. **Why Monad:** three short points. Every run settles as its own transaction, fast enough that
   the reward shows on the summary screen seconds after STOP. Gas is cheap enough to give each new
   player a drip so they can repair, upgrade and transfer from their own wallet. It's EVM, so
   standard ERC-721 and ERC-20 contracts work in standard wallets like MetaMask.
9. **FAQ** (plain `<details>` elements, also in the JSON-LD):
   - *Is it live?* Yes, on Monad testnet, on Android. iOS comes later.
   - *Do I need crypto?* A wallet such as MetaMask with Monad Testnet added. New players get a
     small amount of test MON for gas.
   - *Is SOLE worth money?* No. It's a testnet token for the game.
   - *Can I cheat by driving?* No. Minutes above 20 km/h don't count.
   - *What happens to my location data?* Only active minutes and distance reach the chain. Raw
     samples are deleted after 30 days.
   - *Can I sell my Sneaker?* You can send it to any wallet today. A marketplace is planned.
10. **Footer:** the wordmark, "Built on Monad testnet for a hackathon.", the GitHub link,
    the contract links, and "SOLE has no monetary value."

### 6. SEO

- `metadata` in `app/layout.tsx`: `metadataBase` = `siteUrl`, a title template, and:
  - title: "StrideMon: walk, earn and upgrade a Sneaker NFT on Monad"
  - description (≤ 155 characters): "A move-to-earn game on Monad. Own a Sneaker NFT, walk or run to
    earn SOLE, and spend it to repair and level up your Sneaker."
  - canonical, Open Graph (`type: website`, `siteName`, `locale: en_US`), Twitter
    `summary_large_image`.
- `app/opengraph-image.tsx` (1200×630, `next/og`): the off-white page, the headline, and the
  dark Sneaker panel. Use it for Twitter too.
- `app/icon.svg` (a simple mark from the Sneaker art) and `app/apple-icon.png`.
- `app/sitemap.ts` and `app/robots.ts`, both from `siteUrl`.
- JSON-LD in the page: `VideoGame` (name, description, url, `gamePlatform: "Android"`,
  `applicationCategory: "GameApplication"`, `operatingSystem: "Android"`, `genre: "Move to
  earn"`, offers at price 0), plus a `FAQPage` built from the same FAQ data as section 9.
- One `<h1>` (the hero headline), then `<h2>` per section, semantic landmarks
  (`header`, `main`, `section` with `aria-labelledby`, `footer`), `lang="en"`.
- Every screenshot has descriptive `alt` text (what the screen shows, not "screenshot").
- Performance is part of SEO. All images via `next/image` with width and height (no layout
  shift), the hero image `priority`, the rest lazy. AVIF/WebP from the PNGs. No client JavaScript
  beyond the reveal observer, the count-up and copy-to-clipboard.
- **Targets:** Lighthouse 95 or more for Performance, Accessibility, Best Practices and SEO, on
  mobile. CLS 0. Text contrast meets WCAG AA (watch the 0.5-opacity secondary text on small sizes).

### 7. Responsive

Phone first (360–430 px), then tablet and desktop up to 1440 px. 16 px side gutters on phones, no
horizontal scroll. The phone screenshots stay a readable size on desktop (max height about
640 px) and sit beside their text from tablet width up.

### 8. Screenshots (in `website/public/screenshots/`)

Android, 1080 × 2340 PNG, taken on the demo build. Use the ones that exist and show a labelled
placeholder of the same size for any that are missing.

| File | Screen | Used in |
|---|---|---|
| `01-welcome.png` | Welcome ("Walk. Earn. Upgrade.") | How it works 1 |
| `02-home.png` | Home: Sneaker card, energy, SOLE balance | Hero, How it works 2 |
| `03-active-run.png` | Dark active run: time, distance, speed, estimated reward | How it works 3 |
| `04-run-summary.png` | Summary: +SOLE, rewarded minutes, durability lost | How it works 4 |
| `05-sneaker-tab.png` | Sneaker tab: repair and upgrade panels | How it works 5 |
| `06-repair-review.png` | Repair review sheet (replaced "Level 2 reached", 2026-10-05) | How it works 5 |
| `07-transfer.png` | Send Sneaker: recipient address and review | How it works 6 |
| `08-history.png` | History list of settled runs | (spare, not on the page) |
| `09-explorer-nft.png` | MonadVision's NFT page with the same art (optional) | On-chain |
| `demo-walk.mp4` + `demo-walk-poster.png` | The recorded walk (optional, under 15 MB) | Demo |

Crop the Android status bar off if it shows notifications or a low battery.

*As built (2026-10-05):* every status bar is painted over with the screen's background (the
size stays 1080 × 2340). `04` had a black border, trimmed. `02` and `05` were long scrolling
captures: `02` is cut to the header, Sneaker card and balance, and `05` keeps the title, the
repair and upgrade panels and the tab bar. With every screenshot in place, the placeholders were
removed: a missing file listed in `src/content/screenshots.ts` now fails the build. The demo
video isn't a screenshot any more: it, its poster and the walk loop live in `public/videos/`
(see `website/README.md` → Demo video), and the raw recordings in the gitignored
`website/media-source/`.

### 9. Don't

- Don't invent numbers, users, partners, testimonials or download counts. No "join 10,000
  runners".
- Don't link an app store or a download. There's no public build yet.
- Don't claim mainnet, real earnings or token value.
- Don't add a cookie banner, analytics or newsletter form.
  *As built (2026-10-06, D-037):* one form was added later, the waitlist (`#waitlist`), which
  posts an email to the StrideMon API. Still no newsletter, cookies or analytics.
- Don't copy Lusion's fonts, images or code. Use only the tokens above.

### 10. When it's built

Report: the files you created, the Lighthouse scores (mobile), screenshots of the page at 390 px
and 1440 px, and anything you left as a placeholder (the GitHub URL, missing screenshots).
Then tell me how to deploy it on Vercel:
1. A new project from the repo, root directory `website`, framework Next.js, install command
   `bun install`, build command `bun run build`.
2. Add the domain `stridemon.yashmittal.xyz` to that project. The `*.yashmittal.xyz` wildcard
   already points at Vercel, so no DNS record is needed.

Placeholders you don't know: the **GitHub repo URL**. Put it in `website/src/content/` as a
clearly marked constant, and I'll fill it in.
