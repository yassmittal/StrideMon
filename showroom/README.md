# StrideMon Showroom

The 3D store at `https://showroom.stridemon.xyz` (D-063): the store from the Showroom film, live in
the browser. Next.js 16 + React 19 + Tailwind CSS v4 on Bun, three.js through React Three Fiber,
exported as static files. Like `website/`, it is **not** a Bun workspace: it has its own
`package.json` and `bun.lock`, and never imports `@stridemon/*`.

The plan is [`../docs/showroom/`](../docs/showroom/README.md) (the brief, the research and one file
per build part). Parts 1 to 4 are done (the store; the arrival and the walk; look closer and find;
the finish and fallbacks), and the interface lives in the store (D-068).

**Hosting (Part 5, D-069):** its own Vercel project, `stridemon-showroom`, root directory
`showroom`, on the website project's defaults, at `https://showroom.stridemon.xyz` (a `CNAME` at
Namecheap). The steps are `docs/deployment.md` §16; Yash runs them. `vercel.json` holds the
security headers and a CSP that allows only what the store uses (D-069): after adding anything that
loads from somewhere new, walk the production build with its headers and watch the console for
"Refused to …". Vercel Analytics counts page views (brief §7.7); off Vercel its script 404s, which
is expected.

## Run it

```bash
cd showroom
bun install
bun run dev          # http://localhost:3002 (the website uses 3000, the local API 3001)
bun run build        # writes the static site to out/
bun run start        # serves out/ on 3002
bun run typecheck
bun run test         # the art and design table; the walk's stops and paths; look closer's targets,
                     # views and tags; the store's buttons; Find and the deep link; the loader
bun run export-art   # copies the website's laced Sneakers and design table (see below)
bun run render-stills  # the fallback's stills and the share card, from the running production build
```

Lint from the repo root: `bun run lint`.

**On the phone:** start `bun run dev` (or `build` then `start` for the real frame rate), find the
laptop's LAN IP with `ipconfig getifaddr en1`, and open `http://<that IP>:3002` in Chrome on the
Android phone. `next.config.ts` lets the dev server answer private LAN addresses.

**In development** a small panel at the top left shows the frame rate, the draw calls of the whole
frame (every pass), the triangles and the tier. Add `?stats` to the link to show it on a production
build too (`bun run build && bun run start`), which is the one to measure on a phone. Open it to hold one of the four face-on colour-check
views (Walk goes back to the walk), put a colour-check design on the stand, or force a tier. A
production build doesn't include it.

**Links for checking:** `?tier=low` (or `medium`, `high`) holds a tier, so the performance
monitor leaves it alone; `?still` shows the lit street with no DOM layer (what `render-stills`
captures). Both work on a production build.

**A second visit in the same tab starts lit.** To watch the lights come on again, open a new tab or
clear the session storage (`stridemon-showroom:street-lit`).

## Where things live

