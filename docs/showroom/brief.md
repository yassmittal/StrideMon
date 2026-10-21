# The StrideMon Showroom: brief

**Status:** planned (2026-10-22). Nothing is built. Part 0 confirms §10 with Yash and writes the
decision (the next free number in `docs/decisions.md`). The build order is in
[`README.md`](README.md); the research behind every choice here is in
[`references.md`](references.md).

## 1. The idea

A 3D gallery at `https://showroom.stridemon.xyz` where anyone can walk through all 1,000
Founding Pass Sneakers, take any one of them off the shelf and turn it in their hands, then go
mint it on `stridemon.xyz`.

`/pass` already shows the collection as a fast grid. The showroom shows it as **a place**: the
drawing that lives on Monad, given depth, light and a building worthy of it. It should feel like
walking into a flagship store after hours, not like scrolling a marketplace.

It **only shows**. No wallet, no email, no mint. Every action is a link to `stridemon.xyz`, where
those flows already work (D-044, D-045).

## 2. Why build it, and when

- **Something worth sharing.** The waitlist has to grow to 10,000 before the window
  (2026-11-28 14:30 UTC, `waitlist-growth-plan.md`). A grid isn't a post; walking through a lit
  hall of 1,000 Sneakers is. It gives X, Instagram, Product Hunt and YouTube a reason to click.
- **Picking a favourite.** Before the window, people choose the design they'll mint. Turning it
  in 3D makes that choice feel like owning something.
- **Mint night, live.** The vault of white casts fills with colour as passes are minted. Over
  the window it becomes a picture of the mint itself, worth a screenshot every hour.
- **Every visit ends on `stridemon.xyz`:** a pass page, the waitlist or the app.

**When:** live a good while before the window, so it can carry the waitlist push. Proposed:
by **2026-11-14** (Part 0, Yash decides). That's about seven sessions of work.

## 3. The building

One building, drawn in code (like the Showroom film's store in `launch-video/src/showroom/`), in
metres. These are starting numbers; Part 2 tunes them.

```text
          ── overhead, the whole length: the vault of 1,000 white casts ──
   ┌─────────┬─────────┬─────────┬─────────┬─────────┬─────────────┐
   │ Runner  │ Racer   │ Trail   │ Court   │ Hoop    │             │
   │   ◆     │   ◆     │   ◆     │   ◆     │   ◆     │    APSE     │
   └───┬─────┴───┬─────┴───┬─────┴───┬─────┴───┬─────┘             │
 DOORS ═╪═════════╪═══ THE NAVE ══════╪═════════╪══════════   ●     │
   ┌───┴─────┬───┴─────┬───┴─────┬───┴─────┬───┴─────┐   oculus    │
   │ Chunky  │ Sock    │ Skate   │ Spike   │ Hiker   │             │
   │   ◆     │   ◆     │   ◆     │   ◆     │   ◆     │             │
   └─────────┴─────────┴─────────┴─────────┴─────────┴─────────────┘
   ◆ the chapel's Legendary, in a glass case     ● the apse's plinth
```

| Space | Size | What's there |
|---|---|---|
| **The doors** | | Where the visit starts: tall bronze doors that open onto the nave |
| **The nave** | ~6 m wide, ~42 m long, ~7 m to the vault | A long, dim stone hall. Overhead, **the vault**: all 1,000 designs as white plaster casts on thin steel rods, lit from below so they glow against a dark coffered ceiling. A minted design's cast takes its own colours |
| **Ten chapels** | ~6 × 6 m, ~4 m high | One per template, in the design table's order (Runner, Racer, Trail, Court, Hoop on the left; Chunky, Sock, Skate, Spike, Hiker on the right). Each holds its 100 designs on brushed steel shelves at 1:1, a museum placard under each, and its **Legendary in a glass case** in the middle, at 2× |
| **The apse** | a half-round, ~8 m across | One Sneaker at 3× on a tall white plinth, under an open oculus with a shaft of cool light. The Sneaker of the day; once minting starts, the latest mint ("Just minted: #0137, Founder 42") |

Each template has exactly 100 designs and one Legendary (checked 2026-10-22), so every chapel is
the same size: one room design, ten moods (§6).

## 4. The visit

| Moment | What happens | Controls |
|---|---|---|
| **Arrive** | A loader draws the line-Sneaker mark as the files load (real progress). The doors open; the camera steps into the nave | |
| **Walk the nave** | The camera glides down the centre line and settles at five stops, one per pair of chapels, then the apse. At a stop, each doorway shows its template and "100 Sneakers" | Scroll, swipe up/down, ↑ ↓ |
| **Step into a chapel** | The camera turns and enters. Walking moves it along the shelves: left wall, back wall, right wall. The Legendary's case stands in the middle | Tap a doorway, ← →, Enter. "Back to the hall" is always on screen |
| **Up close** | Tap a Sneaker: it lifts off the shelf and comes to the camera; the room dims and softens behind it. Drag to turn it (with weight), pinch or scroll to look closer. The placard sheet opens | Tap, drag, Esc to put it back, ← → for its neighbours |
| **Find** | "Find a Sneaker": number or name, filters (template, family, rarity, available), "Surprise me". The camera walks there and lifts it | `/` or the Find pill |
| **Map** | A small line drawing of the floor plan shows where you are. Tap any room to go there | The map pill |
| **Leave** | The placard's button opens that design's page on `stridemon.xyz` (favourite it, join the waitlist, mint it, by the schedule). The header always has "Join the waitlist" | |

**Pointer and motion:** on a laptop the pointer turns the view a few degrees (a slow look-around).
No free roaming: a guided path can't get anyone lost, and it works the same with a thumb. With
`prefers-reduced-motion`, the camera cuts with a short fade instead of gliding.

**Deep links:** `showroom.stridemon.xyz/pass/0137` opens straight on #0137, up close, mirroring
`stridemon.xyz/pass/0137`.

## 5. How a 2D drawing becomes a 3D Sneaker

### 5.1 What the art is

Every design's laced Sneaker (`website/public/pass-art/laced/NNNN.svg`, exported from
`FoundingPassArtRenderer`) is, checked on all 1,000 on 2026-10-22:

