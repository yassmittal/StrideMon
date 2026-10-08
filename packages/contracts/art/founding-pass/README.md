# Founding Pass art

The art system for the 1,000 Founding Passes
([`docs/founding-pass-brief.md`](../../../../docs/founding-pass-brief.md) §4). Part 1a designed it as
a TypeScript sketch (**look approved by Yash on 2026-10-08**).
[Part 1b](../../../../docs/founding-pass/part-1b-art-on-chain.md) ported the drawing to Solidity:
**`FoundingPassArtRenderer` is now the only implementation of the art.** This folder keeps the
art system as data, the generator that picks and re-rolls the 1,000 designs, and the sheets that
lay out what the renderer draws.

**Status (2026-10-08): done.** The renderer matches the sketch byte for byte, the phone check
passed, and Yash approved all ten contact sheets, so **the 1,000 designs are frozen** (all
below).

## How the pieces fit

```text
art-system/      templates, families, colourways, laces: the art as TypeScript data
generator/       picks the 1,000 designs (seeded), applies the review rounds (re-rolls), checks the rules
solidity/        writes the generated Solidity from the two above
      │
      ▼
src/founding-pass-art/FoundingPassArtData.sol   generated: every template's shapes, the colours, the name words
src/founding-pass-art/FoundingPassDesigns.sol   generated: the design table, 8 bytes per design
src/founding-pass-art/FoundingPassArtTypes.sol  hand-written: the shared enums and structs
src/FoundingPassArtRenderer.sol                 hand-written: the drawing, the card, the names
      │
      ▼  script/RenderPassArt.s.sol (simulation only, never broadcast)
rendered/        every design's gallery card, plus the cards, Sneakers and Sneaker pictures the sheets ask for (gitignored)
      │
      ▼  sheets/ (layout only: it never draws a Sneaker)
previews/        the review sheets, as SVG and PNG
```

The geometry the generator computes once per template (the lace slats and eyelets from the lace
line, the heel tab placed and tilted) goes into the generated data as fixed shapes, so Solidity
needs no trigonometry. Everything about how a Sneaker is drawn (the colours by role, the drawing
order, the clip path, line widths, the card) lives only in the renderer. The generated files say
"never edit by hand": change the art system here and rebuild.

## Rebuild

From the repo root:

```bash
bun packages/contracts/art/founding-pass/build-founding-pass-art.ts
```

It takes about 15 seconds:

1. picks the 1,000 designs, applies every review round in `generator/review-rounds.ts`, checks the
   rules (it throws if one breaks) and prints the counts
2. writes `previews/designs.json` and the two generated Solidity files (formatted with `forge fmt`)
3. runs `forge script script/RenderPassArt.s.sol:RenderPassArt`: the Solidity renderer writes all
   1,000 gallery cards to `rendered/designs/`, and the extra cards and Sneakers the sheets ask for
   (listed in `rendered/render-requests.json`) to `rendered/cards/` and `rendered/sneakers/`.
   `SneakerArtRenderer` draws the Founder Sneakers' whole pictures to `rendered/sneaker-pictures/`,
   reading a stand-in pass (`PreviewFoundingPass`) so any record, a gold frame included, can be
   shown
4. lays those out as the sheets in `previews/`, and converts them to PNG

It needs Foundry 1.8.3 and `rsvg-convert` (`brew install librsvg`). The PNGs' text is IBM Plex
Mono, taken from the app's `node_modules` through a temporary fontconfig file, or a system
monospace without it. After a rebuild, run `forge test` from `packages/contracts`: it checks every
design in the new table.

`rendered/designs/` holds the frozen designs' cards: Part 4 exports them to the website.

The folder is outside Biome's checks (`packages/contracts` is excluded), but it is formatted and
linted with the repo's Biome config and typechecks under `tsconfig.base.json` (strict, with
ES2024's `Map.groupBy`).

## The renderer

