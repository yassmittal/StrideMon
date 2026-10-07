# Founding Pass: the brief

Version 3, 2026-10-08. Written for a fresh start on `main`. **This file is self-contained**: nothing
from the first attempt (a verified waitlist line with waves, §15) exists on `main`.

- **v1 (dropped):** a place in a line and a wait. Nothing to own, nothing to choose.
- **v2 (replaced the same day):** 100 designs with 10 copies each.
- **v3 (this file):** **1,000 one-of-a-kind Founding Passes.** Every pass is a different design,
  and each can be minted once. The player browses them, finds the one they love, and mints it in
  about a second.
- **Art direction (2026-10-08, §4.3):** the pass art is one detailed Sneaker on a quiet
  background (no scene). Its reference drawing is in `packages/contracts/art/sneaker/`. This
  replaces the line-art scenes proposed in §3.2.

**How to use it:** start a new Claude Code session in the repo root and say: *"Read
`docs/founding-pass-brief.md`, ask me the open questions in §13, then plan Part 1 and wait."*
Follow `CLAUDE.md` as always: docs first (a new decision, the next free number, D-041 on `main`),
one part at a time with a check after each, never git.

---

## 1. The idea in one paragraph

StrideMon opens with **1,000 Founding Passes, every one a different design**: a Sneaker scene drawn
on-chain from layers (time of day, sneaker shape, colors, pattern, extras), each with its own number
and name. Before minting opens, the whole gallery goes up so people can browse, pick favorites
and talk about them. On mint day, a player finds the pass they want, verifies their email, connects
a wallet, and mints it in about a second on Monad, gas-free. **Once it's minted, it's theirs and
nobody else can have it.** The reveal shows their founder number and sometimes a rare gold frame.
The pass is soulbound (it can't be sold or sent). It's their early access to the app, **it changes
after their first real walk**, and every pass has its own share page for X. When all 1,000 are
minted, the game opens to everyone.

## 2. Why this gives dopamine

| Moment | Why it works |
|---|---|
| **Browse 1,000 designs** | Looking is fun in itself, and the gallery is content: people screenshot, compare and argue about favorites before minting even opens. |
| **Find "the one"** | Every pass is unique, so the pick is personal: "#0137 is mine, and nobody else has it." StrideMon sounds like Pokémon, and choosing a starter is that genre's most remembered moment. |
| **Find your match** | A 3-question quiz ("When do you walk? Pick a color. Pick a style.") shows the 6 available passes that fit you. It turns 1,000 choices into a small, personal shortlist. |
| **Scarcity you can see** | "612 of 1,000 minted", and each pass in the gallery turns to "Minted by 0x3f…a1" the moment someone takes it. On mint day, the live show is the gallery filling up. |
| **Instant mint** | Monad confirms in about a second, and the server pays the gas. The reward lands right after the click, and the user feels Monad's speed. |
| **Reveal** | The card turns, the founder number counts up ("Founder 42 of 1,000", the mint order), and about 1 in 10 passes gets a **gold frame** at random. It's cosmetic and the pass can't be sold, so it's a flex, not a lottery prize. |
| **Share** | Every pass has its own page and preview image. "I got #0137 Midnight Racer, one of one" sells the next mint. |
| **It changes after you walk** | The first settled walk **laces** the pass (the on-chain art changes). This pulls people from "minted" to "played". |

**Tone:** the user prefers a calm, quiet UI. Make each moment well, in the site's Lusion look (a
card turn, numbers counting up, a haptic in the app). No confetti or sound effects.

**Too much choice is the main risk.** A wall of 1,000 stalls people. The gallery has to make
choosing easy and fun: **the match quiz, families, filters, "Surprise me", search by number and
favorites** (§5).

## 3. The collection

### 3.1 Size: 1,000 one-of-ones

Each of the 1,000 designs can be minted once. **The token id is the design number** (pass #0137 is
design 137), so "which pass is it" and "which design is it" are the same question. The mint order
is shown separately as the **founder number** ("Founder 42").

Why 1-of-1 beats the alternatives considered on 2026-10-08 (5 designs × 200, 100 × 10): every
owner has something nobody else has, the gallery is bigger content, and "one of one" is the
strongest line in a share post. The cost is more art to generate and more to review (§4), and
a racier mint day for the most-wanted designs (§5.3, §9).