| Path | What |
|---|---|
| `src/app/` | The layout (fonts, as the website loads them, and Vercel Analytics), the one page, `robots.ts` and `sitemap.ts` |
| `vercel.json` | The security headers and the CSP (D-069) |
| `src/components/showroom.tsx` | The page: the canvas (client-only, `next/dynamic`, `ssr: false`), the grain, vignette and reduced motion's veil over it, the little DOM left over it, the dev panel. The whole page is the walk's input surface |
| `src/components/ui/` | The little DOM over the canvas (D-068): the loader, the fallback, the bottom controls (dots, ⌃ ⌄, ‹ ✕ ›, the hint, a notice that fades), Find's dialog, and the hidden list for keyboards and screen readers |
| `src/store/store-buttons.ts` | **The store's own buttons** (D-068): where each lit button is (the door and window decals, the blade sign, the counter's pill, the waitlist kiosk, the Find plate) and what it does |
| `src/store/button-textures.ts` | Their pictures and look closer's shop tag, drawn on canvases |
| `src/store/components/store-buttons.tsx`, `look-closer-tag.tsx` | The buttons in the store (hidden while looking closer) and the tag |
| `src/visit/store-hits.ts`, `store-actions.ts` | A tap's ray against a flat rectangle; what a tap on a Sneaker, a button or the tag does |
| `src/components/ui/store-loader.tsx` | The loader (D-067): the line-Sneaker mark drawn from real progress, in the page's HTML, and the 8-second "Still loading" line (CSS only) |
| `src/components/ui/store-fallback.tsx` | No WebGL, a lost context or files that didn't come: the still, what happened, See all 1,000, Try again, Help |
| `src/lib/loading-store.ts` | The loading's state and its weights: page code, store chunk, each file, the shaders |
| `src/store/store-files.ts` | The 65 Sneakers and the fonts, started with the page (no three.js), counted in the progress |
| `src/store/components/store-warm-up.tsx` | Compiles the shaders and draws three frames under the loader, then says the store is ready |
| `src/store/use-dispose-when-replaced.ts` | Disposes a texture only after React swapped it off its material (the look-closer leak, D-067) |
| `src/lib/build-page-metadata.ts` | The title, description and share cards, copied by hand from the website |
| `scripts/render-stills.ts` | Renders `public/stills/` from the running production build (Chrome over the DevTools protocol) |
| `public/stills/` | **Generated**: the lit store, portrait and landscape WebP for the fallback, and the 1,200 × 630 share card |
| `src/visit/walk-plan.ts` | **Every number of the walk** (D-065): the stops, the lens and safe frame, the furniture, the doorway, the arrival's timings, the look-around and the input |
| `src/visit/frame-subject.ts` | Frames a stop's subject for the screen's shape: solves the camera's distance. Level, never roll |
| `src/visit/walk-path.ts` | The path of a move: through the doorway, round the furniture, eased, turning the short way |
| `src/visit/arrival-lighting.ts` | The lights coming on: downlights row by row, then the lightboxes, the signs and the LEDs |
| `src/visit/walk-controller.ts` | The walk's state: the arrival, the moves between places (a stop, or a Sneaker seen close), the one queued move, look-around, taps, reduced motion's and long jumps' cuts |
| `src/visit/look-closer-targets.ts` | Every Sneaker you can tap (D-066): what a tap hits, what look closer frames, its stop and neighbours |
| `src/visit/use-visit-data.ts` | The deep link (`?pass=137`) |
| `src/store/sneaker-spots.ts` | Where every Sneaker sits: shelf cells, the prints' painted Sneakers, the stand. The store draws from it and look closer taps it |
| `src/lib/find-sneaker.ts` | Find's matching, "Surprise me" and the deep link's parsing |
| `src/visit/walk-camera.tsx`, `use-walk-input.ts` | The canvas side (camera, lights, veil each frame) and the input (wheel, swipe, drag, keys, pointer) |
| `src/components/dev/` | Dev only: the panel, and the camera and frame stats inside the canvas |
| `src/content/showroom.ts` | The showroom's words and links |
| `src/content/sneaker-designs.ts` | **Generated** by `bun run export-art`: the 1,000 designs. Never edit it by hand |
| `src/lib/sneaker-design.ts` | The design helpers, copied by hand from the website's `pass-design.ts` |
| `src/lib/render-tier.ts` | The High, Medium and Low tiers (brief §7.6) |
| `src/lib/visit-store.ts` | The visit's small store: the tier, the arrival, the stop, look closer, Find, the stand's Sneaker, the hovered button |
| `src/store/` | The store itself, ported from `launch-video/src/showroom/` (each file says from where) |
| `src/store/components/` | The world: street, room, walls, back of the store, the stand, merged boxes and LED strips, effects |
| `src/store/sneaker-placements.ts` | Which Sneakers are where (brief §5.4) |
| `src/store/store-lighting.ts` | The light levels (`dark`, `lit`, each downlight row, the LEDs) every lit thing follows, without re-rendering React |
| `src/store/store-tuning.ts` | The numbers for what live rendering adds: floor reflection, bloom, contact shadows, grain |
| `src/store/tone-mapping.ts` | The architecture's own ACES tone mapping (brief §5.2) |
| `public/sneakers/laced/` | **Generated**: the 1,000 laced SVGs. Never edit them by hand |

## The art

The Sneakers are the frozen Founding Pass art (`DESIGNS_FROZEN_ON`, 2026-10-08), shown flat: never
redrawn, recoloured or tinted. `bun run export-art` copies them from the website, which exports
them from the on-chain renderer:

```text
bun run website:export-pass-art   (repo root)  →  website/public/pass-art/laced/*.svg + the design table
bun run export-art                (showroom/)  →  public/sneakers/laced/*.svg + src/content/sneaker-designs.ts
```

The browser fetches the SVGs the store shows (65 of them, with real progress), rasterises them on a
canvas at the tier's size, and draws each wall's Sneakers from one atlas. The stand's Sneaker gets
its own 1,024 px picture.

**The colours never change** (brief §5.2): the Sneakers and prints are unlit, never tone-mapped,
fogged or bloomed, and drawn over the glows. The architecture tone-maps itself and the composer
has no tone-mapping pass. Part 1's colour check measured every flat colour of #0137, #0052, #0029,
#0542 and #0868 in the store against the SVG's own fills: all within 2/255
(measured 2026-10-22; the screenshots and the measurement file were removed on 2026-10-23). Run it again after
any change to the materials, the effects or the overlays.

## Tiers and measurements