`FoundingPassArtRenderer` is one contract of about 66 KB (Monad allows 128 KB), so nothing had to
split. The generated libraries are compiled into it. It implements `IFoundingPassArtRenderer`
(in `FoundingPass.sol`), so `FoundingPass` can swap it like the Sneaker's (D-030).

| Function | Returns |
|---|---|
| `renderDesignPreviewSvg(designNumber)` | The gallery's card: available and unlaced, no founder number, no frame |
| `renderPassSvg(tokenId, passRecord)` | A minted pass: `FOUNDER 042`, the lace slats once laced, the gold frame if it rolled one |
| `renderSneakerMarkup(layers, isLaced, clipPathId)` | The shoe alone in its 1000 × 600 space, for any valid layers. The Founder Sneaker's picture (D-042) places it on the dark panel |
| `readSneakerOutline(templateIndex)` | The silhouette and heel tab's path data and the silhouette's top: the Founder Sneaker draws a light rim round the shoe with them, and centres it |
| `readDesignLayers`, `readDesignName`, `readDesignRarity` | One design's row from the table, its name, its rarity |
| `readDesignTraits(designNumber)` | The layers in words (template, family, colourway, each option slot and value, laces, rarity), for the pass's attributes |

A card is 2.4 to 3.9 KB of SVG and costs at most about 100,000 gas to draw. Monad runs an
`eth_call` of up to 8.1M gas in its fast pool, and nodes allow 30M by default.
`test/FoundingPassArtRenderer.t.sol` checks that all 1,000 render, that no two cards, drawings
or names are the same, the four card states, the Legendaries' names, the gas, the size, and bad
input (design numbers and layers outside the data).

### The port check (2026-10-08)

Before the TypeScript renderers were deleted, a one-off script drew the same files with the
sketch and with the Solidity renderer and compared them: **5,800 files, all byte-identical.**
They were all 1,000 gallery cards, 2,000 minted cards (all four states, founder numbers 1 to
1,000, every design laced once) and 2,800 Sneakers (every template × family × colourway, both
stages, with every option value and lace colour). The ten hand-picked Legendary names went into
the sketch first (`legendaryName` on each template), so they matched too. With the sketch's
renderers gone, the comparison can't run again, and the Solidity output is the reference.

## Review and re-rolls

**Done (2026-10-08):** Yash approved all ten sheets as first drawn, so no design was re-rolled
and `REVIEW_ROUNDS` is empty. This is how a review round worked:

Yash reviews the ten contact sheets (`previews/3-designs-*.png`) and lists the numbers he wants
drawn again. Each list becomes a round in `generator/review-rounds.ts`:

```ts
export const REVIEW_ROUNDS: readonly ReviewRound[] = [
  { markedOn: '2026-10-09', designNumbers: [12, 345, 678] },
]
```

Rebuild, and the sheets say how many designs the latest round re-rolled, with `NEW IN ROUND n`
under each one. Repeat until he approves all ten sheets.

A re-roll is seeded by the round and the design number, so the same rounds always give the same
collection. It keeps the design's number, template and rarity, so the template and rarity counts
and the blocks of 100 (one Legendary each, the metals spread out) all hold. It picks, in order:

1. its own family in a colourway that template and family don't use yet, so the name stays unique
2. for an everyday design, when its own family has no colourway left (most template-and-family
   pairs use 8 or 9 of the 10), another everyday family that neither neighbour has, the smallest
   family first, so the family totals stay within a few of each other
3. its own family and colourway with new options

It never brings back a look Yash marked before, and a colour he marked only comes back with other
options. The options and laces follow the generator's own rules: the least used combination that
stays distinct from the template's other designs (4 of 6 visible layers at most).

**The freeze (2026-10-08):** `DESIGNS_FROZEN_ON` in `generator/review-rounds.ts` is
`2026-10-08`. `FoundingPassDesigns.sol` and the sheets say "Frozen on 2026-10-08", and the build
refuses any round marked after that day. Freezing changed no design: `designs.json`, the art data
and every row of the table are byte for byte what the approved sheets show.

## The phone check (passed 2026-10-08)

