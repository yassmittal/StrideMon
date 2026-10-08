# Founding Pass art (Part 1a)

The art system for the 1,000 Founding Passes, as a TypeScript sketch with previews
([`docs/founding-pass-brief.md`](../../../../docs/founding-pass-brief.md) §4.4). **Yash approved the
look on 2026-10-08.** Next,
[Part 1b](../../../../docs/founding-pass/part-1b-art-on-chain.md) ports the renderer to Solidity
(`FoundingPassArtRenderer`), and from then on the Solidity renderer is the only implementation of
the art. The generator stays in TypeScript: it writes the design table that becomes
`FoundingPassDesigns.sol`. The Founder Sneaker (Part 2) reuses the same shoe drawing.

## Rebuild

From the repo root:

```bash
bun packages/contracts/art/founding-pass/build-founding-pass-art.ts
```

It picks the 1,000 designs, checks them against the rules (it throws if one breaks), prints the
counts, and writes `previews/`. It takes about 3 seconds and needs no new dependencies. The PNGs need
`rsvg-convert` (`brew install librsvg`). Their text is IBM Plex Mono, taken from the app's
`node_modules` through a temporary fontconfig file. Without it, they fall back to a system monospace.

The folder is outside Biome's checks (`packages/contracts` is excluded), but it was formatted and
linted with the repo's Biome config and typechecks under `tsconfig.base.json` (strict).

## Previews

`previews/` is generated output.

| File | Shows |
|---|---|
| `1-templates-in-one-family` | Every template in Ember Day, unlaced (as minted) beside laced (after the first walk) |
| `2-one-template-in-every-family` | The Runner in all 14 families |
| `3-designs-0001-0100` | Designs #0001 to #0100, as the generator picks them and the gallery shows them |
| `4-pass-card-states` | #0137 as available, minted (Founder 042), laced, and with the gold frame |
| `pass-0137-*.svg` | The same four cards as single SVGs, exactly as a token's image would be |
| `5-colourways` | The Runner in Ocean through all 10 colourways |
| `6-options` | Every option value of every template, one slot changed at a time |
| `7-legendaries` | The 10 Legendaries |
| `x-founding-pass-teaser` | The first X post's image (1080 × 1350, `social/posts/2026-10-10-founding-pass-first-look.md`): six silhouettes, no pass numbers |
| `designs.json` | All 1,000 designs: number, layers, name, rarity. A draft: Part 1b re-rolls and freezes it |

## The system

### The frame: what every pass shares

- A side view, toe to the right, in a **1000 × 600 Sneaker space** with the ground at y = 520.
  Whole-number coordinates only, so the port can store them as they are.
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

Back to front: the heel tab, then the panels inside the silhouette's clip path (base upper,
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
  to the lace line, reaching into the shoe and 12 units past its top edge. They're computed from each
  template's lace line, so the port stores them as constants per template.
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

## The generator

`generator/` picks the 1,000 with a seeded random source (`GENERATOR_SEED`), in about 0.1 s:

- **Counts:** 100 per template. Each template has 1 Prism, 3 Gold, 3 Chrome and 93 everyday
  designs. That's 84 or 85 per everyday family, 30 Gold, 30 Chrome and 10 Prism. Each colourway is
  used about 100 times.
- **Unique names:** no two designs share a template, family *and* colourway, so the name
  "Family Template Colourway" (for example "Ember Runner Dusk") never repeats.
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

Measured on all 1,000: a Sneaker alone is 1.6 to 2.8 KB of SVG (2.1 KB on average). A pass card
is 2.4 to 3.6 KB (2.9 KB on average), and up to 3.9 KB laced with a gold frame. The 1,000 available
cards come to about 2.8 MB. All 1,000 drawings are different.

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

1. **`react-native-svg` parity is unchecked.** The cards draw the same in a browser (Brave, as
   `<img>`, at 300 and 170 px) as in these PNGs. The app check needs the phone, so it moves to
   Part 1b: the elements used (path, circle, ellipse, rect, text, one clip path, a translate/scale
   transform, opacity attributes, nonzero windings for the cage window) are all ones
   `react-native-svg` 15 supports.
2. **Hand-picked names for the 10 Legendaries** (§13, question 3). They're generated for now.
3. **A one-off Legendary template** drawn by hand is still possible later. It would be an eleventh
   template used once.
4. **The review of all 1,000** happens in Part 1b, on the Solidity renderer's own output, with
   re-rolls of single designs. `designs.json` here is a draft.
5. **"Gold" is both a family and the frame.** A Gold pass with a gold frame is a nice double, but if
   the shared word confuses, the family can take another name.
6. **`previews/` is generated output.** Keep it in the repo for review, or ignore it: Yash's call.