### 3.2 Anatomy of a design

> **Superseded in part by §4.3 (2026-10-08).** The art is now the detailed Sneaker in
> `packages/contracts/art/sneaker/`, on a quiet background with no scene. The *Family* and *Sky detail* layers
> below were scene layers, so they no longer fit, and the line-art style is replaced. The rest of
> this section (1-of-1s, generated names, rarity from layers, Unlaced/Laced, gold frame) still
> holds. Part 1 redesigns the layer table around the new Sneaker.

Every design is a combination of **layers** drawn in the same line-art style as the Sneaker
(D-030: plain paths, rects and text, no filters, gradients or CSS, so the app's `react-native-svg`
draws it exactly like a browser). 1,000 different designs need more variety than a small set
would. A proposal, designed for real in Part 1:

| Layer | Options (proposal) | Count |
|---|---|---|
| **Family** (the scene and time of day) | Dawn, Noon, Dusk, Midnight, Storm | 5 |
| **Sky detail** | Sun, Moon, Clouds, Stars field | 4 |
| **Silhouette** | Runner, Trail, High-top, Racer, Walker, Slip-on | 6 |
| **Palette** (upper, sole, accent) | 12 named palettes, two of them rare (Gold, Prism) | 12 |
| **Pattern** on the upper | Plain, Stripes, Dots, Grid, Zigzag, Panels, Waves, Checks | 8 |
| **Sole** | Flat, Chunky, Spiked | 3 |
| **Laces** | Flat, Round, Speed, Loop | 4 |
| **Extra** | None, Wings, Flames, Speed lines, Stars, Leaves, Lightning, Trail dust | 8 |

That's about 1.1 million possible combinations. A generator picks 1,000 under rules (§4.2), and
Yash reviews them in sheets of 100.

- **200 designs per family**, so the gallery can be browsed by family.
- **Every design has a name** built from its layers ("Midnight Racer · Lightning"). With 1,000
  designs, hand-naming every one is too much, so names are generated. Hand-picked names for the
  rare ones are optional (§13).
- **Rarity comes from layers.** A design's rare layers (Gold or Prism palette, Wings, Lightning)
  give it a label: Common, Uncommon, Rare or Legendary, with about 10 Legendaries. The label is
  cosmetic and shown, never "worth more".
- **Two stages:** *Unlaced* at mint, *Laced* after the holder's first settled walk (the laces
  appear, and a "LACED" line).
- **Gold frame:** about 1 in 10 passes, decided at random at mint (§2).
- The pass shows `FOUNDING PASS`, its name, `#0137`, and after minting `FOUNDER 42`, the way the
  Sneaker card shows `STRIDEMON` and `#0004`.

## 4. How the 1,000 are made (the art pipeline)

### 4.1 Approach: layers drawn on-chain (recommended)

| Option | For | Against |
|---|---|---|
| **Layers drawn on-chain by a Solidity renderer (recommended)** | Same approach as the Sneaker (D-030): no IPFS and no image hosting, the app, explorer and website all show the same picture, and it can be improved later with one `setArtRenderer` call. 1,000 designs are 1,000 rows of layer numbers (~8 KB). | The art is vector line art, not painted. Drawing good layers takes real design time (Part 1 is the biggest part). |
| Hand-drawn SVGs, stored on-chain | Full artistic freedom. | 1,000 hand-drawn pieces is impossible for one person, and they'd never fit in a contract. |
| AI-generated images on IPFS | Rich pictures, quick to make. | Off-chain hosting (pinning) to keep alive, an inconsistent style, unclear licensing, and the Monad community spots AI art and mocks it. Against D-030. |

**Size check:** Monad allows contracts up to **128 KB** (Ethereum: 24 KB) [17]. The layer drawings
are a few KB each, and the design table is ~8 KB. Names come from the layer words, so they cost
almost nothing. If the renderer still doesn't fit, it splits into a layer-drawing contract and a
design-table contract.

### 4.2 The pipeline