- a 1000 × 600 space, toe to the right, the ground at y = 520
- **only straight-edged polygons** (`M … Z` paths: no curves, arcs, circles or gradients), each
  with one flat fill
- the panels clipped by one silhouette `clipPath`, with 7-unit ink lines between them and an
  18-unit ink outline round the silhouette, all with round joins
- the lime heel tab and its ink chevron outside the clip, and the lace slats or eyelets on top

So it converts to geometry **exactly**, with no tracing and no guessing.

### 5.2 Cloisonné (the recommended finish)

In cloisonné enamel, fine metal walls (the *cloisons*) separate fields of glossy coloured enamel.
The art already is that: ink lines between flat colour fields. So each Sneaker is built as an
enamel object:

1. **Clip** each panel polygon to the silhouette (`clipper2-js`, intersection).
2. **Ink lines to ridges:** offset each panel's 7-unit stroke and the 18-unit outline into
   polygons (`clipper2-js`, round joins). These are the cloisons.
3. **Stack**, back to front: the **body** (the silhouette, extruded to the shoe's thickness, edges
   rounded, in ink) → the **enamel fields** (each clipped panel, a little proud of the body, in
   its fill, in drawing order) → the **cloisons** (proud of the enamel) → the **laces** (highest)
   → the **heel tab** (its own lime piece standing above the heel, with its chevron).
4. **Two faces:** the far side carries the same relief, mirrored, so the toe points the other way,
   like a real shoe's two sides.
5. **Finish by role:** enamel is glossy with a clear coat; cloisons are satin dark metal; the cream
   midsole is matte; the heel tab is glossy rubber. **Gold** designs get metallic enamel,
   **Chrome** a mirror finish, and the 10 **Prism** Legendaries an iridescent (thin-film) enamel.
   Base colours always stay the SVG's fills.
6. **Cheap to draw:** each role's pieces merge into one mesh with vertex colours, so a Sneaker is
   about four draw calls, and no textures.

**Scale:** 1:1 is about 30 cm long, so 1 art unit is 0.3 mm. Relief steps of 4 to 6 units
(1.2 to 1.8 mm); the body 60 to 90 mm thick. Part 1 tunes these by eye.

**Why this one:** it's exactly the on-chain drawing; it stays sharp at any zoom (geometry, not
pictures); it's tiny to download (a few KB of polygons per design); and a lacquered surface is
what makes soft studio light look expensive as the Sneaker turns.

### 5.3 The challenger: soft cast

The silhouette **inflated** into a soft, rounded volume (height from the distance to the edge),
with the drawing printed on both sides as a texture (rasterised at 2,048 px). It reads more like
a real shoe or a designer vinyl toy, but it loses the crisp layers, costs texture memory, and
blurs up close. Part 1 builds both on the same plinth, and Yash picks.

