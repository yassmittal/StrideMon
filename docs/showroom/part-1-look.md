# Part 1: The look

**Goal:** `showroom/` runs, the 1,000 drawings convert to 3D, and one plinth shows two finishes
in two moods so Yash can pick the look on his laptop and his phone. Everything after this part
builds on that pick, so take the time to make it beautiful.

## Read first

- The brief §5 (all of it), §6 and §7, and `references.md` (open Oryzo and the pmndrs
  `shoe-configurator` and `image-gallery` examples)
- `website/README.md`, `website/AGENTS.md`, `website/package.json`, `website/next.config.ts`,
  `website/src/app/layout.tsx` (how the fonts load), `website/vercel.json`
- `launch-video/src/showroom/components/ShowroomWorld.tsx` (a StrideMon space already drawn in R3F)
- `docs/conventions/coding-standards.md`, `docs/conventions/testing.md`
- `packages/contracts/art/founding-pass/README.md` → "The frame" and "How a Sneaker is drawn"
- This Next.js differs from training data: read `website/node_modules/next/dist/docs/` before
  writing Next code

## Build

1. **Set up `showroom/` by hand, the way `website/` is set up.** Its own `package.json`
   (`stridemon-showroom`) and `bun.lock`, not a Bun workspace, never importing `@stridemon/*`.
   Next.js 16 and React 19 at the website's versions; `three`, `@react-three/fiber` and the rest
   at `launch-video/`'s versions (brief §7.1), checking their peer ranges. Static export.
   Tailwind v4, Satoshi and IBM Plex Mono loaded as the website loads them. Scripts: `dev` on
   **port 3002** (the website uses 3000 and the local API 3001), `build`, `start`, `typecheck`,
   `test`, `export-art`. Copy the website's `AGENTS.md`/`CLAUDE.md` pair. Add the generated paths
   to the root `biome.json` excludes, and a `.gitignore` for `.next/`, `out/` and
   `node_modules/`. The canvas loads client-only (`next/dynamic`, `ssr: false`). Replace
   `showroom/README.md` with a real one (run it, where things live), shaped like the website's.
2. **The export:** `showroom/scripts/export-sneaker-art.ts` (`bun run export-art`) reads the
   website's exported art (`../website/public/pass-art/laced/*.svg`) and design table
   (`../website/src/content/founding-pass-designs.ts`) and writes, each with a "generated, never
   edit by hand" header:
   - `src/content/sneaker-designs.ts`: the design table
   - `public/sneakers/polygons/NNNN.json`: each design as clipped polygons by role (heel tab,
     panels in drawing order with their fills, ink lines, outline, laces), already offset, so the
     browser only triangulates and extrudes
   - `public/sneakers/laced/NNNN.svg`: copies of the drawings, for the colour check now and the
     plain fallback page later

   Copy the few design helpers the showroom needs (names, number format, rarity) from
   `website/src/lib/founding-pass/pass-design.ts` into `src/lib/` by hand. Print the total
   polygon data size, gzipped, at the end of the export.
3. **`src/lib/sneaker-geometry/`**, pure and DOM-free (it will run in a worker): parse a laced
   SVG, clip panels to the silhouette and turn ink strokes into polygons (`clipper2-js`, round
   joins), then build:
   - `buildCloisonneRelief` (brief §5.2): body, enamel fields, cloisons, laces, heel tab, both
     faces, returned as typed arrays per material role with vertex colours
   - `buildSoftCastGeometry` (brief §5.3): the inflated silhouette with UVs for the drawing

   Tests (`bun test`): all 1,000 drawings parse; every field lies inside the silhouette; the
   fields cover the silhouette to within 0.5 % of its area; every colour used is one of that SVG's
   fills; the relief has no NaN and stays under a triangle budget you set and write down.
4. **The look page, `/look`** (it goes away in Part 2): one plinth on a floor, a slow turntable,
   orbit controls with sensible limits, light from drei's `Environment` with `Lightformer`s,
   `NeutralToneMapping`. Small DOM switches for:
   - the finish: cloisonné or soft cast
   - the mood: after hours or daylight (brief §6.2)
   - the design: **#0137 Rose Hiker Night** (common), **#0052 Gold Runner Storm** (Gold),
     **#0029 Chrome Hoop Day** (Chrome), **#0542 Nacreous** (the Chunky's Prism Legendary)
   - a face-on view with the design's SVG beside it, for the colour check

   Tune the relief (body thickness, step heights, bevels, the clear coat, the metal of the
   cloisons, the Gold, Chrome and Prism finishes) until it looks like a piece in a jeweller's
   window. A dev-only tuning panel (for example `leva`) is fine; remove it when the numbers are
   final. Show the frame rate in dev.
5. **The colour check:** for each design, the face-on render beside its SVG, under the neutral
   light. They should look the same colour to the eye. Save the four pairs and the eight look
   shots (4 designs × 2 finishes, in the picked mood) as PNGs in `docs/showroom/look/`.
6. **On the phone:** Yash opens `http://<LAN IP>:3002/look` (`ipconfig getifaddr en1`) on his
   Android phone in Chrome. Note the frame rate of each finish.

## Record the pick

Write the chosen finish and mood, and the final numbers, into one file,
`src/sneakers/sneaker-look.ts`. From here on, changing it needs Yash's ok, like the art. If the
pick differs from the brief's recommendation, update the brief and the decision first.

## Done when

- Yash has picked the finish and the mood, on the laptop and on the phone.
- The colour check passes, and the shots are in `docs/showroom/look/`.
- The geometry tests pass on all 1,000 designs; typecheck, lint and tests pass.

Mark Part 1 **Done**, then stop.
