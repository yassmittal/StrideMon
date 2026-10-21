# Part 3: The collection

**Goal:** all 1,000 designs are on the shelves of their chapels, the vault of casts hangs over the
nave, and both follow the live minted state. The frame rate holds with a full chapel on the
phone.

## Read first

- The brief §3, §5.4, §7.3, §7.4 and §8
- `website/src/lib/founding-pass/use-pass-collection.ts` and `pass-collection.ts` (the live
  state, its types and its refresh: 15 s while minting, 2 min otherwise)
- `docs/architecture/backend-api.md` → The Founding Pass (`GET /v1/pass/collection`, CORS and
  limits), `apps/api/src/plugins/cors.ts`, `apps/api/src/cli/start-local-pass-stack.ts`
- `website/README.md` → the local stack
- `showroom/src/world/floor-plan.ts`, `showroom/src/sneakers/sneaker-look.ts`

## Build

1. **The API's showroom origin** (brief §7.4). Docs first: `backend-api.md` (CORS),
   `deployment.md`'s settings table, `apps/api/.env.example`. Then `SHOWROOM_ALLOWED_ORIGINS`
   in `plugins/cors.ts`: it opens `GET /v1/pass/collection` and nothing else. A test proves the
   showroom's origin gets CORS on that route and on no other. `pass:local-stack` allows
   `http://localhost:3002` too. Don't deploy: that's Part 6.
2. **The live state:** `src/lib/collection/` reads the route with the website's refresh timing.
   Copy the response types by hand (no shared package). If it can't be reached, everything
   still works, a quiet line says the minted state is unavailable, and it retries.
3. **The shelves:** each chapel's 100 designs, in number order, on its steel shelves, each with
   its placard (`#0137 / ROSE HIKER NIGHT / COMMON · AVAILABLE`). Measure drei `Text` with 100
   placards a chapel; if it's slow, draw each wall's placards into one texture instead.
4. **Levels of detail** (brief §5.4): full relief near, the textured slab further away, swapped
   with a short cross-fade, never a pop. Add the atlases to `export-art` (rasterise the laced
   SVGs, for example with `sharp`; WebP; sizes chosen by the budget).
5. **Streaming:** a chapel's data loads when you're one stop away. Its relief meshes are built in
   a Web Worker and handed back as buffers. Until a Sneaker arrives, its place on the shelf is
   empty and lit, and it fades in.
6. **The vault:** 1,000 white plaster casts, one instanced mesh per template silhouette, hung on
   thin rods. Each bay of the nave carries the casts of the two chapels beside it, in number order.
   A minted design's cast takes its drawing from the atlas, fading over about two seconds when it
   changes while you watch. A pending mint stays white.
7. **The apse:** the Sneaker of the day (the same design for everyone on a given UTC day, picked
   from the date) until the schedule says minting has started and there's a mint; then the latest
   mint, with "Just minted · #0137 · Founder 42" in the placard's words.

## Check

- Every design is on the right chapel's shelf; the names and numbers match `/pass`.
- With `cd apps/api && bun run pass:local-stack --premint 40` (never testnet), the vault shows 40
  coloured casts, and a mint made on the local website colours one more within the refresh.
- Stop the local API: the quiet line shows, and everything else still works.
- On the phone, inside a full chapel: ≥ 50 fps. Each chapel's download ≤ 400 KB.

## Done when

- The checks above pass, and the API test passes with the rest of `bun test` in `apps/api`.
- Yash has walked a full chapel and looked up at the vault on his phone.
- Typecheck, lint and tests pass.

Mark Part 3 **Done**, then stop.
