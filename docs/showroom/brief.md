# The StrideMon Showroom: brief

**Status:** decided (D-063, 2026-10-22): the store from the Showroom film, live. Part 1 (the
store) is done (2026-10-22); its rendering findings are D-064. Part 2 (the arrival and the walk) is
done (2026-10-22, D-065). Part 3 (look closer and find) is done (2026-10-22, D-066). Part 4 is next. The build order is in [`README.md`](README.md); the research is in
[`references.md`](references.md).

The first plan (a stone nave, ten chapels, an apse, cloisonné 3D Sneakers and a vault of 1,000
casts) is **replaced** by this one. Its ideas are not carried over.

## 1. The idea

A premium 3D store on the web at `https://showroom.stridemon.xyz`. A Founding Pass holder, or
anyone coming from X, walks into the StrideMon store and feels like they're in a high-end sneaker
boutique after hours.

It is **the store from the Showroom film** (`launch-video/src/showroom/`, rendered as
`launch-video/out/stridemon-showroom-9x16.mp4`): the same building, walls, light and mood. On the
web it's interactive, and a little richer than the film because it renders live (§6.3).

**The Sneakers stay flat.** Each one is its frozen laced art, shown the way the film shows it: a
cut-out on a lit shelf, or a print in a lightbox. Never redrawn, never recoloured
(`DESIGNS_FROZEN_ON`). **The building is the premium part, not the Sneakers.**

It **only shows**. No wallet, no email, no mint. Every action is a link to `stridemon.xyz`, where
those flows already work (D-044, D-045).

## 2. Why build it, and when

- **Something worth sharing.** The waitlist has to grow to 10,000 before the window
  (2026-11-28 14:30 UTC, `waitlist-growth-plan.md`). A grid isn't a post; a night-time store whose
  lights come on as you arrive is. The film already shows the place; the showroom lets people walk
  into it.
- **Picking a favourite.** Before the window, people choose the design they'll mint. Seeing it
  lit on a stand in a store makes the choice feel like owning something.
- **Every visit ends on `stridemon.xyz`:** a pass page, the waitlist or the app.

**When:** live a good while before the window, so it can carry the waitlist push. Proposed:
by **Mon 2026-11-09** (§10): before the Show HN (11-10 or 11-11), in the week DeltaV's
amplification unlocks, and three weeks before the window (`waitlist-growth-plan.md` §5). That's
five build sessions after Part 0.

## 3. The store

One world, in metres, as the film's `ShowroomWorld.tsx` draws it (its header has the axes): the
shop front is the plane z = 0, the street is z > 0, the store runs back to z = −10, x runs from −5
to 5, and the floor is y = 0. Part 1 ports it as it is; later parts only add to it.

```text
                         back wall (z = −10)
   ┌──────────────────────────────────────────────────────┐
   │ LEGENDARY    ┃ FOUNDING PASS wall: lit words,        │
   │ poster #0020 ┃ lightbox (#0049 #0542 #0029), amber   │
   │ table, 2 chairs  LED strip; black counter + screen   │
   │                                                      │
   │ HERO lightbox #0137                 SNEAKERS niche   │
   │ tagline panel        (open floor,   9 × 5 on shelves │
   │ amber LED cove        4 × 4 down-   white counter,   │
   │                       lights)       stand #0868      │
   │ RARE niche                                           │
   │ 4 × 5 Gold and Chrome                                │
   └════════════════ 10 m of glass, fascia ═══════════════┘ z = 0
        pavement · kerb · wet-dark road · sodium lamp · neighbours
```

