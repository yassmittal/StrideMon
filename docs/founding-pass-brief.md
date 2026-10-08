# Founding Pass: the brief

Version 6, 2026-10-08. Written for a fresh start on `main`. **This file is self-contained**: nothing
from the first attempt (a verified waitlist line with waves, §15) or from the art experiments
(§4.3) exists on this branch.

- **v1 (dropped):** a place in a line and a wait. Nothing to own, nothing to choose.
- **v2 (replaced the same day):** 100 designs with 10 copies each.
- **v3:** **1,000 one-of-a-kind Founding Passes.** Every pass is a different design,
  and each can be minted once. The player browses them, finds the one they love, and mints it in
  about a second.
- **v4 (2026-10-08): the art style is decided** (§4.3): flat-panel Sneakers built from templates,
  in the spirit of STEPN's everyday sneakers. Claude designs the final art in one go (Part 1a).
- **v5 (2026-10-08, after Part 1a):**
  - **The art is done and approved** ([`packages/contracts/art/founding-pass`](../packages/contracts/art/founding-pass/README.md)).
  - **The pass comes with a Founder Sneaker:** two linked NFTs, and neither can be sent (§7).
  - **The mint opens with a 48-hour waitlist window** (§5.1).
  - **The build moves to [`docs/founding-pass/`](founding-pass/README.md)**, one file per part.
- **v6 (this file, 2026-10-08, Part 0):** every open question is answered (§13), and
  [**D-041**](decisions.md) records the whole decision. The ten Legendaries have hand-picked
  names (§3.2), the backup opening date is 14 days after the open mint (§5.1), Turnstile guards
  both Send code and Mint (§9), and support can move a lost wallet's pass (§7).

**How to use it:** start a new Claude Code session in the repo root and paste the prompt from
[`docs/founding-pass/README.md`](founding-pass/README.md). Each session does one part and stops.
Follow `CLAUDE.md` as always: docs first (a new decision, the next free number, D-041 on `main`),
one part at a time with a check after each, never git.

---

## 1. The idea in one paragraph