### 5.4 At a distance

| Distance | What's drawn |
|---|---|
| Near (up close, the nearest shelves) | The full relief |
| Middle (the rest of the chapel) | The body with one flat face carrying the drawing from a texture atlas |
| Far (the vault) | A plaster cast: one of 10 template silhouettes, instanced. Once minted, it takes the drawing from the atlas |

The atlases are made by the export script from the same SVGs.

## 6. Art direction: "rich" made concrete

### 6.1 Principles (from the research)

1. **Restraint.** Few materials, each done perfectly. Lusion on Oryzo: "the challenge is often not
   adding more, but knowing when to stop."
2. **Light is the luxury.** Soft, wide light sources whose long reflections slide across the
   enamel as a Sneaker turns. Pools of light on the pieces, shadow between them. Darkness is a
   material.
3. **Space and scale.** Tall ceilings, generous gaps, nothing crowded. A Sneaker never competes
   with its neighbour for attention.
4. **Weight in motion.** The camera eases and settles; nothing bounces or overshoots. A turntable
   turns once every 40 seconds or so. UI motion uses Lusion's two curves
   (`design-system.md` §7).
5. **The museum voice.** Few words. Placards in IBM Plex Mono, small and uppercase.
6. **True colours.** The Sneakers are frozen art. Use three.js's `NeutralToneMapping` (Khronos PBR
   Neutral, made so product colours survive), treat the SVG fills as sRGB, and check every finish
   side by side with the card on `/pass`. ACES-style tone mapping shifts hues: don't use it.

### 6.2 Materials and light (default: after hours)

The building at night, lit from inside.

| Where | Material | Light |
|---|---|---|
| Nave floor | Honed dark terrazzo, a soft blurred reflection | Low and warm |
| Nave walls | Dark lime plaster | Grazing light washing up the walls |
| The vault | 1,000 white plaster casts on thin steel rods, a dark coffered ceiling behind | Uplight, so the casts glow against the dark |
| Chapel walls and shelves | Deep graphite plaster; brushed stainless steel shelves (after Kith); a small placard under each Sneaker | A warm spot per shelf row; the glass case lit from its base |
| Chapel floors | One material for each template's world: Runner travertine, Racer asphalt, Trail slate, Court red clay, Hoop maple, Chunky terrazzo, Sock wool felt, Skate poured concrete, Spike red track, Hiker granite | |
| The apse | A tall white stone plinth under an open oculus | A cool shaft of moonlight |
| Lime | One thin line of lime light across each chapel's threshold. The only lime in the building (`design-system.md` rule 8: lime only on dark) | |

The other mood, **daylight**, is the same building in pale plaster under skylights: closer to
the website's off-white. Part 1 shows both; Part 0 records the pick.

Textures come from CC0 libraries (ambientCG, Poly Haven), credited in `showroom/CREDITS.md`.

### 6.3 The DOM layer

Over the canvas: the Lusion look of the website. Satoshi and IBM Plex Mono, white and dark
pills with arrows (D-029), small uppercase metadata, Lusion's easing. No corner "+" marks. A
placard reads:

```text
#0137
ROSE HIKER NIGHT
COMMON · AVAILABLE
```

## 7. Tech

### 7.1 Stack

