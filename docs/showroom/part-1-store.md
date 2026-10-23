# Part 1: The store

**Goal:** `showroom/` runs, and the store from the Showroom film renders live in the browser, the
same place as the film plus what live rendering adds (brief §6.3), on the laptop and on the phone.
Everything after this part walks around in it, so take the time to make it beautiful.

## Read first

- The brief §3, §5, §6, §7 and §8; `references.md`
- The film's store: `launch-video/src/showroom/components/ShowroomWorld.tsx`, `textures.ts`,
  `sneakers.ts`, `camera.ts`, `components/useShowroomAssets.ts`, `components/FilmGrain.tsx`, and
  `launch-video/src/theme.ts` (the tokens `textures.ts` reads). Watch
  `launch-video/out/stridemon-showroom-9x16.mp4` once
- `website/README.md`, `website/AGENTS.md`, `website/package.json`, `website/next.config.ts`,
  `website/src/app/layout.tsx` and `website/src/lib/load-fontshare-css.ts` (how the fonts load),
  `website/vercel.json`
- `website/src/lib/founding-pass/pass-design.ts` (names, number format, rarity)
- `docs/conventions/coding-standards.md`, `docs/conventions/testing.md`
- This Next.js differs from training data: read `website/node_modules/next/dist/docs/` before
  writing Next code

## Build

1. **Set up `showroom/` by hand, the way `website/` is set up.** Its own `package.json`
   (`stridemon-showroom`) and `bun.lock`, not a Bun workspace, never importing `@stridemon/*`.
   Next.js and React at the website's versions; `three` and `@react-three/fiber` at the film's;
   `@react-three/drei`, `@react-three/postprocessing` and `postprocessing` at the brief's §7.1
   versions (recheck with `npm view <package> peerDependencies`), all pinned exactly. Static
   export. Tailwind v4, Satoshi and IBM Plex Mono loaded as the website loads them. Scripts: `dev`
   on **port 3002** (the website uses 3000 and the local API 3001), `build`, `start`,
   `typecheck`, `test`, `export-art`. Copy the website's `AGENTS.md`/`CLAUDE.md` pair. Add the
   generated paths to the root `biome.json` excludes, and a `.gitignore` for `.next/`, `out/` and
   `node_modules/`. The canvas loads client-only (`next/dynamic`, `ssr: false`). Write
   `showroom/README.md` (run it, where things live), shaped like the website's.
2. **The export:** `scripts/export-sneaker-art.ts` (`bun run export-art`) copies the website's
   laced SVGs (`../website/public/pass-art/laced/*.svg`) to `public/sneakers/laced/`, and turns its
   design table (`../website/src/content/founding-pass-designs.ts`) into
   `src/content/sneaker-designs.ts`, each with a "generated, never edit by hand" note (a header in
   the TS file, a `README` in the folder). Copy the few design helpers the showroom needs from
   `pass-design.ts` into `src/lib/` by hand. A test checks all 1,000 SVGs are there and match the
   table.
3. **Port the store** (brief §7.2) into `src/store/`, each file saying where it came from. Keep the
   film's sizes, colours and lights. Change only what the web needs:
   - Remotion goes: `staticFile`/`delayRender` become `fetch` with real progress, and the
     Sneakers are rasterised from the SVGs on a canvas (brief §5.3) instead of loaded as PNGs.
   - The walls' Sneakers draw from one atlas per niche; static blocks merge per material; the
     16 downlights and their glows are instanced.
   - The store's brightness is one value that can animate (Part 2's lights-on moment), and the
     stand's Sneaker and card can change (Part 3).
4. **What live rendering adds** (brief §6.3): the environment map for the shiny things, the
   reflective floor, contact shadows rendered once, bloom above a threshold of 1, tone mapping
   inside the architecture's materials and none in the composer (brief §5.2), and the grain.
   (`N8AO` was tried and dropped: it shaded the Sneakers, D-064.) Tune each one until it's rich and
   quiet. A dev-only tuning panel (for example `leva`) is fine; remove it when the numbers are
   final.
5. **The tiers** (brief §7.6): a first version of High, Medium and Low, chosen by hand in dev,
   with `PerformanceMonitor` wired but not tuned (Part 4 tunes it). Show the frame rate and the
   draw calls in dev.
6. **A dev-only view switch** with the film's camera poses made level: the street (dark and
   lit), the lightbox, the Rare wall, the Legendary corner, the Founding Pass wall, the Sneaker
   wall. That's how Yash compares the store with the film now, and it's Part 2's starting point.
7. **The colour check:** for #0137, #0052 (Gold), #0029 (Chrome) and #0542 (Nacreous), the
   Sneaker in the store, face-on and lit, beside its card on `stridemon.xyz/pass`. They should
   look the same to the eye, with the composer on (brief §5.2's gotcha). Write the measured
   result into `showroom/README.md` (no screenshots are kept: Yash, 2026-10-23).
8. **On the phone:** Yash opens `http://<LAN IP>:3002` (`ipconfig getifaddr en1`) on his Android
   phone in Chrome. Note each tier's frame rate there and on the laptop in `showroom/README.md`.

## Done when

- Yash has compared each view with the film on the laptop and the phone and approved the store
  and its live additions.
- The colour check passes, and its result is in `showroom/README.md`.
- Typecheck, lint and tests pass.

Mark Part 1 **Done**, then stop.