Measured 2026-10-23 (Part 4, D-067, again after D-068's buttons and tag) on the production build in headless Chrome on this MacBook
(its GPU), with the scripts in the session's scratchpad: a laptop is 1,440 × 900 at a pixel
ratio of 2, a phone 412 × 915 at 2.625 (capped by the tier).

| | High (laptops) | Medium (touch devices start here) | Low (weak phones) |
|---|---|---|---|
| Pixel ratio, at most | 2 | 1.5 | 1 |
| Wall Sneakers / floor reflection | 384 px / 512 px | 256 px / 256 px | 256 px / none |
| Draw calls, the street (the most) | 112 | 109 | 58 |
| Draw calls, inside | 59 to 65 | 44 to 64 | 22 to 31 |
| Texture memory at a stop | 240 MB: about 135 MB of pictures, reflection, shadows and environment, and 105 MB of the bloom's screen-sized HDR buffers | 64 MB | 45 MB |
| Looking closer (the sharp picture and the tag), at most | 246 MB | 78 MB | 59 MB |
| Multisample renderbuffers (apart) | 261 MB | 26 MB | 3 MB |
| Frame rate, this MacBook | 60 (the headless cap), worst frame 17 ms, every move | 60 | 60, also with the CPU throttled ×4 |
| Frame rate, Yash's Android phone (Chrome) | | Smooth through the whole visit (Yash, 2026-10-23); not read off `?stats` | |

The GPU, not the CPU, is what costs here: with Chrome's CPU throttled ×4 every tier still held 60
on the Mac, so the step-down was checked by forcing slow frames (about 30 fps): Medium stepped to
Low after 2.5 seconds and stayed there.

**Download before the street shows:** 627 KB over the wire (444 KB of JavaScript, three.js
included, 98 KB of fonts, 72 KB of Sneakers), under the brief's 1.5 MB. Ready in about 0.7 s on
the laptop's own network; about 42 s on Chrome's "Slow 3G", where the 8-second line shows.

**Lighthouse** (12.8, after D-068): accessibility 100 and best practices 100 on mobile and on
desktop; first contentful paint 0.8 s on its simulated phone 4G (budget 1.5 s). The showroom calls
no server, so the console stays clean.

Measure on the phone with `?stats` on a production build (`bun run build && bun run start`, then
the laptop's LAN IP): the panel shows the frame rate, the draw calls and the tier, and says
"(auto)" until a tier is held.

## The walk

The street, then five stops (D-065): the #0137 lightbox, the Rare wall, the Legendary corner, the
Founding Pass wall, the Sneaker wall. Each stop is a rectangle in the world and an angle; the camera
stands where the whole rectangle fits the screen, on a phone held upright or a laptop. Scroll, swipe
up and down, ↑ ↓, the arrows or the dots walk; a horizontal drag (or a laptop's pointer, a little)
looks around. Walking back from stop 1 goes out to the street. Under reduced motion every move is a
cut under a short fade and the lights are simply on. Change a stop's numbers in `walk-plan.ts`, then
`bun run test`: it checks every stop and every path on six screen shapes.

## The store is the interface (D-068)

Over the canvas there's almost nothing: the stop dots and ⌃ ⌄ at a stop, ⌄ on the street, ‹ ✕ ›
while looking closer, a one-time "Swipe up to walk", and a line that fades for a bad deep link.
Everything else is a lit thing in the store, with a pointer cursor on a laptop:

| Where | Button | Does |
|---|---|---|
| The street | "STEP INSIDE →" on the glass door | Walks in |
| The street | "1,000 Founding Passes · Free to mint →" low on the window, and the blade sign | `stridemon.xyz/pass` |
| The Founding Pass wall | "GET YOUR FOUNDING PASS →" on the black counter | `stridemon.xyz/pass` |
| The Founding Pass wall | The waitlist kiosk (the counter's upright screen) | `stridemon.xyz/waitlist` |
| The Sneaker wall | "FIND A SNEAKER" on the white counter | Opens Find (`/` does too) |

Tap or click any Sneaker you can see (a shelf's whole cell, a print's Sneaker, the stand): the camera
comes square on, and a white **shop tag** hangs beside it (under it on a phone held upright) with
its number, rarity, name, the promise and "See it on stridemon.xyz". Tap the tag for its page.
‹ › (or ← →, or a swipe across) step to its neighbours; ✕, Esc, a tap on nothing, a scroll or
↑ ↓ go back. Find takes a number or any part of a name, or "Surprise me" (any design but the one on
the stand), puts it on the counter's stand and brings the camera there. `?pass=137` opens straight
on the stand with its tag; a bad number says so on the street. Tab reaches a hidden list (it shows
itself when focused) of the stop's buttons and Sneakers, and a screen reader hears where you are.

**No minted state, and no server** (D-068): the showroom calls no API. Help is on the fallbacks,
not over the walk.

## The loader and the fallbacks (Part 4, D-067)

The loader is in the page's HTML, so it paints before any script: the line-Sneaker mark, faint,
then drawn stroke by stroke as the page's code, the store's chunk, each file and the shaders
arrive (the lime stroke last, with the shaders). After 8 seconds a line
(CSS, no script) says the collection is also at `stridemon.xyz/pass`.

When the store can't run, a still of the lit store takes its place with what happened and a next
step: no WebGL ("Your browser can't show the 3D store", See all 1,000 on stridemon.xyz), a lost
context or files that didn't come (the same, plus Try again, a reload that keeps a deep link). The
fallback carries the Founding Pass (free, can't be sent or sold), the waitlist and Help itself. The stills come from the showroom itself:
after a visible change to the street, run `bun run build && bun run start`, then
`bun run render-stills`, then build again so `out/` carries them.

To see each one: Chrome with `--disable-webgl`; on a running store, `document.querySelector('canvas')
.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext()` in the console; DevTools →
Network → block `/sneakers/laced/*`.
