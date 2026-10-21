# Part 6: Launch

**Goal:** the showroom is live at `https://showroom.stridemon.xyz`, the API answers it, the
website links to it, and the X post is drafted. Yash runs every account step; Claude writes the
steps, the config and the copy.

## Read first

- `docs/deployment.md` §11 (the domain), §14 and "Updating the API later"
- `website/vercel.json` (security headers and the CSP), `website/README.md`
- D-050 (the website's header keeps three links), D-051 (search), D-061 (`llms.txt` is built from
  `website/src/content/`: never edit it by hand)
- `social/voice.md`, a recent post in `social/posts/`, and `CLAUDE.md` → DeltaV updates

## Do

1. **Docs first: `deployment.md` §16, "The showroom"**, steps Yash can follow without guessing:
   - Vercel: a new project from the same repository, root directory `showroom`, install
     `bun install`, build `bun run build`, output `out`, the same Bun version as the website
   - The domain: add `showroom.stridemon.xyz` in Vercel; at Namecheap, a `CNAME` record for
     `showroom` with the value Vercel shows
   - The API: `SHOWROOM_ALLOWED_ORIGINS=https://showroom.stridemon.xyz` in the server's `.env`,
     then deploy Part 3's API change the usual way and restart PM2
2. **`showroom/vercel.json`:** the website's security headers, with a CSP that allows only what
   the showroom uses: the API origin, Vercel Analytics, `blob:` workers, and
   `'wasm-unsafe-eval'` only if a texture decoder needs it. Run `bun run build && bun run start`
   and confirm the console shows no CSP errors on any path.
3. **Search:** the showroom's sitemap lists its home page (the 1,000 deep links point their
   canonicals at the website). Its robots file allows crawlers like the website's does.
4. **The website links to it** (copy in `website/src/content/`):
   - `/pass`, near the collection: "Walk through all 1,000 in 3D"
   - each `/pass/[number]` page: "See it in 3D", to `showroom.stridemon.xyz/pass/0137`
   - the landing page's Founding Pass section
   - `llms.txt`, through its content source
   - the header stays at three links (D-050) unless Yash says otherwise

   Check the website keeps `?source=showroom` from a pass page through to a waitlist sign-up. If
   it doesn't, make it, small. Redeploying the website is Yash's step.
5. **Yash deploys.** Then check live, on the phone and the laptop: the arrival, a chapel, a deep
   link, the placard's button, the vault's minted state (the browser's network tab shows the
   collection route answering the showroom's origin), and the share card of a deep link in a card
   preview tool.
6. **The X post:** draft it in `social/posts/` per `social/voice.md` (`account:` in the front
   matter, both accounts if it fits), with a plan for a 10 to 15 s screen recording of the walk on
   the phone. Claude never posts.
7. **DeltaV:** remind Yash that this is worth a weekly update, with a two-line draft. Post it only
   with his ok.
8. **Docs:** `showroom/README.md` (where it's hosted), `CLAUDE.md` → Current phase, and the
   status row in `docs/README.md`.

## Done when

- `https://showroom.stridemon.xyz` is live, and Yash has walked it on his phone and the laptop.
- Every link works both ways, with `?source=showroom` arriving on the website.
- The API answers the showroom's origin on the collection route and on no other.
- The X post is drafted and the DeltaV reminder given.

Mark Part 6 **Done**, then stop.
