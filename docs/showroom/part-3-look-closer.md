# Part 3: Look closer and find

**Goal:** tap any Sneaker and the camera comes to it with a quiet card; anyone can put any of the
1,000 on the counter's stand by number, name or "Surprise me"; and the card knows whether a design
is minted, from the API.

## Read first

- The brief §4, §5.3, §5.4, §6.4, §7.4, §7.5 and §10 (as decided); the README's Words rule
- `website/src/lib/founding-pass/pass-collection.ts` and `use-pass-collection.ts` (the live state,
  its types and its refresh: 15 s while minting, 2 min otherwise), `pass-schedule.ts` and
  `website/src/content/founding-pass.ts` (the schedule's words)
- `docs/architecture/backend-api.md` → The Founding Pass (`GET /v1/pass/collection`, CORS and
  limits), `apps/api/src/plugins/cors.ts`, `apps/api/src/cli/start-local-pass-stack.ts`
- `website/README.md` → the local stack
- `showroom/src/visit/` and `showroom/src/store/`

## Build

1. **The API's showroom origin** (brief §7.5). Docs first: `backend-api.md` (CORS),
   `deployment.md`'s settings table, `apps/api/.env.example`. Then `SHOWROOM_ALLOWED_ORIGINS` in
   `plugins/cors.ts`: it opens `GET /v1/pass/collection` and nothing else. A test proves the
   showroom's origin gets CORS on that route and on no other. `pass:local-stack` allows
   `http://localhost:3002` too. Don't deploy: that's Part 5.
2. **The live state:** `src/lib/collection/` reads the route with the website's timing. Copy the
   response types by hand (no shared package). If it can't be reached, everything still works, a
   quiet line says the minted state is unavailable, and it retries.
3. **Tap to look closer:** every Sneaker you can see is a tap target (its whole cell on a shelf,
   its area in a lightbox or a poster, the stand), told apart from a drag. The camera comes to
   about half a metre in front of it, square on, and its sharp picture swaps in (brief §5.3). The
   card opens (brief §6.4): number, name, rarity, the state, "Free to mint. Can't be sent or
   sold.", and the one button by the schedule. ← → and small arrows step to its neighbours on the
   same wall. Esc, "Back" or a tap outside returns to the stop.
4. **Find a Sneaker:** a small sheet with one field (a number from 1 to 1,000, or a name, matched
   as you type against the design table) and "Surprise me" (brief §10). Picking one fades the
   stand's Sneaker to it, redraws the stand's little card, walks the camera to the stand (a fade
   for long jumps) and opens the card.
5. **The deep link** (brief §10): opening the showroom with a design in the link skips the street
   and starts at the stand with that design and its card. A bad number shows a calm line and the
   walk.
6. **The counter's screen** (brief §10): #0137 until the schedule says minting has started, then
   the newest of the collection's recent mints.
7. **A list for keyboards and screen readers:** a visually hidden list of the Sneakers at the
   current stop, each a button that looks closer. `/` opens Find.

## Check

- With `cd apps/api && bun run pass:local-stack --premint 40` (never testnet), a minted design's
  card says Minted with its founder number, "Surprise me" never picks one of them, and a mint made
  on the local website shows within the refresh.
- Stop the local API: the quiet line shows, the cards say they couldn't check, and everything else
  still works.
- Every card's button lands on the right `stridemon.xyz/pass/NNNN` with `?source=showroom`.

## Nobody gets stuck

- A search with no match says so and offers "Surprise me".
- From look closer, one tap gets you back to the walk.
- A tap that lands between Sneakers does nothing surprising.

## Done when

- The checks above pass, and the API test passes with the rest of `bun test` in `apps/api`.
- On his phone, Yash taps Sneakers on each wall, finds one by number and one by name, opens a deep
  link, and follows a card's button to the website.
- Typecheck, lint and tests pass.

Mark Part 3 **Done**, then stop.