| Where | What's there (the film's numbers) |
|---|---|
| **The street** | A night street on a background of `#05060A`, fog (`#07080C`, 14 to 46 m). Paving, a kerb, a wet-dark road. One warm sodium street lamp (`#FFB36B`). Dim neighbour shop fronts, each with a small lit sign of plain coloured blocks and **no words or brands** |
| **The shop front** | 10 m of glass with thin black mullions. A black fascia carrying the lit white **STRIDEMON** letters with the line-Sneaker mark and a soft glow. A blade sign, both faces lit: "STRIDEMON / FOUNDING PASS". A poster in the window (#0542) |
| **The room** | 10 × 10 m, 3.2 m ceiling. A warm grey polished floor (`#8E8A84`, low roughness) that reflects the light. White walls (`#E6E6EA`) with skirting. A 4 × 4 grid of round downlights, each with a small glow |
| **Left wall** | The big portrait **lightbox**: #0137 Rose Hiker Night on the violet gradient `#2A1A6E → #5B3FE0 → #B48CFF`. The tagline panel ("Walk. Earn. Upgrade."). A warm amber LED cove (`#FFAE45`) over both |
| **Front left** | The **"Rare" niche**: dark (`#121318`), a 4 × 5 grid of Gold and Chrome Rares on cool LED shelf strips (`#DCE3FF`), a white ledge below |
| **Back-left corner** | The **Legendary poster** (#0020 Earthshine) over a dark table on a chrome pedestal, with two black chairs |
| **Back wall** | A dark panel, the lit words "Founding Pass", a lightbox with three Sneakers (#0049, #0542, #0029) and a vertical amber LED strip. In front, a black counter with an upright screen |
| **Right wall** | The **"Sneakers" niche**: 9 × 5 Sneakers on cool-lit shelves with a soft violet glow (`#6E6BFF`). Below it, a white counter with **the stand** holding one Sneaker (#0868) and its little card |

**The stand is where any of the 1,000 can go** (§4, Find). The walls keep the film's selection
(§5.4), so the place stays the same place.

## 4. The visit

| Moment | What happens | Controls |
|---|---|---|
| **Arrive** | A short loader draws the line-Sneaker mark as the files load (real progress, never a timer). Then the street at night: the store is dark, and its lights come on, the film's `darkFront` → `litFront` moment, softly and in a few seconds (nothing flickers). "Step inside" walks you through the glass | "Step inside", Enter |
| **Walk** | A guided walk with five stops: **1** the lightbox (#0137), **2** the Rare wall, **3** the Legendary corner, **4** the Founding Pass wall, **5** the Sneaker wall and the stand. Moves are slow and smooth, with weight, and nothing overshoots | Scroll, swipe up and down, ↑ ↓, the arrows, the dots |
| **Look around** | At a stop, dragging turns the view a little (about 20° side to side, 8° up and down), damped. On a laptop the pointer does a smaller version without a press | Drag, the pointer |
| **Look closer** | Tap any Sneaker you can see, on a shelf or in a lightbox: the camera comes to it, and a quiet card opens (§6.4): number, name, rarity, minted state, one button to its page on `stridemon.xyz`. Its neighbours on the same wall are one tap away | Tap, ← → for neighbours, Esc or "Back" |
| **Find** | "Find a Sneaker": by number or name, or "Surprise me". The chosen Sneaker fades onto the counter's **stand**, its little card redraws, and the camera walks you there with the card open | The Find pill, `/` |
| **Leave** | "Get your Founding Pass" and "Join the waitlist" are always on screen and link to `stridemon.xyz`. The card's button goes to the design's page, `stridemon.xyz/pass/137` (D-066) | |

**Where you are, always.** A small line says where you are and what to do next ("2 of 5 · The
Rare wall · Swipe for the Legendary corner · Tap a Sneaker to look closer"), and every view links
`stridemon.xyz/help`.

**No free roaming.** A guided walk can't get anyone lost, and it works the same with a thumb.
The camera stays level: the film's rolled, dutch angles were for its fast edit, not for walking.

**Reduced motion** (`prefers-reduced-motion`): cut with a short fade instead of flying, the lights
come on without the build-up, no look-around drift, still grain.

**Deep links:** `showroom.stridemon.xyz/?pass=0137` opens straight on #0137 on the stand, lit, the
card open; the street is skipped (§10).

## 5. Flat Sneakers in a 3D store

### 5.1 What the art is

Every design's laced Sneaker (`website/public/pass-art/laced/NNNN.svg`, exported from
`FoundingPassArtRenderer`) is, checked on all 1,000 on 2026-10-22: a 1000 × 600 space with the toe
to the right, only flat-filled straight-edged polygons, no text, no gradients. About 2.6 KB each,
3.9 MB for all 1,000. It rasterises the same in every browser.

### 5.2 How a Sneaker is shown

Exactly as the film does, in two ways:

- **A cut-out:** the drawing's transparent picture on a plane, standing on a lit shelf or on the
  stand (the film's `SneakerCutout`).
- **A print:** the drawing painted into a lightbox's or a poster's picture (the film's
  `textures.ts`: the hero lightbox, the Legendary poster, the Founding Pass lightbox, the counter
  screen, the window poster).

**The colours never change.** Sneakers and prints are unlit (`meshBasicMaterial`,
`toneMapped={false}`, at a brightness of 1 when the store is lit), so a Sneaker looks the same as its
card on `stridemon.xyz/pass`. They take no fog, no bloom (§6.3) and no tint. Part 1 checks this side
by side.

**Tone mapping happens in the materials, never in the composer.** Checked in three 0.186's
source (2026-10-22): a material is tone-mapped only when it renders straight to the screen
(`WebGLPrograms.js`), so once an effect composer runs (bloom, AO), every `toneMapped` flag is
ignored and the only tone mapping left is the composer's own pass, over the whole picture,
Sneakers included. No curve is harmless there: even Khronos PBR Neutral subtracts up to 0.04 from
every channel and brings white down to about 0.87 (about 240/255 on screen), so a midsole would go
grey and every colour a little darker. So:

- The **lit architecture** (walls, floor, ceiling, counters, street) applies the film's tone
  mapping, ACES Filmic, the React Three Fiber default the film renders with, **inside its own
  shader** (a shader-chunk patch switched on by a define, `showroom/src/store/tone-mapping.ts`, so
  drei's reflector gets it too). That keeps the film's look and stays at or under 1.
- **Sneakers and prints** are never tone-mapped, as in the film.
- **Lit things** (downlights, the amber coves, the fascia letters, the lit words) stay above 1, so
  they're the only things the bloom picks up. The shelves' LED strips stay at 1, so no bloom spills
  onto the Sneakers just above them (D-064).
- **Glows never cover a Sneaker or a print.** The film's additive glow sprites draw first and the
  Sneakers and prints after, over them (D-064).
- **No CSS grade on the canvas.** The film's `contrast`/`saturate`/`brightness` filters would change
  the Sneakers; the dark shot's brightness is folded into the `dark` light levels.
- The composer runs **no tone-mapping pass**: only the effects and the final sRGB output. The Low
  tier, with no composer, uses the same patched materials, so every tier shows the same colours.

Part 1's colour check proves it.

### 5.3 Where the pictures come from

The showroom copies the laced SVGs (all 1,000) at export time and **rasterises them in the browser**,
on a canvas, at the size the device's tier needs (§7.6), as the film does from its PNGs. One source,
any size, a tiny download, and no second copy of the art to drift.

- **The walls:** each niche's Sneakers are drawn into **one picture per wall** (an atlas), so a
  wall is one material and a handful of draw calls. 256 px per Sneaker on the low tier, 512 on
  the high one.
- **Look closer and the stand:** the one Sneaker you're looking at gets its own sharp picture
  (1,024 px), swapped in as the camera arrives and released when you leave.
- **The prints:** the film's canvas textures, at full size on the high tier and half size on the
  others.

### 5.4 Which Sneakers are where

Taken from the film's `sneakers.ts`, numbers copied by hand:

| Where | Sneakers |
|---|---|
| The lightbox | #0137 Rose Hiker Night |
| The Rare niche | 20 Gold and Chrome Rares: 52, 93, 159, 145, 184, 220, 223, 279, 293, 282, 306, 337, 372, 351, 394, 363, 419, 475, 441, 483 |
| The Legendary poster | #0020 Earthshine |
| The Founding Pass lightbox | #0049, #0542, #0029 |
| The counter's screen | #0137, then the latest mint once minting starts (§10) |
| The Sneakers niche | The first 45 of the Sneaker drop film's sequence (`SEQUENCE_DESIGN_NUMBERS`), so light and dark alternate: 137, 129, 868, 429, 775, 291, 33, 382, 675, 361, 726, 941, 224, 211, 289, 892, 806, 109, 150, 132, 611, 97, 344, 810, 327, 894, 676, 388, 918, 600, 751, 717, 753, 223, 337, 888, 353, 135, 750, 220, 592, 590, 184, 574, 862 |
| The stand | #0868 Ember Court Night, until Find or a deep link puts another there |
| The window poster | #0542 |

That's 65 different designs in the store (the film's `SHOWROOM_DESIGN_NUMBERS`), plus any one on
the stand.

## 6. Art direction

### 6.1 The film is the look

The film's numbers are the starting point and stay unless Yash approves a change: its sizes,
colours, materials, light positions and intensities, glow sprites and textures. Fonts are Satoshi
and IBM Plex Mono, with the theme's highlight colour (lime `#C1FF00`, only ever on dark). **Lit
things glow** (signs, lightboxes, LED strips, downlights: unlit materials at full colour with an
additive glow in front), and **everything else is lit softly** by a few lights.

Principles from the research (`references.md`):

1. **Restraint.** Few materials, each done well. "The challenge is often not adding more, but
   knowing when to stop" (Lusion on Oryzo).
2. **Light is the luxury.** Pools of light, long soft reflections on the floor, darkness as a
   material.
3. **Weight in motion.** The camera eases and settles; nothing bounces, flashes or overshoots. UI
   motion uses Lusion's two curves (`design-system.md` §7).
4. **The boutique voice.** Few words. Small uppercase IBM Plex Mono for labels.

### 6.2 Materials and light

| Where | Material | Light |
|---|---|---|
| Street | Paving (the film's canvas texture), a near-black road that's slightly wet | The sodium lamp, the neighbours' dim windows and small signs |
| Shop front | Glass (`#9FB2C4`, faint), black mullions and fascia | The STRIDEMON letters and the blade sign glow; the store's light spills onto the pavement once it's on |
| Floor | Warm grey polished concrete, `#8E8A84`, low roughness | Reflects the downlights, the lightboxes and the LEDs (§6.3) |
| Walls, ceiling | Matte white `#E6E6EA`, ceiling `#C9C9CF`, skirting `#BDBDC2` | Soft fill plus the ceiling's point lights, as the film |
| Niches | Dark `#121318` / `#0E0F14` | Cool LED shelf strips (`#DCE3FF`, `#C9D3FF`); the Sneakers niche's violet glow `#6E6BFF` |
| Coves and strips | | Warm amber `#FFAE45` / `#FFB13D` |
| Counters, table | Black (`#18181B`), white (`#ECECEF`), dark top (`#3A3B40`) | |
| Pedestal | Chrome | Reads as chrome through the environment map (§6.3) |

### 6.3 What live rendering adds

All of it quiet: rich, not loud. Each step is on or off by tier (§7.6).

| Addition | How | Limit |
|---|---|---|
| **Real floor reflections** | drei `MeshReflectorMaterial` on the floor: fully blurred, low mix, the floor's own colour and roughness. The street and the glows are on a layer it skips (D-064) | The reflection of a lightbox reads as a soft smear, never a mirror |
| **Gentle bloom on the lit things** | `@react-three/postprocessing` `Bloom` (mipmap blur) with a threshold **above 1**: only what's brighter than white blooms (downlights, LED strips, the fascia letters). Sneakers and prints sit at 1 and never bloom; their halo stays the film's glow sprite | With bloom on, the glow sprites are turned down so the two don't add up |
| **Soft contact shadows** | drei `ContactShadows` under the counters, the table, the chairs and the pedestal, rendered **once** (the store doesn't move). No screen-space AO: N8AO shaded the Sneakers too (D-064) | Shadows soft and short, never black |
| **An environment map** | A small scene of light shapes that match the room (the downlight grid, the amber cove, the violet glow, the lit back wall), turned into a PMREM once. Given to the shiny materials only, not set as `scene.environment` (D-064). No HDRI download | Only metal, glass and the polished surfaces show it |
| **Faint film grain** | A small tiled noise picture over the canvas in CSS (overlay blend, low opacity), stepping a few times a second like the film's; still under reduced motion | Barely there |
| **A little life** | The lights-on moment at arrival; the stand's Sneaker fading when it changes | Nothing that loops for attention |

Not used: chromatic aberration, lens flares, glitches, depth of field outside look closer, a
vignette stronger than faint, screen-space AO (D-064), any tone mapping on the Sneakers or in the
composer (§5.2).

### 6.4 The DOM layer

Over the canvas: the website's Lusion look. Satoshi and IBM Plex Mono, white and dark pills with
arrows (D-029), small uppercase metadata, Lusion's easing, no corner "+" marks. On the night
store, the pills are mostly dark with white text; lime only on dark.

The **card** (a bottom sheet on a phone, a small panel on a laptop):

```text
#0137                                   COMMON
Rose Hiker Night
AVAILABLE
Free to mint. Can't be sent or sold.
[ See it on stridemon.xyz → ]
```

The state is Available, Being minted, or Minted with its founder number; "Couldn't check if it's
minted" when the API is down. The button's words follow the schedule as `/pass` says them (before
the window, "See it on stridemon.xyz"; once minting is open to the visitor, "Mint it on
stridemon.xyz", D-066). Every link carries `?source=showroom`. The founder number shows when the mint
is one of the collection's last 10, the only ones the route numbers (D-066).

**Every Founding Pass mention says it's free and can't be sent or sold:** the card, and a short
line beside "Get your Founding Pass" ("Free. Can't be sent or sold.").

## 7. Tech

### 7.1 Stack

| | Choice | Why |
|---|---|---|
| App | `showroom/` at the repo root: Next.js 16.3, React 19.3, TypeScript, Tailwind v4, Bun, static export (the website's versions) | Same as `website/` (D-035): one way of working, free hosting |
| 3D | `three` 0.186.1 and `@react-three/fiber` 9.8.2 (the film's versions), `@react-three/drei` 10.7.9, `@react-three/postprocessing` 3.2.2 with `postprocessing` 6.39.5, pinned exactly (the newest on 2026-10-22; their peer ranges accept the rest) | The film's code ports with no changes to its three.js. **`postprocessing` 6.39 caps three below 0.187**, so three stays on 0.186 until it moves |
| State | One small store for the visit (the stop, look closer, the stand's Sneaker, the tier) | |
| Hosting | A second Vercel project (Hobby, free), root `showroom/`, at `showroom.stridemon.xyz` | Like the website |

### 7.2 Ported from the film

Part 1 copies, from `launch-video/src/showroom/`, into `showroom/src/store/`:

| From the film | Becomes | What changes |
|---|---|---|
| `components/ShowroomWorld.tsx` | the store's components | Static meshes merged per material, downlights instanced, the walls' Sneakers drawn from one atlas each, the stand's Sneaker swappable, the brightness animatable for the lights-on moment. Sizes, colours and lights stay |
| `textures.ts` | the canvas textures | Sized by tier; the theme tokens copied in; the stand card redraws for any design |
| `sneakers.ts` | which Sneakers are where (§5.4) | The sequence's numbers copied in by hand |
| `camera.ts` | the walk's starting poses | Level (no roll), reframed per screen shape (Part 2) |
| `components/useShowroomAssets.ts` | the loader | Remotion's `staticFile`/`delayRender` become plain `fetch` with real progress |
| `components/FilmGrain.tsx` | the grain | A cheap CSS overlay (§6.3) |

Every ported file says where it came from. **From then on, the showroom's copy is the live
store.** The film is rendered and posted; its copy isn't updated to follow.

### 7.3 Folders (Part 1 creates them as needed)

```text
showroom/
  scripts/export-sneaker-art.ts   copies the website's laced SVGs + design table → public/, src/content/
  src/app/                        layout and the one page (static)
  src/content/                    copy, links, the generated design table (never edit by hand)
  src/lib/                        design helpers (copied from the website), the collection, the tier
  src/store/                      the store: ported world, textures, Sneaker pictures, light, effects
  src/visit/                      the arrival, the stops and the camera, input, look closer, find
  src/components/ui/              the DOM layer: where-you-are line, card, find, pills, loader
  public/sneakers/laced/          generated: the 1,000 laced SVGs
```

### 7.4 Where the data comes from

```text
FoundingPassArtRenderer (Solidity, frozen 2026-10-08)
  │  bun run website:export-pass-art
  ▼
website/public/pass-art/laced/*.svg  +  website/src/content/founding-pass-designs.ts
  │  cd showroom && bun run export-art
  ▼
showroom/public/sneakers/laced/*.svg  +  showroom/src/content/sneaker-designs.ts  (generated, committed)
  │  in the browser: rasterised on a canvas at the tier's size
  ▼
the walls' atlases, the prints, the stand

API  GET /v1/pass/collection  →  minted and pending designs, recent mints, the schedule
  →  the card's state and button, "Surprise me", the counter's screen (§10)
```

The showroom reads the website's files at export time only, so it builds on its own on Vercel.
The design table is about 7 KB gzipped, loaded with the page so Find works offline from the API.

### 7.5 The API

The browser reads `GET https://api.stridemon.xyz/v1/pass/collection`, the route `/pass` uses.
Today the origins in `WAITLIST_ALLOWED_ORIGINS` get CORS on every browser route
(`apps/api/src/plugins/cors.ts`), email and mint included. The showroom needs one read, so it gets
its own list, **`SHOWROOM_ALLOWED_ORIGINS`**, which opens `GET /v1/pass/collection` and nothing
else. A small API change in Part 3, deployed in Part 5. If the route can't be reached, the
showroom still works and says so in one quiet line.

### 7.6 Tiers

| | High | Medium | Low |
|---|---|---|---|
| Who | Laptops and strong phones | Most phones | Weak phones |
| Pixel ratio, at most | 2 | 1.5 | 1 |
| Floor | Reflector, full | Reflector, low resolution | No reflection, a little rougher |
| Bloom | On, 7 levels | On, half size, 5 levels | Off: the film's glow sprites only |
| Shadows | Contact shadows | Contact shadows | Contact shadows |
| Sneaker pictures (walls) | 512 px each | 384 px | 256 px |
| Prints | Full size | Half | Half |

Touch devices start on Medium, others on High. drei's `PerformanceMonitor` steps down one tier
when the frame rate stays low and never flips back and forth. Every tier keeps the same store, the
same Sneakers and the same colours.

### 7.7 Measuring

`@vercel/analytics` page views (free, as the website). Every link out to `stridemon.xyz` carries
`?source=showroom`, so the waitlist's sign-ups by source (D-055, D-056) show what the showroom
brings.

## 8. Budgets

| | Target |
|---|---|
| First paint (the loader) | Under 1.5 s on a phone on 4G |
| Download before the street shows | ≤ 1.5 MB gzipped, three.js and fonts included |
| Frame rate | 60 fps on a MacBook; ≥ 50 fps on Yash's Android phone at its tier; ≥ 30 on the Low tier with Chrome's CPU throttled ×4 |
| Per frame | ≤ 150 draw calls on the laptop, ≤ 100 on a phone |
| Texture memory | ≤ 160 MB on the laptop, ≤ 64 MB on a phone |
| Shaders | Compiled during the loader (`gl.compile`), so nothing stutters on the first move |
| No WebGL, or it fails | A still picture of the lit store with the same links (Part 4) |

## 9. What it never does

- Connect a wallet, take an email, mint, or show a STRIDE amount. (If STRIDE ever appears, it
  carries "Monad testnet. STRIDE has no monetary value.")
- Redraw, recolour, bloom or tint a Sneaker.
- Say a rare design is worth more, or use the banned words (`README.md` → Words).
- Play sound before a press, or use anything that bounces, flashes or glitches.
- Use paid assets, fonts, models or services.

## 10. Decided (Part 0, D-063)

Yash asked Claude to research and pick (2026-10-22).

| # | Question | Decided |
|---|---|---|
| 1 | Live by | **Mon 2026-11-09** (§2). If it slips, the latest useful date is 11-20, the day before early access starts |
| 2 | The counter's upright screen | #0137, as the film, until the schedule says minting has started (the waitlist window); then the latest confirmed mint ("Just minted · #0137 · Founder 42"). The deployer's test pass doesn't count: before the window the screen ignores recent mints |
| 3 | The walls' Sneakers | The film's selection, fixed (§5.4), so the showroom and the film stay one place. Any of the 1,000 reaches the stand through Find |
| 4 | The deep link's shape | `showroom.stridemon.xyz/?pass=0137`: one page, no 1,000 static pages. A shared showroom link shows the store's own card (the stronger picture); a Sneaker's card stays the website's `/pass/0137`, which is canonical |
| 5 | "Surprise me" | An available design (not minted or being minted); any design if the minted state can't be read |
| 6 | Sound | None at launch. Most visitors arrive from X on a muted phone, and a sound button is scope without a payoff yet (§11) |
| 7 | "Your Sneaker" (any Sneaker on Monad on the stand), the old plan's Part 7 | Dropped. It can come back after early access starts on fresh contracts (D-049) |

## 11. Later, not planned

A quiet room tone (off until pressed), a minted mark on the shelves, the walls changing on mint
night, baked lighting from Blender, WebXR, and the app opening the showroom from a Sneaker.