1. **Design the layers** (Part 1). Sketch them in Figma first if that's easier (the Figma tools are
   available), then write them as Solidity drawing functions in `FoundingPassArtRenderer`.
2. **Generate the 1,000:** a seeded script picks combinations under rules, for example:
   - 200 per family, and every palette, pattern and silhouette used a fair number of times
   - the rare layers in fixed, small counts (Gold 15, Prism 10, Wings 30, Lightning 30), so about
     10 designs end up Legendary
   - **no two designs share more than 5 of their 8 layers**, so neighbors in the gallery never look
     like copies (the script checks this and tunes the rules if it can't be met)
   - no clashing pairs (for example a palette that disappears on the Midnight background)

   It writes `designs.json`: number, layers, generated name, rarity.
3. **Render previews from the renderer itself:** a `forge script` (simulation only, never
   broadcast) calls the renderer, writes every SVG to disk with `vm.writeFile`, and builds **10
   contact sheets of 100**. **The Solidity renderer is the only implementation of the art**, so the
   preview is exactly what goes on-chain.
4. **Review:** Yash goes through the 10 sheets and marks the ones he doesn't like. The script
   re-rolls only those, under the same rules. Repeat until all 1,000 pass. Plan for a few hours of
   looking.
5. **Freeze:** the final 1,000 rows become a constant in the renderer (`FoundingPassDesigns.sol`,
   generated from the JSON, never hand-edited), and the names, layers and rarity go to the
   website's content.
6. **Export for the website:** the same script writes the 1,000 preview SVGs (about 4 MB in total)
   to `website/public/pass-art/` (it needs a `fs_permissions` write entry in `foundry.toml`).

### 4.3 Art direction (2026-10-08)

Yash's call after two rounds of drafts: **one high-quality, near-real Sneaker, on a quiet
background with no scene.**

- **The reference:** `packages/contracts/art/sneaker/` (`build-sneaker-art.ts` generates
  `sneaker.svg` and a `sneaker.png` preview; its README explains every part). It's a detailed running
  shoe, toe down and heel up: a knit upper with forefoot cage lines, a mesh window, a contoured toe
  cap, orange suede, a black heel with amber waves, a padded collar, laces, and a sculpted midsole
  with lugs underneath. It uses flat tonal panels and no gradients or filters, and is about 42 KB.
- **A quiet background, no scene.** The busy collage of the first draft is out: the Sneaker
  carries the image. The generator writes the bare shoe (`sneaker.svg`, transparent) and four
  backgrounds to pick from: `studio` (warm wall, light pool, cast shadow), `contour` (warm wall,
  thin rings, corner marks), `night` (the app's dark panel, faint lime glow) and `volt` (solid
  lime). **Open:** which one, or whether the background varies across the 1,000 (it could be one
  of the layers). The card's labels (`FOUNDING PASS`, `#0137`, `FOUNDER 42`) and the gold frame
  are still to design.
- **Where the 1,000 differences come from now:** the Sneaker's own parts, not scenes. Candidates are
  the colourway (each panel's colour), the upper pattern (cage, contours, knit), the heel graphic,
  the midsole insert, lace colour, sole shape and small details (tag, stitching). Part 1 designs
  this table and checks it still gives 1,000 designs that don't look like copies (§4.2's
  "≤ 5 of 8 layers shared" rule).
- **Generative alternative (flat panels, STEPN-style):** `packages/contracts/art/sneaker-templates/`
  draws 3 templates (runner, high-top, trail) in solid-colour angular panels with a thick outline,
  coloured from 6 families by a seed. About 2 to 3 KB each, D-030-safe, and the most direct route to
  1,000 different passes. STEPN's everyday sneakers work the same way: a base design plus colours,
  rendered to PNG on their servers, with hand-painted one-offs for the top tiers. Open: this style,
  the detailed Sneaker, or both (templates for the 1,000, the detailed one as a Legendary or hero).
- **Reference SVGs:** `packages/contracts/art/sneaker-references/` holds 21 freely licensed sneaker
  SVGs from the web (CC0, MIT, ISC, Apache 2.0, CC BY 4.0) to study or remix. Its README lists each
  file's source, author and licence, plus what to fix before using one: brand-like stripes,
  gradients, size and attribution.
- **Before porting to Solidity:** check the drawing in the app with `SvgXml` on the Android phone.
  It uses `<clipPath>`, one `<pattern>` and (for the shadow) `<use>`, which D-030 didn't list. If both draw the same as in a
  browser, record that in the decision for this work.

**Notes from a throwaway prototype of the §4.2 generator (2026-10-08, old line-art layers):**
- The rules can all be met: 200 per family, exactly 10 Legendaries, no two designs sharing more than
  5 of 8 layers, and 1,000 distinct SVGs, generated in well under a second with a seeded random.
- **The contrast rule matters.** Rare palettes must be placed only where they stay readable. Gold
  vanished on a light background, so the generator assigns rare layers to compatible slots first.
- **Generated names repeat.** "Family + Silhouette + Extra" gave only 293 different names for 1,000
  designs, with one name on up to 10 passes. To keep "one of one" true in share posts, either
  include the number in the name, add a naming word and reject repeats, or give each pass its own
  name from a word list (§13.3).

## 5. The gallery and the flow

### 5.1 Before mint day: the preview week (recommended)

The gallery at **`stridemon.xyz/pass`** goes live about a week before minting opens, with a
countdown to a set time (for example Saturday 20:00 IST, 14:30 UTC).

- People browse, take the match quiz, **heart favorites** (kept in the browser, no account), and
  share pass pages.
- "Remind me" posts to the existing waitlist (`POST /v1/waitlist`, D-037): one email when minting opens.
- X gets **a family a day**: Dawn on Monday, Noon on Tuesday, and so on (200 designs each), plus a
  "Legendary of the day". That's a week of posts from the collection itself (`social/`, D-036).

### 5.2 The page

```text
stridemon.xyz/pass

HEADER     "612 of 1,000 minted"   [countdown before mint day]
           A live line: "#0137 Midnight Racer · minted just now"

FIND       [Find your match]  3 questions → 6 available passes that fit you
           [Surprise me]      one random available pass
           Search: #____      jump to a pass by number

FILTERS    Family · Silhouette · Palette · Extra · Rarity
           [Available only]  [Favorites]      Sort: number · rarity · recently minted

GRID       Cards loaded as you scroll (2 a row on a phone, 5–6 on a desktop). Each: the art,
           #number, name, rarity, a heart, or "Minted by 0x3f…a1" (greyed).

DETAIL     Tap a card → a sheet with the art large, its layers and rarity, and
           3 similar passes still available.   [Mint #0137 →]
```

- The grid shows 1,000 small SVGs, so it loads them as they scroll into view (`loading="lazy"`,
  fixed card sizes so nothing jumps).
- Each filter and the quiz are just views over the design table that ships with the page. Only
  the minted state comes from the API.

### 5.3 Minting

```text
1. PICK      "Mint #0137" on the detail sheet
2. EMAIL     email → 6-digit code → verified          (one pass per email)
3. WALLET    connect (MetaMask etc.) → sign a free message   (one pass per wallet; no gas, ever)
4. MINT      the server mints through the outbox → ~1 s
5. REVEAL    the card turns: #0137 MIDNIGHT RACER · FOUNDER 42 (+ gold frame for some)
             Link to the transaction on MonadVision
6. SHARE     "Post on X" (the pass page)   "Get the app" (the APK / Play)

IN THE APP (same wallet)
7. Sign in → the app sees the pass → starter Sneaker → first walk → the pass is LACED
```

- **No holds.** Picking doesn't reserve anything. With one-of-ones, two people will sometimes go for
  the same pass. The API takes the first request, and the second sees "#0137 was just minted" with
  **3 similar passes** to mint with one tap. Holds would let one bot freeze the whole collection.
- **Get the email and wallet steps out of the way early.** A player can verify their email and
  connect their wallet *before* picking (a "Get ready" button at the top). Then on mint day, one
  tap on a pass mints it, which matters for the most-wanted designs.
- **Why the email:** one pass per person, a way to reach founders, and a bot filter. Minting with
  a wallet alone would be easier to farm.

## 6. Where the mint happens: the website (recommended)

| Option | For | Against |
|---|---|---|
| **A. On `stridemon.xyz/pass` (recommended)** | The reward is immediate, and people can mint without installing anything. It's the page that gets shared. | Needs wallet code on the website (Reown AppKit for web + wagmi), loaded **only on `/pass`** so the landing page keeps its speed targets (D-035). Overturns D-037's "the website never asks for a wallet". |
| B. Pick on the website, mint in the app | The website stays email only. | The best moment happens later, on another device. |
| C. Email login creates a wallet (Privy, thirdweb…) | No MetaMask needed. | A different wallet from the app's, and Privy's free plan stops at 500 users. Revisit for mainnet. |

The website signs in with the **same SIWE flow as the app** (`/v1/auth/nonce`, `/v1/auth/verify`;
`SIWE_DOMAIN` is already `stridemon.xyz`, the website's own domain). The API then mints through the
existing outbox, as it does for the starter Sneaker. Mints queue one after another, so a rush is
slower but never fails.

## 7. What the pass does

- **Early access (the gate):** while `EARLY_ACCESS_REQUIRED` is on, the API only mints a starter
  Sneaker for a wallet that holds a pass. It reads the chain, which is the source of truth. Wallets
  that already have a Sneaker are never blocked.
- **The hackathon:** Metropolis judging runs until 2026-10-27, and judges install the README's APK.
  Keep the gate **off until judging ends**, or give judges a code.
- **After 1,000:** the gate turns off and everyone can play. The passes stay as the record of who
  was first.
- **In the app:** the pass on Profile, the gate's "Mint your Founding Pass at stridemon.xyz/pass"
  screen, and the laced moment after the first walk.
- **Later, honest perks only:** a Founder badge, the first Google Play closed-test seats, invite
  codes after the first walk (STEPN's mechanic), and maybe a starter Sneaker in your pass's palette
  (a new Sneaker renderer could read the pass, with no `SneakerNft` redeploy). Never tokens or money.

## 8. Share pages (the website is a static export)

The site is built as static files (D-035). Since every pass is a known design, **every pass gets its
own page at build time**:

- `stridemon.xyz/pass/137`: 1,000 static pages, each with its own Open Graph image made from its
  art. Part 4 checks how long the build takes; if 1,000 Open Graph images make it too slow, the
  images are rendered once by the art export script and reused.
- The page shows the pass, its layers and rarity, and (from the API, in the browser) whether it's
  minted and by whom. While it's available, it has the Mint button.
- The share text: "I minted #0137 Midnight Racer, a one-of-one Founding Pass for @stridemon. Founder
  42 of 1,000." The link carries `?source=x-share` (D-037's `source`).

## 9. Guardrails

- **Words:** Founding Pass, design, one of one, mint, collection. Never *whitelist*, *WL*,
  *allowlist*, *airdrop*, *alpha*, *sold out* (nothing is sold: say "all minted").
- **Every surface with the pass says:** "Free. Soulbound: it can't be sold or sent. It isn't a token
  and never turns into one." STRIDE stays "Monad testnet. STRIDE has no monetary value."
- **Testnet** for the contracts (CLAUDE.md: testnet until Phase 10).
- **One pass per email and per wallet**, enforced by the API and (per wallet) the contract.
- **Bots will go for the Legendaries.** One-of-ones give a bot a reason to snipe the rare ones the
  second minting opens. Use the email step, a per-IP rate limit on minting, and **Cloudflare
  Turnstile (free) on the mint button** from the start: the first version left it out, but
  one-of-ones change that.
- **Rarity is cosmetic.** Never say a rare design or gold frame is worth more.
- **Expect "airdrop?" replies.** Monad's own soulbound "1 Million Nads" NFT drew airdrop rumours
  even though it said it holds no value. Answer the same plain "no" every time.
- **Privacy:** the policy page must name the email provider and Turnstile, and say the website now
  collects a wallet address. Showing "Minted by 0x3f…a1" is fine: ownership is public on-chain anyway.

## 10. Architecture (the plan fills in the details)

### 10.1 Contracts (`packages/contracts`)

**`FoundingPass`**: ERC-721 + ERC-5192 (soulbound) + AccessControl, separate from the game so a game
redeploy never wipes the founders. Name "StrideMon Founding Pass", symbol `PASS`.

| Piece | What it is |
|---|---|
| `DESIGN_COUNT = 1_000` | constant. **Token id = design number** (1–1,000) |
| `mint(address to, uint256 designNumber)` | `MINTER_ROLE` (the game-server key). Records the founder number (`++mintedCount`) and rolls the gold frame. Reverts `InvalidDesign`, `PassAlreadyMinted` (that design is taken), `FoundingPassAlreadyHeld` (that wallet has one) |
| `setLaced(uint256 tokenId)` | `MINTER_ROLE`, once. Emits ERC-4906 `MetadataUpdate` |
| `passOf(tokenId) → (founderNumber, hasGoldFrame, isLaced)` | the per-mint record (the design itself comes from the renderer's table) |
| `mintedBitmap() → uint256[4]` | which of the 1,000 are minted, in one call (1,024 bits), for the gallery |
| `tokenURI`, `imageSvg` | through the swappable renderer, with attributes (family, silhouette, palette, pattern, extra, rarity, founder number, frame, stage) |
| transfers and approvals | revert `FoundingPassIsSoulbound()`. `locked()` is always true, and `Locked` is emitted at mint |

**`FoundingPassArtRenderer`**: `renderPassSvg(tokenId, passRecord)` and `renderDesignPreviewSvg(designNumber)`
(the gallery's art, before minting), the layer drawings, the frozen design table and the name words.

**Scripts:** `RenderPassArt.s.sol` (previews, the 10 contact sheets and the website export;
simulation only) and `DeployFoundingPass.s.sol` (its own deploy: it never redeploys the game).
Deploy keys and `chain:export-abis` work as today.

**Tests:** soulbound transfers revert, each design mintable once, one per wallet, roles, laced once,
`mintedBitmap`, the renderer for every design (each of the 1,000 renders, and no two produce the
same SVG), and fuzzing on the design number.

### 10.2 API (`apps/api`)

| Piece | What it does |
|---|---|
| `POST /v1/pass/email-code` | emails a 6-digit code through Brevo (§15's rules: hashed, 10 minutes, 5 tries, once a minute) |
| `POST /v1/pass/email-verify` | checks the code and returns a short-lived **email proof** (a signed token, a few hours, so "Get ready" before mint day still works) |
| `POST /v1/pass/mints` 🔒 | `{ designNumber, emailProof, turnstileToken }` with the SIWE access token. Checks the email has no pass, the wallet holds none (chain), and the design is free. Records the mint and queues `mintFoundingPass` in the outbox. A taken design answers `PASS_ALREADY_MINTED` with 3 similar available designs |
| `GET /v1/pass/mints/:mintId` 🔒 | the mint's state; once confirmed: founder number, gold frame, transaction hash (the page polls it for the reveal) |
| `GET /v1/pass/collection` | `mintedBitmap()` (cached a few seconds) plus designs with a mint still queued, the total, and the last 10 mints for the live line |
| Starter-Sneaker gate | `EARLY_ACCESS_REQUIRED` flag; reads `FoundingPass.balanceOf` |
| Lacing | after a `settleSession` confirms for a wallet whose pass isn't laced, queue `laceFoundingPass` |
| CORS | open the `/v1/pass/*` routes and `/v1/auth/nonce` + `/v1/auth/verify` to the site's origin only |
| Collections | `passEmailCodes` (TTL) and `foundingPassMints`, **unique by design number, by email and by wallet**, so two racing requests can't both take #0137. The chain stays the truth for who owns what |

### 10.3 Website (`website/`)

- `/pass` (the gallery, the quiz, filters, search, the detail sheet, favorites, countdown, "Get
  ready", the mint steps, the reveal) and `/pass/[number]` (1,000 static pages with Open Graph
  images).
- Wallet code (Reown AppKit web + wagmi + viem) loaded **only** on `/pass`, after "Get ready" or
  "Mint", with the existing Reown project id. The site still never imports `@stridemon/*` (D-035):
  ABIs and the design table are copied into `website/src/content/` by the export script.
- The landing page gets a Founding Pass section that links to `/pass`, and the waitlist copy
  becomes "Remind me when minting opens".
- `/pass` gets its own targets: Lighthouse ≥ 90 on mobile, with art loaded as it scrolls and the
  wallet code loaded on demand. The landing page keeps D-035's ≥ 95.

### 10.4 App (`apps/mobile`)

- `features/founding-pass/`: `useFoundingPass` (reads `balanceOf`, `tokenOfOwnerByIndex`, `passOf`,
  `imageSvg` with wagmi), and a `FoundingPassCard` (`SvgXml`, like `SneakerCard`).
- Profile shows the pass. The gate's screen sits where Minting is today when there's no pass and no
  Sneaker. After the first settled walk, a quiet "Your pass is laced" moment with a haptic.

## 11. Build plan

Each part ends with a check and a stop for Yash's go-ahead.

| Part | What | Size | Done when |
|---|---|---|---|
| **0. Decide** | Answer §13. A new decision (D-041 on `main`) and the docs: `smart-contracts.md`, `backend-api.md`, `data-model.md`, `security.md`, the privacy page, `CLAUDE.md` | S | The docs say what will be built |
| **1. Art** | The layer drawings in `FoundingPassArtRenderer`, the generator and its rules, the preview script and 10 contact sheets, then Yash's review and re-rolls | **XL**, plus a few hours of Yash's review | Yash approves all 10 sheets; every design renders the same in a browser and in `react-native-svg`; no two are the same |
| **2. Contract** | `FoundingPass`, the frozen design table, tests, the deploy to testnet, verification, `chain:export-abis`, the website export | M | `forge test` passes, and both contracts are verified on MonadVision with a test mint from the deployer |
| **3. API** | Brevo (`deployment.md`: account, DKIM records, key), Turnstile keys, email codes, email proof, mints, the collection endpoint, CORS, the gate flag (off), lacing | L | API tests pass, and a real code arrives at Gmail with DKIM and DMARC passing |
| **4. Website** | `/pass`, the quiz, filters, the 1,000 pass pages, wallet sign-in, "Get ready", mint, the reveal, share, preview mode with countdown | **XL** | A full mint on a phone browser against the local API and the testnet contract, a race for the same pass handled, Lighthouse, screenshots |
| **5. App** | The pass card, the gate screen, laced | M | Checked on the Android phone: mint on the web → sign in to the app → starter Sneaker → walk → laced |
| **6. Launch** | Preview week, a family a day on X (`social/`), mint day, the waitlist's "minting is open" email, a DeltaV update with Yash's ok | S, plus calendar time | Mint day happens |

About 4 weeks of focused work before the preview week, mostly Parts 1 and 4.

## 12. Metrics (no analytics added)

From our database and the chain: mints per hour on mint day, time to all 1,000, **which passes went
first** (the most-wanted list is a post), which families and rarities went fastest, quiz → mint,
email → verified → minted drop-off, races lost (a design taken first), minted → signed in to the app
→ first walk (laced), gold frames, and sign-ups by `?source=`.

## 13. Open questions for Yash (answer these first)

1. **Art:** layers drawn on-chain (recommended), or something else (§4.1)? *Partly answered
   2026-10-08:* the look is the detailed Sneaker in `packages/contracts/art/sneaker/` (§4.3), drafted
   by Claude in code. Still open: whether it goes on-chain as is (the Solidity port).
2. **Theme:** ~~families by time of day~~ dropped: a quiet background, no scene (§4.3). Open:
   which background, which Sneaker parts vary across the 1,000, and the names that come from them.
3. **Names:** generated from layers (recommended), plus hand-picked names for the ~10 Legendaries?
4. **Gold frame** at random on about 1 in 10 passes? Recommended: yes.
5. **Mint on the website (A)?** Recommended: yes.
6. **Keep the email step, and add Turnstile on the mint button?** Recommended: yes to both.
7. **The match quiz?** Recommended: yes. It's the best answer to 1,000 choices.
8. **Preview week, then mint at a set time?** Recommended: yes, with a family a day on X.
9. **Gate:** on after judging ends (2026-10-27)? Recommended: yes.
10. **Timing:** start after the Metropolis submission (deadline **2026-10-14 09:29 IST**)? Still
    left there: the recorded repair and upgrade, the ≤ 3-minute demo video and the dashboard
    (`docs/hackathon-submission.md`). Part 1 (art) could start in parallel, since it touches nothing
    the submission uses.

## 14. Research (2026-10-07 and 08)

| Finding | Use |
|---|---|
| **STEPN gated its beta behind activation codes**; players earned codes by moving, and drops were gone in minutes. [1][2] | Same genre: scarcity, and earning access by moving. Invite codes after the first walk come from here. |
| **Robinhood's waitlist reached ~1M sign-ups** with visible progress and referrals. [3][4] | Visible progress drives sharing. Here that's the gallery filling up and the share pages. |
| **Monad sent 600k+ soulbound "1 Million Nads" NFTs** that it said hold no value; airdrop rumours followed. [5][6] | The community knows soulbound commemoratives. Expect the airdrop question. |
| **Dynamic NFTs that level up with activity** (Typus "Tails", Station3's free Passport). [7] | The pass changing after the first walk. |
| **Sybil filtering in 2026** rewards deep activity on few wallets. [8] | A free soulbound pass, one per email and wallet, is little use to farmers. |
| **Google Play still requires 12 testers for 14 days** for new personal accounts, and rejects tests where testers barely used the app. [9] | Founders are the natural closed test. |
| **Email:** Resend's free plan is 3,000/month but only 100/day; Brevo's is 300/day; SES is $0.10 per 1,000. [10][11] Brevo rewrites the sender to `@brevosend.com` unless the domain is DKIM-authenticated. [16] | Brevo, with the domain authenticated. **Mint day can exceed 300 codes**: "Get ready" during the preview week spreads them out; otherwise move to SES. |
| **Monad gas:** ~$0.0005 for a 200k-gas transaction at the minimum base fee; MON ~$0.034. [12][13] | On testnet the mints are free. Even on mainnet, 1,000 would cost under $1. |
| **Monad's contract size limit is 128 KB** (initcode 256 KB), up from Ethereum's 24 KB. [17] | Room for the layer drawings and the 1,000-row design table. |
| **Privy's free plan:** 500 MAU, then $299/month. [14] | Embedded wallets wait (option C). |
| **ERC-5192** is the final standard for soulbound ERC-721s. [15] | Wallets and explorers can tell the pass can't move. |

## 15. What the first attempt taught us

- **Keep:** 6-digit email codes, not magic links (mail scanners open links and use them up). Store
  codes only as a SHA-256 hash, valid for 10 minutes and 5 tries, send at most one a minute per
  email, and answer the same for new and known emails.
- **Keep:** CORS limited to the routes the website calls, from `WAITLIST_ALLOWED_ORIGINS` only, and
  a per-IP rate limit on every public route. In `bun test`, give each injected request its own
  `remoteAddress`, or the per-IP limit trips mid-test.
- **Brevo setup:** add Brevo's `brevo-code` and DKIM records in Namecheap. **Don't** add Brevo's
  suggested DMARC record: `_dmarc` already exists (`p=reject`, `deployment.md` §11.2), and it still
  passes because Brevo's DKIM signs for `stridemon.xyz`. Check with Gmail's "Show original" (DKIM
  and DMARC both PASS). In production the API must refuse to boot without `BREVO_API_KEY`; in
  development it logs the code instead. Add the key to the server's `.env` **before** deploying.
- **Local checks:** run the API from another directory with an explicit environment (a throwaway
  database, an RPC URL nothing listens on, no Brevo key). Bun loads `.env` from the current
  directory, and the real `.env` holds the game-server key (CLAUDE.md: never run the local API
  against testnet).
- **Drop:** the line, waves and referral queue. They delay the reward, and a number in a line isn't
  something you own.
- **The existing waitlist** (`waitlistSignups`) stays. It becomes "Remind me when minting opens", and
  its emails get one message on mint day.

## Sources

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
[16] [CaptainDNS: Brevo transactional email guide](https://www.captaindns.com/en/blog/brevo-transactional-email-technical-guide) ·
[17] [Monad MIP-2: contract size limit](https://mips.monad.xyz/MIPs/MIP-2)