StrideMon opens with **1,000 Founding Passes, every one a different design**: a bold, flat-panel
Sneaker drawn on-chain from a template, a colour family and a few options (§3.2, §4.3), each with its
own number and name. Before minting opens, the whole gallery goes up so people can browse, pick favorites
and talk about them. On mint day, a player finds the pass they want, verifies their email, connects
a wallet, and mints it in about a second on Monad, gas-free. **Once it's minted, it's theirs and
nobody else can have it.** The reveal shows their founder number and sometimes a rare gold frame.
The pass is soulbound (it can't be sold or sent). It's their early access to the app. There it gives
them a **Founder Sneaker drawn in the same design**: the shoe they run in, which can't be sent
either. **Both change after their first real walk**, and every pass has its own share page for X.
People on the waitlist mint first, in a 48-hour window. When all 1,000 are minted, or on a backup
date, the game opens to everyone, with a normal Sneaker.

## 2. Why this gives dopamine

| Moment | Why it works |
|---|---|
| **Browse 1,000 designs** | Looking is fun in itself, and the gallery is content: people screenshot, compare and argue about favorites before minting even opens. |
| **Find "the one"** | Every pass is unique, so the pick is personal: "#0137 is mine, and nobody else has it." StrideMon sounds like Pokémon, and choosing a starter is that genre's most remembered moment. |
| **Find your match** | A 3-question quiz ("When do you walk? Pick a color. Pick a style.") shows the 6 available passes that fit you. It turns 1,000 choices into a small, personal shortlist. |
| **Scarcity you can see** | "612 of 1,000 minted", and each pass in the gallery turns to "Minted by 0x3f…a1" the moment someone takes it. On mint day, the live show is the gallery filling up. |
| **Instant mint** | Monad confirms in about a second, and the server pays the gas. The reward lands right after the click, and the user feels Monad's speed. |
| **Reveal** | The card turns, the founder number counts up ("Founder 42 of 1,000", the mint order), and about 1 in 10 passes gets a **gold frame** at random. It's cosmetic and the pass can't be sold, so it's a flex, not a lottery prize. |
| **Share** | Every pass has its own page and preview image. "I got #0137 Ember Runner Dusk, one of one" sells the next mint. |
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

Every design is a **flat-panel Sneaker** (the style is in §4.3): a **template** (the shoe's
silhouette, cut into named panels), a **colour family** that fills the panels, and a few
**options** that change details.

**Decided in Part 1a (2026-10-08):** the art README has the final system:
- 10 templates, 14 families and 10 designed colourways
- names in the form "Family Template Colourway", unique by construction
- rarity: a pass is as rare as its rarest layer, which gives 650 Common, 250 Uncommon, 90 Rare and
  10 Legendary, and the Legendaries are the Prism family
- the near-copy rule counts only visible layers

The starting shape it began from:

| Layer | What it is | Rough count |
|---|---|---|
| **Template** | The silhouette and its panels: runner, high-top, trail, racer, court, slip-on, chunky "dad shoe", sock runner… | 8 to 12 |
| **Colour family** | 5 shades, light to dark, that the panels take by role. Two or three rare families (for example Gold, Chrome, Prism) | 10 to 14 |
| **Colourway seed** | Which shade each panel gets, within the family (light shades swap with light, dark with dark) | many |
| **Options** | Per-template details: shard shapes on the side, a strap or not, a heel cage, sole style (flat, chunky, lugged), lace colour, a toe bumper | 3 to 6 slots |

That's far more than 1,000 combinations. A generator picks 1,000 under rules (§4.2), and Yash reviews
them in sheets of 100.

- **The colour family is the "family"** for browsing and for "a family a day" on X.
- **Every design has a name** built from its layers. **Names must not repeat:** a first
  prototype's "family + shape + extra" names gave only 293 different names for 1,000 designs.
  Part 1a settled it with "Family Template Colourway" ("Ember Runner Dusk"), which is unique
  because no two designs share all three.
- **The ten Legendaries have hand-picked names** (Part 0, D-041): ten rare lights in the sky,
  one per template. Runner **Earthshine**, Racer **Afterglow**, Trail **Fogbow**, Court **Fire
  Rainbow**, Hoop **Glory**, Chunky **Steve**, Sock **Moonbow**, Skate **Airglow**, Spike **Heat
  Lightning**, Hiker **Sun Pillar**. A name follows its template's Legendary whatever number
  Part 1b's re-rolls give it. D-041 has why each fits, and the shoe names checked and dropped.
- **Rarity comes from layers.** Rare families and rare options give a label: Common, Uncommon, Rare
  or Legendary, with about 10 Legendaries. Part 1a made the Legendaries the Prism family, one per
  template. A hand-drawn **one-off template** stays possible later (STEPN's top tier is hand-made
  too). The label is cosmetic and shown, never "worth more".
- **Two stages:** *Unlaced* at mint (empty eyelets), *Laced* after the holder's first settled walk
  (the lace slats appear, and a "LACED" line).
- **Gold frame:** about 1 in 10 passes, decided at random at mint (§2).
- The pass shows `FOUNDING PASS`, its name, `#0137`, and after minting `FOUNDER 42`, the way the
  Sneaker card shows `STRIDEMON` and `#0004`.

## 4. How the 1,000 are made (the art pipeline)

### 4.1 Approach: layers drawn on-chain (recommended)

| Option | For | Against |
|---|---|---|
| **Layers drawn on-chain by a Solidity renderer (recommended)** | Same approach as the Sneaker (D-030): no IPFS and no image hosting, the app, explorer and website all show the same picture, and it can be improved later with one `setArtRenderer` call. 1,000 designs are 1,000 rows of layer numbers (~8 KB). | The art is flat vector panels, not painted. Designing good templates takes real design time (Part 1 is the biggest part). |
| Hand-drawn SVGs, stored on-chain | Full artistic freedom. | 1,000 hand-drawn pieces is impossible for one person, and they'd never fit in a contract. |
| AI-generated images on IPFS | Rich pictures, quick to make. | Off-chain hosting (pinning) to keep alive, an inconsistent style, unclear licensing, and the Monad community spots AI art and mocks it. Against D-030. |

**Size check:** Monad allows contracts up to **128 KB** (Ethereum: 24 KB) [17]. A flat-panel
template is a few hundred numbers, a rendered Sneaker 2 to 3 KB of SVG, and the design table ~8 KB. Names come from the layer words, so they cost
almost nothing. If the renderer still doesn't fit, it splits into a layer-drawing contract and a
design-table contract.

### 4.2 The pipeline

1. **Design the art system** (Part 1a, §4.4): templates, colour families and options, sketched
   as a TypeScript generator for fast iteration, then ported to Solidity drawing functions in
   `FoundingPassArtRenderer` (Part 1b).
2. **Generate the 1,000:** a seeded script picks combinations under rules, for example:
   - every template and colour family used a fair number of times, so the gallery can be browsed by
     either
   - the rare families and options in fixed, small counts, so about 10 designs end up Legendary
     (rare layers must go only where they stay readable: in the prototype, a gold palette vanished
     on a light background, so assign rare layers to compatible slots first)
   - **no two designs share too many layers** (for example more than 5 of 8), so neighbours in the
     gallery never look like copies. The script checks this and tunes the rules if it can't be met
   - **names unique** (§3.2)

   It writes `designs.json`: number, layers, generated name, rarity. (A prototype met rules like
   these for 1,000 designs in well under a second.)
3. **Render previews from the renderer itself** (once ported): a `forge script` (simulation only, never
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

### 4.3 Art direction (decided 2026-10-08)

Yash picked this after comparing three directions on 2026-10-08. They are saved on the branch
`feat/nft-pass-experiment`, but a session here can't read it (never git), so everything needed is
written here:
- a detailed, near-real single Sneaker (liked, but one drawing doesn't make 1,000)
- line-art scenes with times of day (dropped)
- **flat-panel templates (chosen)**

**The style: flat-panel Sneakers, in the spirit of STEPN's everyday sneakers.** How STEPN does it
(studied from its public marketplace API and image CDN):
- Each everyday sneaker is a **base design** (about 80 of them) **plus a colourway**, rendered once on
  its servers to a PNG (about 1000 × 600) and served from a CDN.
- The look: angular panels with straight edges, **solid colours only, no shading or gradients**, a
  **thick black outline** around the shoe, thinner black lines between panels, a cream base and sole,
  a ladder of cream lace slats, and one small constant mark on the heel (theirs is a green tag).
- Each shoe stays inside **one colour family** (all blues, all teals), which is why every colourway
  looks designed rather than random.
- Their top tiers are **hand-painted one-offs** (a sneaker made of grass, a pixel-art one). The
  everyday ones are the system.
- Their art is off-chain (JSON and images on their servers). **Ours is drawn on-chain** (§4.1).

**What a quick prototype showed** (3 templates × 6 colour families, built in a few hours):
- One template in six families already reads as a varied collection. The shared frame (outline,
  cream, slats, tag) makes them one brand.
- Each rendered Sneaker was 2 to 3 KB of SVG: only polygons, solid fills and one `<clipPath>`.
- Panels drawn back to front and **clipped to the silhouette** can overshoot it, which makes
  templates quick to draw.
- **Shuffle shades within a tier:** let the seed swap the light shades among the light roles and the
  dark ones among the dark roles. Then the collar and sole always stay dark and ground the shoe.
  Fully random shades looked messy.
- **The constant tag needs contrast in every family.** A lime tag vanished on the lime family. Give
  it an outline in a contrasting colour, or pick its colour per family.
- **Lace slats point into the shoe**, perpendicular to the lace line, and need to be chunky (about
  20 × 58 units on a 1000-wide shoe) to read at thumbnail size.
- **Avoid trademark lookalikes.** Three parallel slanted bars read as a famous brand's stripes, and
  swoosh-like curves as another brand's logo. Use triangles, zigzags and shards instead.

**Rules for the final art:**
- **Our own designs.** Learn from STEPN's approach, but copy none of their art, shapes or their
  green tag. The heel mark is StrideMon's own (for example a small lime tag with a mark).
- **D-030 parity:** polygons and paths with solid fills. No gradients, filters or CSS. One
  `<clipPath>` per Sneaker is expected. Check that `react-native-svg` (`SvgXml`) draws it exactly like
  a browser before the Solidity port relies on it.
- **Reads at thumbnail size:** the gallery shows 2 cards a row on a phone. Bold shapes beat detail.
- **Fits the site:** the website and app use a calm Lusion look (cream, ink, lime `#C1FF00`). The
  Sneaker can be loud. The card around it (labels, background, gold frame) should be quiet.

### 4.4 Part 1a: design the art (Claude, in one go)

**Done 2026-10-08, and the look is approved by Yash.** The result is in
[`packages/contracts/art/founding-pass`](../packages/contracts/art/founding-pass/README.md). The
spec as it was:

Yash leaves the design to Claude's own taste, done in **one pass** with no design questions asked
first. Make the calls, show the result, and then Yash reacts.

**Deliver, in `packages/contracts/art/founding-pass/`:**
1. **`build-founding-pass-art.ts`**, a Bun script (no new dependencies). It holds the templates,
   colour families, options and the renderer, and writes SVGs plus PNG previews (`rsvg-convert`;
   `brew install librsvg` if it's missing).
   - Run it as `bun packages/contracts/art/founding-pass/build-founding-pass-art.ts`.
   - The folder sits outside Biome's checks (`packages/contracts` is excluded), but follow the
     coding standards anyway.
2. **The art system:**
   - **8 to 12 templates.** Each should be a clearly different silhouette, with its own panel
     layout and character.
   - **10 to 14 colour families**, including 2 or 3 rare ones.
   - **Per-template options**, and both stages: Unlaced and Laced.
3. **The pass card:** the Sneaker on the Founding Pass card (square, for the NFT image), with
   `FOUNDING PASS`, the name, `#0137`, `FOUNDER 042` once minted, and the gold-frame version. Choose
   the background yourself (quiet, so the shoe carries the image).
4. **Previews:**
   - one sheet with every template in one family
   - one sheet with one template in every family
   - a sheet of 100 seeded designs (as the generator would pick them)
   - the card in its states (available, minted, laced, gold frame)
5. **`README.md`:** the system, every template and family, how to rebuild, and anything left open.

Then **stop** and show Yash the sheets. Once he approves, Part 1b ports the renderer to Solidity
(§4.2). After that, the Solidity renderer is the only implementation of the art.

## 5. The gallery and the flow

### 5.1 Before mint day: the preview week (recommended)

The gallery at **`stridemon.xyz/pass`** goes live about a week before minting opens, with a
countdown to a set time (for example Saturday 20:00 IST, 14:30 UTC).

- People browse, take the match quiz, **heart favorites** (kept in the browser, no account), and
  share pass pages.
- "Remind me" posts to the existing waitlist (`POST /v1/waitlist`, D-037): one email when minting opens.
- X gets **a colour family a day** (for example Ember on Monday, Ocean on Tuesday), plus a
  "Legendary of the day". That's a week of posts from the collection itself (`social/`, D-036).

**The schedule (decided 2026-10-08):**

1. **Waitlist window, 48 hours.** Only emails that joined the waitlist **before the window
   opened** can mint. That's the reason to join during the preview week: "join the waitlist to
   mint 48 hours early".
2. **Open mint.** Anyone can mint what's left, until all 1,000 are minted.
3. **Opening day.** The app opens to everyone when all 1,000 are minted, or on the **backup
   opening date, 14 days after the open mint starts**, if they aren't (Part 0). So the app never
   stays half-closed.

**Rough dates (Part 0, D-041; Part 10 sets the exact times):**

| Step | Starts |
|---|---|
| Preview week (the gate goes on) | Sat 2026-11-21 |
| Waitlist window, 48 hours | Sat 2026-11-28, 20:00 IST (14:30 UTC) |
| Open mint | Mon 2026-11-30, 20:00 IST |
| Backup opening date | Mon 2026-12-14, 20:00 IST |

Someone who isn't on the waitlist during the window is told when the open mint starts, never just
refused.

### 5.2 The page

```text
stridemon.xyz/pass

HEADER     "612 of 1,000 minted"   [countdown before mint day]
           A live line: "#0137 Ember Runner Dusk · minted just now"

FIND       [Find your match]  3 questions → 6 available passes that fit you
           [Surprise me]      one random available pass
           Search: #____      jump to a pass by number

FILTERS    Template · Colour family · Options · Rarity
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
2. EMAIL     email → Turnstile → 6-digit code → verified          (one pass per email)
3. WALLET    connect (MetaMask etc.) → sign a free message   (one pass per wallet; no gas, ever)
4. MINT      Turnstile → the server mints through the outbox → ~1 s
5. REVEAL    the card turns: #0137 EMBER RUNNER DUSK · FOUNDER 42 (+ gold frame for some)
             Link to the transaction on MonadVision
6. SHARE     "Post on X" (the pass page)   "Get the app" (the APK / Play)

IN THE APP (same wallet)
7. Sign in → the app sees the pass → Founder Sneaker in the pass's design → first walk →
   the pass and the Founder Sneaker are LACED
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

**Decided 2026-10-08: two linked NFTs.**

| A founder owns | What it is | Can it be sent or sold? |
|---|---|---|
| **Founding Pass** | Minted on the website. The membership card: a one-of-one design, the founder number, sometimes a gold frame | No, never |
| **Founder Sneaker** | Given in the app, one per pass. The shoe they run in, drawn in the pass's design, with level, efficiency, durability and energy | No |

Everyone after the 1,000 gets a **normal Sneaker**: free, in today's line-art look, and it can be
sent (Phase 7).

The pass isn't the Sneaker itself, for two reasons:
- A soulbound record and a game item that can be repaired, upgraded and later traded are
  different things.
- A pass that could be traded would turn the 1,000 spots into things to flip.

There are no users yet, so **the game contracts are redeployed** to know about Founder Sneakers
directly (§10.1). Even so, the pass stays in its own contract.

- **Early access (the gate):** while `EARLY_ACCESS_REQUIRED` is on, the API only gives a Sneaker
  to a wallet that holds a pass. It reads the chain, which is the source of truth. The gate
  switches off by itself when all 1,000 are minted or the backup date passes (§5.1).
- **The hackathon:** Metropolis judging runs until 2026-10-27, and judges install the README's APK.
  Keep the gate **off until judging ends**. It goes on when the preview week starts (Part 0,
  D-041).
- **A lost wallet (Part 0, D-041):** support may move a pass to a new wallet, by hand, when its
  founder asks and a code sent to the pass's email checks out. An admin-only action
  (`RECOVERY_ROLE`, the deployer key) moves the pass and its Founder Sneaker together, keeping the
  design, founder number, frame, laced state and the Sneaker's stats. The new wallet must not
  hold a pass. The help page says so, since it means the admin can move a pass.
- **After 1,000:** everyone can play, with a normal Sneaker. No new passes, ever. The passes stay as
  the record of who was first.
- **In the app:**
  - the gate's "Mint a Founding Pass to get in early" screen
  - the Founder Sneaker on Home
  - the pass on Profile
  - the laced moment after the first walk
  - a disabled transfer for the Founder Sneaker, with a plain reason
- **Nobody gets stuck:** every step on the website and in the app says what's happening, what to
  do next and where to get help (`docs/founding-pass/part-7-help.md`).
- **Later, honest perks only:** a Founder badge, the first Google Play closed-test seats, and invite
  codes after the first walk (STEPN's mechanic). Never tokens or money.

## 8. Share pages (the website is a static export)

The site is built as static files (D-035). Since every pass is a known design, **every pass gets its
own page at build time**:

- `stridemon.xyz/pass/137`: 1,000 static pages, each with its own Open Graph image made from its
  art. Part 4 checks how long the build takes; if 1,000 Open Graph images make it too slow, the
  images are rendered once by the art export script and reused.
- The page shows the pass, its layers and rarity, and (from the API, in the browser) whether it's
  minted and by whom. While it's available, it has the Mint button.
- The share text: "I minted #0137 Ember Runner Dusk, a one-of-one Founding Pass for @stridemon.
  Founder 42 of 1,000." The link carries `?source=x-share` (D-037's `source`).

## 9. Guardrails

- **Words:** Founding Pass, design, one of one, mint, collection. Never *whitelist*, *WL*,
  *allowlist*, *airdrop*, *alpha*, *sold out* (nothing is sold: say "all minted").
- **Every surface with the pass says:** "Free. It can't be sent or sold. It isn't a token and never
  turns into one." Plain words, never "soulbound" in user-facing copy. STRIDE stays "Monad
  testnet. STRIDE has no monetary value."
- **Testnet** for the contracts (CLAUDE.md: testnet until Phase 10).
- **One pass per email and per wallet**, enforced by the API and (per wallet) the contract.
- **Bots will go for the Legendaries.** One-of-ones give a bot a reason to snipe the rare ones the
  second minting opens. Use the email step, a per-IP rate limit on every public pass route, and
  **Cloudflare Turnstile (free) on both Send code and Mint** from the start (Part 0): the first
  version left it out, but one-of-ones change that. On Send code it also keeps bots from using up
  Brevo's 300 free emails a day.
- **Rarity is cosmetic.** Never say a rare design or gold frame is worth more.
- **Expect "airdrop?" replies.** Monad's own soulbound "1 Million Nads" NFT drew airdrop rumours
  even though it said it holds no value. Answer the same plain "no" every time.
- **Privacy:** the policy page must name the email provider and Turnstile, and say the website now
  collects a wallet address. The mint record links the email to the wallet (for one pass per
  email and the lost-wallet check). Showing "Minted by 0x3f…a1" is fine: ownership is public
  on-chain anyway.

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
| `tokenURI`, `imageSvg` | through the swappable renderer, with attributes (template, colour family, options, rarity, founder number, frame, stage) |
| transfers and approvals | revert `FoundingPassIsSoulbound()`. `locked()` is always true, and `Locked` is emitted at mint |
| `recoverFoundingPass(uint256 tokenId, address newOwner)` | `RECOVERY_ROLE` (the deployer key, never the game server). The lost-wallet move (§7): keeps the record, reverts `FoundingPassAlreadyHeld` if `newOwner` has one |

**`FoundingPassArtRenderer`**: `renderPassSvg(tokenId, passRecord)` and `renderDesignPreviewSvg(designNumber)`
(the gallery's art, before minting), the layer drawings, the frozen design table and the name words,
plus the ten Legendaries' hand-picked names (§3.2).

**Founder Sneakers in the game (decided 2026-10-08, a redeploy is fine):**
- `SneakerNft` records which pass each Founder Sneaker belongs to.
- Founder Sneakers can't be transferred. Normal Sneakers can.
- `SneakerGame` mints one Founder Sneaker per pass.
- A lost-wallet move (§7) moves the Founder Sneaker with its pass (`RECOVERY_ROLE` on
  `SneakerGame` too), stats intact.
- A new Sneaker renderer draws a Founder Sneaker in its pass's design (laced with the pass), and
  normal Sneakers in today's line art.

**Scripts:** `RenderPassArt.s.sol` (previews, the 10 contact sheets and the website export;
simulation only), `DeployFoundingPass.s.sol` (its own deploy: it never redeploys the game) and
`RecoverFoundingPass.s.sol` (the lost-wallet move: the pass and its Founder Sneaker in one run,
from the deployer key, after asking Yash).
Deploy keys and `chain:export-abis` work as today.

**Tests:** soulbound transfers revert, each design mintable once, one per wallet, roles, laced once,
`mintedBitmap`, the renderer for every design (each of the 1,000 renders, and no two produce the
same SVG), and fuzzing on the design number.

### 10.2 API (`apps/api`)

| Piece | What it does |
|---|---|
| `POST /v1/pass/email-code` | `{ email, turnstileToken }`: emails a 6-digit code through Brevo (§15's rules: hashed, 10 minutes, 5 tries, once a minute) |
| `POST /v1/pass/email-verify` | checks the code and returns a short-lived **email proof** (a signed token, a few hours, so "Get ready" before mint day still works) |
| `POST /v1/pass/mints` 🔒 | `{ designNumber, emailProof, turnstileToken }` with the SIWE access token. Checks the email has no pass, the wallet holds none (chain), and the design is free. Records the mint and queues `mintFoundingPass` in the outbox. A taken design answers `PASS_ALREADY_MINTED` with 3 similar available designs |
| `GET /v1/pass/mints/:mintId` 🔒 | the mint's state; once confirmed: founder number, gold frame, transaction hash (the page polls it for the reveal) |
| `GET /v1/pass/collection` | `mintedBitmap()` (cached a few seconds) plus designs with a mint still queued, the total, the last 10 mints for the live line, and the schedule's phase with its next time |
| The schedule | From config: the waitlist window's start (48 hours long) and the backup opening date (14 days after the open mint starts, D-041). During the window, a mint needs an email that joined the waitlist before it opened |
| Starter-Sneaker gate | `EARLY_ACCESS_REQUIRED` flag; reads `FoundingPass.balanceOf`. Switches off by itself when all 1,000 are minted or the backup date passes |
| Founder Sneakers | A pass holder without one gets one (with the gas drip), even if they own a normal Sneaker. After opening day, everyone else gets today's normal starter Sneaker |
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
  Sneaker. A pass holder gets the Founder Sneaker through the existing minting screen. After the
  first settled walk, a quiet "Your shoe is laced" moment with a haptic.
- A Founder Sneaker's transfer button is disabled, with a plain reason. Normal Sneakers transfer
  as today.

## 11. Build plan

**The build plan lives in [`docs/founding-pass/`](founding-pass/README.md)** (since v5), with one
file per part. Each part is one Claude Code session that ends with a check and a stop for Yash's
go-ahead.

| Part | What | Size |
|---|---|---|
| 0 | Decide: the last open questions, D-041, the docs | S |
| 1a | Art design (**done** 2026-10-08) | L |
| 1b | Art on-chain: the Solidity renderer, the review of all 1,000, the freeze | XL |
| 2 | Contracts: `FoundingPass`, Founder Sneakers in the game, the deploy | L |
| 3 | API: email codes, mints, the waitlist window, the gate, Founder Sneakers, lacing | L |
| 4 | Website: the gallery, the 1,000 pass pages, preview mode | L |
| 5 | Website: "Get ready", the mint, the reveal, sharing | L |
| 6 | App: the gate, the Founder Sneaker, the pass on Profile, laced | M |
| 7 | Help: plain-words guides and a next step everywhere | M |
| 8 | Help chatbot on the website (optional, Yash decides the cost first) | M |
| 9 | Rehearsal: the whole flow, end to end, so nobody gets stuck | M |
| 10 | Launch: preview week, the waitlist window, open mint, opening day | S + calendar |

About 5 weeks of focused work before the preview week, mostly Parts 1b, 4 and 5.

## 12. Metrics (no analytics added)

From our database and the chain: mints per hour on mint day, time to all 1,000, **which passes went
first** (the most-wanted list is a post), which families and rarities went fastest, quiz → mint,
email → verified → minted drop-off, races lost (a design taken first), minted → signed in to the app
→ first walk (laced), gold frames, and sign-ups by `?source=`.

## 13. Open questions for Yash (all answered in Part 0, 2026-10-08, D-041)

1. ~~**Art:**~~ **Decided 2026-10-08:** flat-panel templates drawn on-chain (§4.3), designed by
   Claude in one go (§4.4).
2. ~~**Theme:**~~ **Decided:** colour families, not times of day. The final lists are Part 1a's call.
3. ~~**Names:**~~ **Decided (Part 0):** generated "Family Template Colourway" names, plus
   hand-picked names for the ten Legendaries: ten rare lights in the sky, researched and picked by
   Claude (§3.2, D-041).
4. ~~**Gold frame** at random on about 1 in 10 passes?~~ **Decided (Part 0):** yes.
5. ~~**Mint on the website (A)?**~~ **Decided 2026-10-08:** yes.
6. ~~**Keep the email step, and add Turnstile on the mint button?**~~ **Decided (Part 0):** yes to
   both, and Turnstile guards Send code too (§9).
7. ~~**The match quiz?**~~ **Decided (Part 0):** yes.
8. ~~**Preview week, then mint at a set time?**~~ **Decided 2026-10-08:** yes, with a 48-hour
   waitlist window first, then the open mint (§5.1).
9. ~~**Gate:**~~ **Decided 2026-10-08:** on after judging ends (2026-10-27), and off by itself when
   all 1,000 are minted or on the backup date. **Part 0:** it goes on when the preview week starts.
10. ~~**Timing:**~~ **Decided (Part 0):** the build continues after the Metropolis submission
    (deadline **2026-10-14 09:29 IST**), and the launch lands after judging. Rough dates in §5.1:
    preview week from 2026-11-21, waitlist window from 2026-11-28 20:00 IST.
11. ~~**Is the pass the Sneaker you run in?**~~ **Decided 2026-10-08:** no, two linked NFTs. The
    pass gives a Founder Sneaker in its design, and neither can be sent (§7).
12. ~~**What do non-founders get?**~~ **Decided 2026-10-08:** a free normal Sneaker in today's look,
    from opening day.
13. ~~**Still open for Part 0**~~ **Decided (Part 0):** the backup opening date is **14 days**
    after the open mint starts. Support **may** move a pass to a new wallet after an email check
    (§7). The rough dates are in §5.1.

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
