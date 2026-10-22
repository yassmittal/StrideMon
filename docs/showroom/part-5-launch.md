# Part 5: Launch

**Goal:** the showroom is live at `https://showroom.stridemon.xyz`, the API answers it, the
website links to it, and the X post is drafted. Yash runs every account step; Claude writes the
steps, the config and the copy.

## Read first

- `docs/deployment.md` §11 (the domain), §14 and "Updating the API later"
- `website/vercel.json` (security headers and the CSP), `website/README.md`
- D-050 (the website's header keeps three links), D-051 (search), D-061 (`llms.txt` is built from
  `website/src/content/`: never edit it by hand)
- `website/src/content/help.ts` and `CLAUDE.md` on `bun run help:export-knowledge`
- `social/voice.md`, a recent post in `social/posts/`, and `CLAUDE.md` → DeltaV updates

## Do

1. **Docs first: a `deployment.md` section, "The showroom"**, steps Yash can follow without
   guessing:
   - Vercel: a new project from the same repository, root directory `showroom`, install
     `bun install`, build `bun run build`, output `out`, the same Bun version as the website
   - The domain: add `showroom.stridemon.xyz` in Vercel; at Namecheap, a `CNAME` record for
     `showroom` with the value Vercel shows
   - The API: `SHOWROOM_ALLOWED_ORIGINS=https://showroom.stridemon.xyz` in the server's `.env`,
     then deploy Part 3's API change the usual way and restart PM2
2. **`showroom/vercel.json`:** the website's security headers, with a CSP that allows only what
   the showroom uses: the API origin, Fontshare, Vercel Analytics, and `blob:` if a worker or
   texture needs it. Run `bun run build && bun run start` and confirm the console shows no CSP
   errors anywhere in the visit.
3. **Search:** a sitemap with the one page and a robots file that allows crawlers like the
   website's.
4. **The website links to it** (copy in `website/src/content/`):
   - `/pass`, near the collection: "Walk into the store in 3D"
   - each `/pass/[number]` page: "See it in the 3D store", to the showroom's deep link for that
     design
   - the landing page's Founding Pass section
   - a help answer, "The 3D showroom" (what it is, that it can't mint, what to do if it won't
     load), then `bun run help:export-knowledge`; `llms.txt` through its content source
   - the header stays at three links (D-050) unless Yash says otherwise

   Check the website keeps `?source=showroom` from a pass page through to a waitlist sign-up. If
   it doesn't, make it, small. Redeploying the website and the API is Yash's step.
5. **Yash deploys.** Then check live, on the phone and the laptop: the arrival, the walk, look
   closer, Find, a deep link, a card's button, the minted state (the browser's network tab shows
   the collection route answering the showroom's origin), and the share card in a card preview
   tool.
6. **The X post:** draft it in `social/posts/` per `social/voice.md` (`account:` in the front
   matter, both accounts if it fits), with a plan for a 10 to 15 s screen recording on the phone:
   the lights coming on, Step inside, one stop, a Sneaker up close. Claude never posts.
7. **DeltaV:** remind Yash that this is worth a weekly update, with a two-line draft. Post it only
   with his ok.
8. **Docs:** `showroom/README.md` (where it's hosted), `CLAUDE.md` → Current phase, and the
   status row in `docs/README.md`.

## Done when

- `https://showroom.stridemon.xyz` is live, and Yash has walked it on his phone and the laptop.
- Every link works both ways, with `?source=showroom` arriving on the website.
- The API answers the showroom's origin on the collection route and on no other.
- The X post is drafted and the DeltaV reminder given.

Mark Part 5 **Done**, then stop.
