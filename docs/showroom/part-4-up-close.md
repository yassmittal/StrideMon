# Part 4: Up close

**Goal:** any Sneaker can be taken off the shelf, turned in your hands, read, shared and followed
to its page on `stridemon.xyz`. Anyone can find any design by number or name in a few seconds.

## Read first

- The brief §4 and §6.3, and the README's Words rule
- `website/src/content/founding-pass.ts` (the schedule's words) and
  `website/src/lib/founding-pass/pass-schedule.ts`, `pass-gallery-view.ts` (the filters) and
  `pass-design.ts` (the layers in words, similar designs)
- `website/src/lib/build-page-metadata.ts` and D-051 (titles, canonicals, share cards)
- pmndrs `shoe-configurator` and `image-gallery` (`references.md`)

## Build

1. **Lift:** tap a Sneaker and it leaves the shelf on a smooth path to the camera while the room
   dims and softens behind it (depth of field, only here). It idles on a slow turn. Drag turns it,
   with weight (any yaw, a limited tilt). Pinch or scroll looks closer, within limits; a
   double-tap resets. Esc, the close button or a tap outside puts it back the way it came.
2. **The placard sheet** (a bottom sheet on a phone, a side panel on a laptop):
   - the number, the name and the rarity; the layers in the website's words (template, family,
     colourway, options, laces)
   - the state: Available, Being minted, or Minted with its founder number
   - "Free to mint. Can't be sent or sold."
   - one button, by the schedule, in the words `/pass` uses: before the window, "See it on
     stridemon.xyz" (favourite it, join the waitlist); in the waitlist window, "Mint it on
     stridemon.xyz" with "For people on the waitlist"; in the open mint, "Mint it on
     stridemon.xyz"; once minted, "See it on stridemon.xyz". Every link carries
     `?source=showroom`.
   - previous and next in its chapel, and Share (the system share sheet, or copy the link)
3. **Find a Sneaker:** search by number or name, filters (template, family, rarity, available
   only) and "Surprise me" (an available design). Picking one walks the camera there (a fade for
   long jumps) and lifts it.
4. **Deep links:** `/pass/[number]`, 1,000 static pages that open the showroom up close on that
   design. Titles like "#0137 Rose Hiker Night in 3D · StrideMon Showroom"; the canonical is the
   website's `https://stridemon.xyz/pass/0137`. For the share image, use the website's pass
   image if its URL is stable (check the website's build output); otherwise render one from the
   laced SVG at build time, as the website does. Check the build time with 1,000 pages.
5. **Keyboard:** Tab reaches every control, Enter lifts, ← → move to neighbours, Esc puts back,
   `/` opens Find. Focus is always visible.

## Nobody gets stuck

- A search with no result says so and offers to clear the filters.
- `/pass/1001` or `/pass/abc` shows a calm not-found page with "Find a Sneaker" and "Go to the
  hall".
- When the minted state is unavailable, the placard says so and the button still goes to the
  design's page.

## Done when

- On his phone, Yash finds a design by number, turns it, shares the link; the link opens straight
  on that design; the button lands on the right `stridemon.xyz/pass/…` page with
  `?source=showroom`.
- The stuck-point check is done.
- Typecheck, lint and tests pass.

Mark Part 4 **Done**, then stop.