D-030's parity rule: `react-native-svg` must draw the cards exactly like a browser. A temporary
dev-only screen showed 19 cards drawn by the Solidity renderer with `SvgXml`, at full width and at
the gallery's half width: every template, every family, the four states, and the Runner's Cage heel
(its window needs SVG's nonzero fill rule). Yash compared them on the Android phone with the same
cards as `<img>` in a browser, and they matched. The screen was deleted afterwards.

## Previews

`previews/` is generated output, all of it drawn by the Solidity renderer.

| File | Shows |
|---|---|
| `1-templates-in-one-family` | Every template in Ember Day, unlaced (as minted) beside laced (after the first walk) |
| `2-one-template-in-every-family` | The Runner in all 14 families |
| `3-designs-0001-0100` … `3-designs-0901-1000` | **The ten contact sheets for the review:** each block of 100 as the gallery shows it |
| `4-pass-card-states` | #0137 as available, minted (Founder 042), laced, and with the gold frame |
| `pass-0137-*.svg` | The same four cards as single SVGs, exactly as a token's image would be |
| `5-colourways` | The Runner in Ocean through all 10 colourways |
| `6-options` | Every option value of every template, one slot changed at a time |
| `7-legendaries` | The 10 Legendaries, with their hand-picked names |
| `8-founder-sneakers` | The Founder Sneaker (D-042) as `SneakerNft.imageSvg` draws it: one design per template in a dark colourway or a metal family, as minted and laced (some with a gold-framed pass), then a normal Sneaker for comparison, #0137 in three states and a Legendary |
| `founder-sneaker-0137-minted`, `-laced` | #0137's Founder Sneaker alone, at a phone's width, as the app's hero panel shows it |
| `x-founding-pass-teaser` | The first X post's image (1080 × 1350, `social/posts/2026-10-10-founding-pass-first-look.md`): six silhouettes, no pass numbers |
| `designs.json` | All 1,000 designs: number, layers, name, rarity. Frozen on 2026-10-08 |

## The system

### The frame: what every pass shares

- A side view, toe to the right, in a **1000 × 600 Sneaker space** with the ground at y = 520.
  Whole-number coordinates only, so the generated data stores them as they are.
- **Ink lines** (`#141515`, the app's dark panel): an 18-unit outline round the silhouette and
  7-unit lines between panels.
- A **cream midsole** (`#F5F0E3`), whatever the family. Lace slats are cream too unless the
  design's lace colour says otherwise.
- **StrideMon's heel tab**: a lime (`#C1FF00`) pull tab with an ink chevron, sticking out at the
  top of the heel. It sits against the card's background, not on the shoe, so it shows in every
  family, the Lime one included. It's our own mark, not STEPN's tag.
- Solid fills only: paths, one `<clipPath>` per Sneaker, circles for the eyelets. No gradients,
  filters or CSS (D-030).

### How a Sneaker is drawn

As `FoundingPassArtRenderer` draws it, back to front: the heel tab, then the panels inside the silhouette's clip path (base upper,
`quarter` options, the framing panels (heel counter, eyestay, toe, collar), `top` options, the
sole, `sole` options, and Gold and Chrome's sheen), then the outline, then the eyelets or lace
slats on top. Because panels are clipped, each one only needs its inner edges right and can
overshoot the outline (the prototype's finding).

Each panel has a **role**. The colourway maps every role to one of the family's five shades, and
`midsole` and `ink` are fixed. The roles are upper, toe, overlay, heel, eyestay, collar,
tongue, trim (upper details), sole accent (sole details), outsole, midsole and ink.

### Templates (10)

Each is its own silhouette with its own panels and three option slots. Every slot has at least two
common values, and each template has uncommon and rare details you can see. (U) is uncommon
and (R) rare.

| Template | What it is | Option slots |
|---|---|---|
| **Runner** | The everyday trainer: a medium sole, a padded collar and a rounded toe. | Side: Wedge, Zigzag, Plain, Chevron (U)<br>Heel: Counter, Clip, Cage (R)<br>Sole: Plain, Flash, Pod (U) |
| **Racer** | A race-day shoe: a tall rocker sole with a plate, a bevelled heel, a pointed toe. | Upper: Streaks, Block, Plain, Shard (U)<br>Midsole: Carbon, Tinted, Two-tone (R)<br>Heel: Plain, Kick, Fin (U) |
| **Trail** | Built for dirt: a lugged outsole, a rubber toe bumper and a tough upper. | Overlay: Ridge, Peaks, Plain, Slope (U)<br>Guard: Toe, Heel, Rand (R)<br>Tread: Mono, Stripe, Tinted (U) |
| **Court** | A clean, low court classic on a tall flat cupsole. | Side: Saddle, Triangle, Plain, Chevron (U)<br>Toe: Smooth, Cap, Perforated (R)<br>Heel: Plain, Tab, Spoiler (U) |
| **Hoop** | A basketball high-top: a padded ankle collar, a long lace run, a thick cupsole. | Side: Bolt, Panel, Plain, Wedge (U)<br>Ankle: Plain, Pad, Strap (R)<br>Collar: Plain, Tipped, Stripe (U) |
| **Chunky** | The "dad shoe": a tall layered midsole, a bulky upper, overlays on overlays. | Layers: Mudguard, Waves, Plain, Shard (U)<br>Midsole: Stacked, Solid, Striped (R)<br>Heel: Plain, Cap, Pod (U) |
| **Sock** | A knit sock runner: a tall stretch cuff and no separate tongue. | Cuff: Plain, Band, Tipped (U)<br>Cage: Wrap, Zigzag, Plain, Chevron (U)<br>Sole: Flat, Stripe, Pod (R) |
| **Skate** | A skate shoe: a puffy collar, a fat tongue and a flat sole that wraps the toe. | Side: Shard, Wedge, Plain, Block (U)<br>Foxing: Plain, Stripe, Double (R)<br>Heel: Plain, Patch, Counter (U) |
| **Spike** | A track spike: low and pointed, with a spike plate under the forefoot. | Side: Dart, Streaks, Plain, Chevron (U)<br>Support: None, Counter, Strap (R)<br>Plate: Matched, Contrast, Flash (U) |
| **Hiker** | A mid hiking boot: an ankle shaft, deep lugs and a rubber toe bumper. | Shaft: Zigzag, Panel, Plain, Peaks (U)<br>Rand: None, Heel, Wrap (R)<br>Collar: Plain, Tipped, Stripe (U) |

The side marks are wedges, zigzags, chevrons, peaks, darts and a bolt: straight-edged shapes, and
never three parallel bars, a swoosh-like curve, a wavy side stripe or a letter. The first drafts
had a "W" and a "V" cage, and the V was too close to a real brand's logo, so both were replaced.

### Colour families (14)

Five shades each, light to dark. Each ramp shifts its hue a little as it darkens, and the darkest
shade stays well clear of the ink, so panel lines still show on it.

| Family | Rarity | Shades, light to dark |
|---|---|---|
| Ember | Common | `#FFE6CF` `#FFB27A` `#FF6F2E` `#C9431A` `#6E2310` |
| Cherry | Common | `#FFDADF` `#FF8A96` `#E8283F` `#A3122A` `#5A0A1A` |
| Rose | Common | `#FFE0F0` `#FFA3D1` `#F2559F` `#B52A72` `#61163F` |
| Plum | Common | `#EDE0FF` `#C3A1FF` `#8C55F0` `#5C2DB0` `#2F175F` |
| Cobalt | Common | `#DFE4FF` `#9AA8FF` `#3A50FF` `#1E2DB8` `#111A63` |
| Ocean | Common | `#D9F0FF` `#8FD0FF` `#2E9BEA` `#1A62A8` `#0F3260` |
| Lagoon | Common | `#D5FAF4` `#7FE6D6` `#19B5A5` `#0E7A72` `#08403F` |
| Jade | Common | `#DDF7E3` `#8EE0A6` `#2FB863` `#1A7A42` `#0D4124` |
| Moss | Common | `#EEF0D8` `#C9CF94` `#8E9A4A` `#5C6630` `#333A1A` |
| Lime | Common | `#F1FFC4` `#C1FF00` `#8FCC00` `#557A00` `#2E4206` |
| Clay | Common | `#F5E8D8` `#DDBB94` `#B3824F` `#7A5130` `#45291A` |
| Gold | Rare | `#FFE98A` `#FFC928` `#DE9E00` `#A26A00` `#5C3C00` |
| Chrome | Rare | `#E9EEF5` `#B9C5D6` `#8391A8` `#4E596D` `#262B36` |
| Prism | Legendary | `#FFE45C` `#5CF0C0` `#FF6AB8` `#7C4DFF` `#24196E` |

- **Gold and Chrome** add one flat sheen shard on the toe and one on the heel. They never take the
  pale Dawn or Frost colourways, where Gold read as plain yellow and Chrome as plain white (the
  prototype's "gold vanished on a light background").
- **Prism** has five hues instead of five shades, still light to dark, so every colourway keeps its
  shape. It's the Legendary family: one per template, ten in all.

### Colourways (10)

A colourway maps each role to a shade (0 lightest, 4 darkest). They're designed, not shuffled:
fully random shades looked messy in the prototype, and swapping neighbouring shades made designs
that looked like copies. Every colourway keeps the collar and outsole dark and gives the big panels
clear steps. The colourway is also the last word of the name.

| Colourway | Upper | Toe | Overlay | Heel | Eyestay | Collar | Tongue | Trim | Sole accent | Outsole |
|---|---|---|---|---|---|---|---|---|---|---|
| Dawn | 0 | 1 | 2 | 1 | 2 | 3 | 1 | 3 | 2 | 3 |
| Day | 1 | 0 | 3 | 3 | 4 | 4 | 0 | 2 | 2 | 4 |
| Flare | 2 | 1 | 4 | 4 | 4 | 4 | 1 | 0 | 2 | 4 |
| Dusk | 3 | 2 | 1 | 4 | 1 | 4 | 2 | 0 | 1 | 4 |
| Night | 4 | 3 | 2 | 3 | 2 | 3 | 2 | 1 | 2 | 3 |
| Frost | 0 | 0 | 2 | 2 | 3 | 3 | 0 | 4 | 2 | 3 |
| Eclipse | 0 | 4 | 4 | 4 | 4 | 4 | 0 | 2 | 2 | 4 |
| Haze | 2 | 1 | 0 | 1 | 3 | 4 | 0 | 3 | 1 | 4 |
| Storm | 2 | 4 | 1 | 4 | 3 | 4 | 1 | 0 | 2 | 4 |
| Drift | 1 | 4 | 2 | 0 | 4 | 3 | 0 | 3 | 2 | 4 |

### Laces: Unlaced and Laced

- **Unlaced** (at mint): ink eyelets on the eyestay.
- **Laced** (after the holder's first settled walk): chunky slats, 22 × 60 units, at right angles
  to the lace line, reaching into the shoe and 12 units past its top edge. The generator computes
  them from each template's lace line, and the generated data stores them as fixed shapes.
- **Lace colour** is a layer of its own: Cream, Ink, Tonal (the family shade two steps from the
  eyestay's) or Lime (uncommon). It only shows once a pass is laced, which makes lacing a small
  reveal too. Ink laces only go on a light or mid eyestay (black slats on a dark one hid the
  lacing), Prism always gets cream, and Lime never gets lime.

### The pass card

Square (1000 × 1000) on the site's off-white `#F0F1FA`, with Lusion's "+" corner marks and two
hairlines. The shoe sits in the middle, centred on its own height, on a flat shadow. Type is
IBM Plex Mono, like the Sneaker card. In wallets and explorers it falls back to any monospace, and
the longest name (21 characters) still fits beside `FOUNDER 042`.

| State | Adds |
|---|---|
| Available (the gallery) | `FOUNDING PASS`, `#0137`, the name, and `RARE · 1 OF 1` |
| Minted | `FOUNDER 042`, the mint order |
| Laced | the lace slats, and a lime `LACED` pill with ink text (lime only behind black text on light) |
| Gold frame | a gold band at the edge and a thin gold line inside it, in place of the corner marks |

A Legendary's card shows its hand-picked name ("Earthshine") where the others show
"Family Template Colourway" (D-041).

## The generator

`generator/` picks the 1,000 with a seeded random source (`GENERATOR_SEED`), in about 0.1 s:

- **Counts:** 100 per template. Each template has 1 Prism, 3 Gold, 3 Chrome and 93 everyday
  designs. That's 84 or 85 per everyday family, 30 Gold, 30 Chrome and 10 Prism. Each colourway is
  used about 100 times.
- **Unique names:** no two designs share a template, family *and* colourway, so the name
  "Family Template Colourway" (for example "Ember Runner Dusk") never repeats. The ten Legendaries
  take their template's hand-picked name instead (`legendaryName` in each template, D-041), so a
  re-roll never separates a name from its shoe.
- **No near-copies:** no two designs share more than 4 of the 6 layers you can see on an unlaced
  pass (template, family, colourway, three option slots). Laces don't count, since they don't
  show until a pass is laced. The generator lists every allowed option combination and takes the
  least used one that keeps the rule. If a template reaches a dead end, it starts that template
  again.
- **Rarity:** a pass is as rare as its rarest layer. **650 Common, 250 Uncommon, 90 Rare, 10
  Legendary.** Uncommon comes from one uncommon detail, or lime laces for about a fifth of them
  (since laces don't show in the gallery, most carry a detail you can see). Rare means Gold, Chrome,
  or the template's rare detail (3 per template). Legendary means Prism.
- **Numbering:** each block of 100 (one review sheet) gets ten of each template, one Legendary
  (template *n*'s goes to block *n*) and six Gold or Chrome. No two neighbours share a template or
  a family, and the build fails if they do.

Measured on all 1,000 (Part 1a, and the same from the renderer): a Sneaker alone is 1.6 to 2.8 KB
of SVG (2.1 KB on average). A pass card is 2.4 to 3.6 KB (2.9 KB on average), and up to 3.9 KB
laced with a gold frame. The 1,000 available cards come to about 2.8 MB. All 1,000 drawings are
different, and `forge test` checks it on every rebuild.

## Where this differs from the brief's starting shape (§3.2)

These were all Part 1a's call. Once the look is approved, they can be folded into the brief.

- **Colourways are 10 designed maps, not a seed that shuffles shades within a tier.** The shuffle
  made neighbours that looked like copies, and the designed set reads as clearly different
  colourways.
- **Names are "Family Template Colourway"**, unique by construction, with no number needed.
- **The Legendaries are the Prism family**, one per template, not hand-drawn one-off templates.
- **The distinctness rule counts only visible layers:** 4 of 6, where the brief's example was 5 of 8.
- **There are 10 templates and 14 families** (3 of them rare), within the brief's 8–12 and 10–14.

## Left open

1. **The review of all 1,000** (Part 1b): closed. Yash approved all ten sheets, and the designs
   were frozen on 2026-10-08.
2. **A one-off Legendary template** drawn by hand is still possible later. It would be an eleventh
   template used once, and it would mean reopening the freeze.
3. **"Gold" is both a family and the frame.** A Gold pass with a gold frame is a nice double, but if
   the shared word confuses, the family can take another name.
4. **The Chunky Legendary's name** (#0542): closed. It was **"Steve"**, the playful name in the
   set, and it read as a joke beside the other nine, so Yash swapped it for **"Nacreous"**
   (mother-of-pearl clouds) on 2026-10-08, after the freeze (D-041). The name is art data
   (`legendaryName` in `art-system/templates/chunky.ts`), not a row of the frozen table, so the
   swap changed the name only, never a design: the table's bytes are the same.
5. **`previews/` is generated output.** Keep it in the repo for review, or ignore it: Yash's call.
   `rendered/` is ignored (`.gitignore`).