| | Choice | Why |
|---|---|---|
| App | `showroom/` at the repo root: Next.js 16, React 19, TypeScript, Tailwind v4, Bun, static export | Same as `website/` (D-035): one way of working, free hosting |
| 3D | `three` 0.186, `@react-three/fiber` 9, `@react-three/drei` 10, `@react-three/postprocessing` 3 | The versions `launch-video/` already runs, so code moves between them |
| Geometry | `clipper2-js` (clipping and offsets), three's `ExtrudeGeometry` / `ShapeGeometry` | Exact polygons in, meshes out |
| Workers | Build each chapel's Sneakers in a Web Worker, hand the buffers back | The main thread stays smooth while a chapel loads |
| Text in 3D | drei's `Text` (troika) with IBM Plex Mono | Sharp placards at any distance |
| State | One small store for the visit (where the camera is, what's up close, filters) | |
| Hosting | A second Vercel project (Hobby, free), root `showroom/`, at `showroom.stridemon.xyz` | Like the website |

### 7.2 Folders (Part 1 creates them as needed)

```text
showroom/
  scripts/export-sneaker-art.ts   reads the website's exported art → src/content + public/sneakers
  src/app/                        layout, the page, pass/[number] deep links (static)
  src/content/                    copy, links, the generated design table (never edit by hand)
  src/lib/sneaker-geometry/       SVG → polygons → relief. Pure and tested; runs in the worker
  src/lib/collection/             the live minted state, from the API
  src/world/                      the building: floor plan (metres), rooms, materials, lights
  src/sneakers/                   relief meshes, levels of detail, the vault of casts
  src/visit/                      the camera path, stops, input (scroll, swipe, keys), the store
  src/components/ui/              the DOM layer: placard sheet, find, map, pills
  public/sneakers/                generated: polygons per design, atlases
```

### 7.3 Where the data comes from

```text
FoundingPassArtRenderer (Solidity, frozen 2026-10-08)
  │  bun run website:export-pass-art
  ▼
website/public/pass-art/laced/*.svg  +  website/src/content/founding-pass-designs.ts
  │  cd showroom && bun run export-art
  ▼
showroom/src/content/sneaker-designs.ts  +  showroom/public/sneakers/  (generated, committed)
  │  in the browser, in a worker
  ▼
relief meshes in the scene

API  GET /v1/pass/collection  →  minted, pending, counts, latest mints, schedule
  →  the vault's colours, each placard's state, the apse, the placard's button
```

The showroom reads the website's exported files at export time only, so it builds on its own on
Vercel.

### 7.4 The API

The browser reads `GET https://api.stridemon.xyz/v1/pass/collection`, the route `/pass` uses.
Today only the origins in `WAITLIST_ALLOWED_ORIGINS` get CORS, and that list also opens the email,
mint and sign-in routes. The showroom needs one read, so it gets its own list,
**`SHOWROOM_ALLOWED_ORIGINS`**, which opens `GET /v1/pass/collection` and nothing else. That's a
small API change in Part 3, deployed in Part 6. If the route can't be reached, the showroom still
works and says in one line that the minted state is unavailable.

### 7.5 Measuring

`@vercel/analytics` page views (free). Every link out to `stridemon.xyz` carries
`?source=showroom`, so the waitlist's sign-ups by source (D-055, D-056) show what the showroom
brings. Part 6 checks the website keeps the source from a pass page to the waitlist.

## 8. Budgets

| | Target |
|---|---|
| First paint (the loader) | Under 2 s on a phone on 4G |
| Download before the nave is walkable | ≤ 4 MB, three.js included |
| Each chapel, loaded as you approach | ≤ 400 KB |
| Frame rate | 60 fps on a MacBook; ≥ 50 fps on Yash's Android phone in Chrome |
| Device pixel ratio | Capped at 2 (laptop) and 1.5 (phone) |
| Per frame | ≤ 150 draw calls; ≤ 1M triangles on a laptop, ≤ 400k on a phone |
| When a device struggles | drei's `PerformanceMonitor` steps down: pixel ratio, then floor reflections, then ambient occlusion, then bloom |
| No WebGL, or it fails | A plain page: "Your browser can't show the 3D showroom", the collection as a list of links to `stridemon.xyz/pass/…`, and the waitlist |

## 9. What it never does

- Connect a wallet, take an email, mint, or show a STRIDE amount. (If STRIDE ever appears, it
  carries "Monad testnet. STRIDE has no monetary value.")
- Change a design's shape or colour beyond the finish in §5.2.
- Say a rare design is worth more, or use the banned words (`README.md` → Words).
- Play sound before a press, or use anything that bounces, flashes or glitches.
- Use paid assets, fonts, models or services.

## 10. Open questions (Part 0)

Each has a default; "defaults" answers them all.

| # | Question | Default |
|---|---|---|
| 1 | The address | `showroom.stridemon.xyz` |
| 2 | The mood | After hours (§6.2); Part 1 shows daylight beside it |
| 3 | The vault fills with colour as passes are minted | Yes |
| 4 | The apse | The Sneaker of the day, then the latest mint once minting starts |
| 5 | Sound | None at launch. A quiet room tone, off until pressed, can come later |
| 6 | Live by | 2026-11-14 |
| 7 | Part 7, "Your Sneaker" | Later, after early access starts on fresh contracts (D-049) |

## 11. Later, not planned

A WebXR walk-through, a Gaussian-splat scan of a real space, the app opening the showroom from a
Sneaker, a hall for normal Sneakers, and a sound score.
