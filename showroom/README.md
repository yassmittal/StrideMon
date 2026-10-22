# StrideMon Showroom

The 3D store at `https://showroom.stridemon.xyz` (D-063): the store from the Showroom film, live in
the browser. Next.js 16 + React 19 + Tailwind CSS v4 on Bun, three.js through React Three Fiber,
exported as static files. Like `website/`, it is **not** a Bun workspace: it has its own
`package.json` and `bun.lock`, and never imports `@stridemon/*`.

The plan is [`../docs/showroom/`](../docs/showroom/README.md) (the brief, the research and one file
per build part). Part 1 (the store) is built; the walk, look closer, the finish and the launch are
Parts 2 to 5.

## Run it

```bash
cd showroom
bun install
bun run dev          # http://localhost:3002 (the website uses 3000, the local API 3001)
bun run build        # writes the static site to out/
bun run start        # serves out/ on 3002
bun run typecheck
bun run test         # the exported art matches the design table
bun run export-art   # copies the website's laced Sneakers and design table (see below)
```

Lint from the repo root: `bun run lint`.

**On the phone:** start `bun run dev` (or `build` then `start` for the real frame rate), find the
laptop's LAN IP with `ipconfig getifaddr en1`, and open `http://<that IP>:3002` in Chrome on the
Android phone. `next.config.ts` lets the dev server answer private LAN addresses.

**In development** a panel in the top-left corner switches the view (the film's camera poses made
level, plus four face-on colour-check views), puts a colour-check design on the stand, and forces a
tier. It shows the frame rate, the draw calls of the whole frame (every pass) and the triangles. A
production build doesn't include it.

## Where things live

| Path | What |
|---|---|
| `src/app/` | The layout (fonts, as the website loads them) and the one page |
| `src/components/showroom.tsx` | The page: the canvas (client-only, `next/dynamic`, `ssr: false`), the grain and vignette over it, the dev panel |
| `src/components/ui/` | The DOM layer. For now the placeholder loading and failure lines (Part 4 builds the loader) |
| `src/components/dev/` | Dev only: the panel, and the camera and frame stats inside the canvas |
| `src/content/showroom.ts` | The showroom's words and links |
| `src/content/sneaker-designs.ts` | **Generated** by `bun run export-art`: the 1,000 designs. Never edit it by hand |
| `src/lib/sneaker-design.ts` | The design helpers, copied by hand from the website's `pass-design.ts` |
| `src/lib/render-tier.ts` | The High, Medium and Low tiers (brief §7.6) |
| `src/lib/visit-store.ts` | The visit's small store: the tier, the view, the stand's Sneaker |
| `src/store/` | The store itself, ported from `launch-video/src/showroom/` (each file says from where) |
| `src/store/components/` | The world: street, room, walls, back of the store, the stand, merged boxes and LED strips, effects |
| `src/store/sneaker-placements.ts` | Which Sneakers are where (brief §5.4) |
| `src/store/store-lighting.ts` | The light levels (`dark`, `lit`) every lit thing follows, without re-rendering React |
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
(`docs/showroom/look/part-1/colour-check.txt`, and the side-by-side PNGs there). Run it again after
any change to the materials, the effects or the overlays.

## Tiers and measurements

| | High | Medium | Low |
|---|---|---|---|
| Who | Laptops | Touch devices (the start) | Weak phones (the performance monitor steps down, Part 4 tunes it) |
| Draw calls, street view (the most) | 107 | 85 (phone-shaped screen) | 70 |
| Draw calls, inside | 56 to 68 | 45 to 57 | 30 to 38 |
| Frame rate, this MacBook (Chrome) | 100 (the cap of the test browser) | 100 | 100 |
| Frame rate, Yash's Android phone (Chrome) | to measure | to measure | to measure |

The JavaScript is 536 KB gzipped (three.js included), under the brief's 1.5 MB.
