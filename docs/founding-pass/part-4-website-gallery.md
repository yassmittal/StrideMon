# Part 4: Website, the gallery

**Goal:** `stridemon.xyz/pass` works in preview mode. Anyone can browse the 1,000 designs, find
the one they love, read how it all works, and join the waitlist. No wallet yet: that's Part 5.

## Read first

- The brief §2, §5.1, §5.2, §8 and §10.3, D-041
- `website/README.md`, `website/AGENTS.md` (this Next.js version differs from training data: read
  its docs in `node_modules/next/dist/docs/`), D-035 (static export, speed targets), D-037 (the
  waitlist)
- `docs/architecture/design-system.md` (the Lusion look)

## Build

1. **Export the collection** into the website: the 1,000 frozen designs' SVGs in
   `website/public/pass-art/`, and the design table (number, name, layers, rarity) in
   `website/src/content/`, written by a script from the contracts package. The site never imports
   `@stridemon/*` (D-035). **As built (D-044):** `bun packages/contracts/art/founding-pass/export-website-art.ts`
   writes each design's card (`pass-art/cards/`) and its laced Sneaker (`pass-art/laced/`), both
   drawn by the Solidity renderer, and `src/content/founding-pass-designs.ts`.
2. **`/pass`:**
   - *Reordered (D-050):* a short hero with a small status panel, then Get ready (when useful),
     the collection with the finder in its toolbar, How it works with the dates, the waitlist and
     Questions (six, then "More questions"). "Show more" grows the grid; it no longer loads on scroll.
   - **Header:** the phase and its countdown. In preview it counts down to the waitlist window,
     during the window to the open mint, and during the open mint it reads "612 of 1,000 minted".
   - **Find:** the match quiz (3 questions → 6 passes), "Surprise me", and search by number.
   - **Filters:** template, family, options, rarity, available only, favourites. Sort by
     number, rarity or recently minted.
   - **Grid:** the art as it scrolls into view (lazy, fixed sizes so nothing jumps). Two a row on
     a phone, 5 or 6 on a desktop.
   - **Detail sheet:** the art large, its layers and rarity, the laced look, and 3 similar
     designs. The laced look shows the real lace colour (Yash, 2026-10-08, D-044).
   - **Favourites:** kept in the browser, every read and write wrapped in try/catch.
   - The minted state comes from the API's collection route. Everything else ships with the page.
     The planned times ship too, so the countdown works before the API answers (D-044).
3. **`/pass/[number]`:** 1,000 static pages, each with its own Open Graph image. Check the build
   time; if the images make it too slow, render them once from the exported art.
4. **"How it works"** on `/pass`, in four short steps: join the waitlist, mint in the waitlist
   window, get the app with the same wallet, run in your Founder Sneaker. Link to the full help
   (Part 7). Until `/help` exists, the link goes to the questions at the foot of `/pass` (D-044).
5. **The landing page:** a Founding Pass section linking to `/pass`, and the waitlist form's copy
   becomes "Join the waitlist to mint 48 hours before everyone else". Keep its promise: one email,
   when the waitlist window opens, and nothing else.

## Nobody gets stuck

- Every phase of the schedule shows what's happening now, when the next thing happens, and what
  to do meanwhile (join the waitlist, pick favourites).
- An empty filter result offers to clear the filters.
- If the collection route can't be reached, the gallery still works, says the minted state is
  unavailable, and offers a retry.

## Done when

- Lighthouse: `/pass` scores ≥ 90 on mobile and the landing page keeps its ≥ 95.
- The build time is fine with 1,000 pages.
- Checked on a phone browser.
- The stuck-point check is done.
- Screenshots are taken.

Mark Part 4 **Done**, then stop.
