# StrideMon landing page

The one-page site at `https://stridemon.xyz` (Phase 8.8, D-035, D-040). Next.js 16 + React 19 +
Tailwind CSS v4 on Bun, exported as static files. It is **not** a Bun workspace: it has its own
`package.json` and `bun.lock`, and never imports `@stridemon/*`.

The brief is [`../docs/landing-page-prompt.md`](../docs/landing-page-prompt.md).

## Run it

```bash
cd website
bun install
bun run dev        # http://localhost:3000
bun run build      # writes the static site to out/
bun run start      # serves out/
```

Lint from the repo root: `bun run lint`. Typecheck here: `bun run typecheck`.

## Where things live

| Path | What |
|---|---|
| `src/content/` | Every piece of copy, number, link and address, as typed data |
| `src/content/site.ts` | `siteUrl` (the one place the domain lives), `showroomUrl` and `buildShowroomPassUrl` (the 3D showroom, D-069: linked from `/pass`, every pass, the landing page's Founding Pass section and `/help#showroom`), `apiBaseUrl` and the API routes, `githubRepositoryUrl`, `supportEmail`, the X and YouTube links (D-059), the legal and pass page paths |
| `src/content/legal/` | The privacy policy (`/privacy`) and account deletion (`/delete-account`) pages Google Play asks for (D-039). Keep them true to the app and API |
| `src/content/waitlist.ts` | The waitlist section's copy and error lines, the joined card, the X post's text and the `/waitlist` page's words (D-055, D-059) |
| `src/content/contracts.ts` | Addresses copied from `packages/contracts/deployments/10143.json` |
| `src/content/founding-pass.ts` | The Founding Pass page's copy, the planned schedule, the match quiz and the questions (D-044) |
| `src/content/founding-pass-designs.ts` | **Generated**: the 1,000 designs and their layer labels. Never edit it by hand |
| `src/content/founding-pass-mint.ts` | The mint's copy: "Get ready", the steps, the reveal, and one plain message per problem (D-045) |
| `src/content/help.ts` | The help page (`/help`, D-047): every guide and answer as plain strings, each with an `id` that's its anchor. Mint problems and the app link to those ids: don't rename one without changing `mintProblemHelpTopicIds` and the app's `helpTopicIds` |
| `src/content/help-chat.ts` | The help chatbot's words (D-048). Its answers come from the API, which reads `help.ts` through `bun run help:export-knowledge` (run it after every change to `help.ts`, then redeploy the API) |
| `src/components/help-chat/` | The "Ask a question" pill on `/pass` and `/help`, and its dialog, which loads only when tapped |
| `public/help/` | The help guides' website screenshots (378 × 770 WebP, cut from `media-source/pass-mint-screenshots/`) |
| `src/content/founding-pass-abi.ts` | The four `FoundingPass` reads the site makes, copied by hand (D-045) |
| `public/pass-art/` | **Generated**: each design's card (`cards/0137.svg`) and laced Sneaker (`laced/0137.svg`) |
| `src/lib/founding-pass/` | The design table's helpers, the gallery's filters and quiz, the schedule, the live state and favourites stores, and the mint: its API calls, "Get ready" store, mint flow, Turnstile and chain reads |
| `src/lib/founding-pass/wallet/` | The wallet code (AppKit + wagmi), loaded on demand only (D-045) |
| `src/components/founding-pass/` | The gallery, cards, detail sheet, finder, schedule panel, "Get ready", the mint dialog and the reveal |
| `src/content/under-the-hood.ts` | The landing page's Under the hood section and its three tabs (D-050). Each tab keeps its old section's id, so `/#on-chain` still works |
| `src/content/why-monad.ts` | The Why Monad section, its own dark band after How it works, always shown (D-073); `/#why-monad` lands on it |
| `src/content/game-rules.ts` | `SneakerGame`'s launch config, from `docs/architecture/game-rules.md` |
| `src/components/sections/` | One component per page section |
| `src/components/ui/` | Pills, the 3D store button (`showroom-button.tsx`, the one button that isn't a flat pill, D-073), the hover tooltip (`hover-tip.tsx`: hover and keyboard focus only, never anything needed to go on), cross marks, phone frame, the apps' logos (X, YouTube, WhatsApp, Telegram: Simple Icons' glyphs, CC0), and the client components (reveal, count-up, copy, video, waitlist form, share links) |
| `src/app/` | Layout, home page, `pass/`, `pass/all/` (every pass by number, D-051) and `pass/[number]/` (with their Open Graph images), `waitlist/` (the page a shared post links to, with its own Open Graph image, D-055), `privacy/` and `delete-account/`, `not-found.tsx`, icons, sitemap, robots |
| `src/lib/build-page-metadata.ts` | Every page's title, description, canonical and share cards (D-051). Use it for a new page: Next merges metadata shallowly, so a page that sets `openGraph` by hand loses the layout's image and site name |
| `src/lib/llms/` | `/llms.txt`, `/llms-full.txt` and the pages' Markdown copies (`/index.md`, `/pass.md`, `/pass/all.md`, `/help.md`), built from `src/content/` (D-061). Their own few words are in `src/content/llms.ts` |
| `src/lib/build-structured-data.ts` | Every page's JSON-LD: the home page's graph, `FAQPage` on `/pass` and `/help`, breadcrumbs (D-061) |

A contract redeploy or a rule change must update `src/content/` too (D-035).

## Screenshots

The Android PNGs (1080 × 2340, status bar painted out) live in `public/screenshots/` under the
names in `src/content/screenshots.ts`. A missing file listed there fails the build. `bun run build`
first runs `bun run images`, which writes WebP and AVIF copies at 240–1080 px into
`public/screenshots/optimized/` (gitignored). A static export has no image optimizer, so
`next/image` points at those files through `src/lib/screenshot-image-loader.ts`.

When you replace a screenshot, update its `alt` text in `src/content/screenshots.ts` to match
what the screen shows.

## Demo video

When `public/videos/stridemon-demo.mp4` exists, the hero shows it beside the Sneaker art in place
of the Home screenshot (otherwise the screenshot stays). Its facts live in
`src/content/demo-video.ts`, and the page adds a `VideoObject` to the JSON-LD.

| File | What | Size |
|---|---|---|
| `public/videos/stridemon-demo.mp4` | 56 s demo: sign in, a 3:31 walk at 16×, +15 STRIDE settled, the Sneaker tab, transfer to wallet B. 540 × 1134, 30 fps, H.264, with music (AAC 128 kbps, -16 LUFS, D-052) | 2.5 MB |
| `public/videos/stridemon-demo-poster.webp` | Its poster: the run summary, +15 STRIDE settled | 21 KB |
| `public/videos/stridemon-walk-loop.mp4` | 6 s run-screen loop (12×, +10 → +15 STRIDE) for How it works' Move step, 540 × 1170 | 96 KB |

The demo loads nothing but its poster until the visitor presses play. It uses our own controls
(`src/components/ui/demo-video-player.tsx`), not the browser's: a play button on the poster, chapter
bars on a frosted strip while it plays (pressing one jumps there), a press anywhere else to pause,
a sound button (or M) in the bottom corner, and a replay button at the end. It plays with sound,
only ever from a press. The chapter times are `demoVideoChapters` in
`src/content/demo-video.ts`; they follow the scene starts that `cut-demo-video.sh` prints, so update
them after a re-cut. The loop loads
when its step nears the viewport, plays only on screen, and never shows with reduced motion (the
screenshot stays).

The raw screen recordings live in **`media-source/`**, which is gitignored: they are hundreds of MB
and must never be committed or deployed. The cut uses `video3.mp4` (2026-10-06, STRIDE);
`video1.mp4` and `video2.mp4` are the older SOLE recordings, no longer used. To redo the cut
(from `website/`, with ffmpeg, curl and cwebp). The music, "Fresh" by Bransboynd from Pixabay
(free, no attribution), downloads into `media-source/` on the first run:

```bash
bash scripts/cut-demo-video.sh
```

The script holds every segment (in and out points, speed, held frames), so new recordings mean new
times there. What it runs, per step:

```bash
# 1. Each segment: crop the status bar, 540 wide, constant 30 fps, sped up where speed > 1
ffmpeg -nostdin -ss <start> -t <length> -i media-source/video3.mp4 -an \
  -vf "setpts=(PTS-STARTPTS)/<speed>,crop=880:1848:0:72,scale=540:-2:flags=lanczos,fps=30,format=yuv420p,tpad=…" \
  -c:v libx264 -preset veryfast -crf 12 -r 30 segment-NN.mp4
# 2. Segments of one scene joined with hard cuts
ffmpeg -f concat -safe 0 -i scene-N.txt -c copy scene-N.mp4
# 3. Scenes joined with 0.2 s crossfades (xfade), then the web encode
ffmpeg -i scene-1.mp4 … -filter_complex "[0:v][1:v]xfade=transition=fade:duration=0.2:offset=<t>[faded1];…" \
  -an -c:v libx264 -profile:v high -preset slow -crf 23 -pix_fmt yuv420p -r 30 -movflags +faststart \
  public/videos/stridemon-demo.mp4
# 3b. Music: from 6.4 s in, faded in and out, levelled to -16 LUFS (two-pass loudnorm), muxed as AAC
ffmpeg -i demo-silent.mp4 -i media-source/bransboynd-fresh-457883.mp3 \
  -filter_complex "[1:a]atrim=start=6.4:duration=<demo length>,…,afade=…,loudnorm=…:linear=true[music]" \
  -map 0:v -map "[music]" -c:v copy -c:a aac -b:a 128k public/videos/stridemon-demo.mp4
# 4. Poster
ffmpeg -ss 34.5 -i public/videos/stridemon-demo.mp4 -frames:v 1 poster.png
cwebp -q 80 poster.png -o public/videos/stridemon-demo-poster.webp
# 5. Walk loop: status bar painted black and fitted to the screenshots' aspect
ffmpeg -ss 180 -t 70 -i media-source/video3.mp4 \
  -vf "setpts=(PTS-STARTPTS)/12,crop=880:1906:0:7,drawbox=x=0:y=0:w=880:h=66:color=black:t=fill,scale=540:1170:flags=lanczos,fps=30,format=yuv420p" \
  -an -c:v libx264 -profile:v high -preset slow -crf 22 -pix_fmt yuv420p -r 30 -movflags +faststart \
  public/videos/stridemon-walk-loop.mp4
```

After a re-cut, update `durationSeconds` and `demoVideoChapters` in `src/content/demo-video.ts`
from what the script prints. Keep the demo under 8 MB and each loop under 1.5 MB.

## Founding Pass

`/pass` is the gallery of the 1,000 Founding Passes (D-041, D-044), and `/pass/137` is one pass's
page (1,000 static pages, each with its own Open Graph image, made by `next/og` at build time: the
whole build takes about 18 seconds). Both mint, in the waitlist window and the open mint (D-045).
`/pass/all` lists every pass by number and name, and each pass page links the previous and next
pass, so search engines reach all 1,000 pages within three clicks of the home page (D-051).

**The art and the design table are generated.** After any change to the art (a new renderer),
export them again from the repo root:

```bash
bun run website:export-pass-art
```

It runs the Solidity renderer in a simulation (`RenderPassArt.s.sol`'s `exportWebsiteArt()`), so
the cards are exactly the on-chain images, and checks every name against the cards.

**The live state** (which passes are minted, the last mints, the schedule) comes from the API's
`GET /v1/pass/collection`, fetched in the browser. If it can't be reached, the gallery still works,
says so, and offers a retry, and the countdown runs on the planned times in
`src/content/founding-pass.ts` (`plannedPassScheduleTimes`): **keep them equal to the API's
`PASS_*` settings.** To try other states locally, point the site at a stand-in API:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001 bun run dev
```

**Favourites** stay in the visitor's browser (`localStorage`), never sent anywhere.

**The waitlist form** gives way to a short note once the waitlist window opens (by the planned
times), because joining after that doesn't get anyone into the window (D-043).

### The mint (Part 5, D-045)

- **"Get ready"** (`#get-ready`) and the mint dialog share two steps: the email check (Turnstile, a
  6-digit code, a proof good for 6 hours) and the app's sign-in (connect a wallet, the network step,
  one free SIWE signature). Both stay in the browser (`localStorage`: `stridemon:pass-email-check`,
  `stridemon:pass-sign-in`, plus `stridemon:pass-mint-in-progress` while a mint is queued), so a
  mint is one tap with no wallet prompt. Every error's words are in `src/content/founding-pass-mint.ts`.
- **The wallet code** (Reown AppKit 1.8 + wagmi 2 + viem, `src/lib/founding-pass/wallet/`) loads
  through `next/dynamic` with `ssr: false`, only after "Connect wallet". It must stay that way: it
  doesn't build for the server (a connector's optional modules), and the gallery stays light.
  AppKit's modal lives in our own `<dialog class="wallet-layer">`, so it opens above the sheets.
- **The reveal** reads the minted card from the chain (`FoundingPass.imageSvg`, through
  `src/lib/founding-pass/pass-chain-reads.ts`), as do the "already a founder" checks. The four
  read functions are copied by hand into `src/content/founding-pass-abi.ts`.
- **Public settings** in `src/content/site.ts`, each with an override for a local run:
  `reownProjectId` (`NEXT_PUBLIC_REOWN_PROJECT_ID`), `monadRpcUrl` (`NEXT_PUBLIC_MONAD_RPC_URL`),
  `turnstileSiteKey` (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`), and `foundingPassContract.address` in
  `src/content/contracts.ts` (`NEXT_PUBLIC_FOUNDING_PASS_ADDRESS`). The Turnstile site key is the
  `stridemon.xyz` widget's (`0x4AAAAAAFRleBaVJ9eZuqBJ`); its secret lives only in the hosted API's
  `.env`. Reown's dashboard must allow `stridemon.xyz`. "Get the app" is `appDownloadUrl`.

### Try the mint locally

Never against testnet: the local stack runs its own Anvil, contracts, database and API (D-045).
From the repo root, once: `bun run db:start` and `bun run contracts:build`. Then:

```bash
cd apps/api && bun run pass:local-stack            # prints the website command below
cd website && NEXT_PUBLIC_API_BASE_URL=http://localhost:3001 \
  NEXT_PUBLIC_MONAD_RPC_URL=http://127.0.0.1:8546 \
  NEXT_PUBLIC_FOUNDING_PASS_ADDRESS=0xe7f1725e7734ce288f8367e1bb143e90bb3f0512 \
  NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA bun run dev
```

Email codes print in the stack's terminal. Its flags set up each state to check:
`--phase preview|waitlistWindow|openMint|openToAll`, `--waitlist-email <email>` (repeatable, joined
before the window), `--premint 999` (about 3 minutes; the last pass is #0001, for "all minted"),
`--turnstile fail`, `--slow-blocks` (a block every 15 seconds) and `--early-access` (the app's gate
on). It also prints the app's `.env` lines: the app's check is `docs/device-testing.md` §11. Each run starts from a fresh
chain and database. Wallets connect to their usual Monad Testnet: only the free signature touches
the wallet, and the mint happens on the stack's Anvil.

**The help chatbot** ("Ask a question" on `/pass` and `/help`, D-048) answers on the local stack
when `apps/api/.env` has `BEDROCK_API_KEY`: each answer costs about $0.003 of real Bedrock usage.
Without the key it says it can't answer right now, with a link to the help page.

**On a phone** (MetaMask's browser, or a phone browser with WalletConnect): a phone can't reach
`localhost`, and wallets want `https`. Give the site and the API public `https` addresses with a
free tunnel (for example `cloudflared tunnel --url http://localhost:3000` and the same for `3001`
and `8546`), start the stack with `--origin <the site's tunnel address>` (it allows that origin and
signs in for its domain), and start the website with the three tunnel addresses in place of the
`localhost` ones. Or check on the real site once the API is redeployed and minting is open.

## Waitlist

The `#waitlist` section (D-037) posts `{ email, turnstileToken, phonePlatform?, source?, inviteCode?,
emailProof?, website? }` to the StrideMon API at `waitlistApiUrl` (`POST /v1/waitlist`). `website` is a
hidden honeypot. The page's `?source=` goes along when it's 1–32 characters of `[a-z0-9-]`, so a link
such as `https://stridemon.xyz/?source=x-stridemon` credits the X account that shared it. The first
`?source=` of a visit is kept for the tab (`sessionStorage`, D-069), so someone who arrives on
`/pass/137?source=showroom` and joins on another page still counts for the showroom; a page whose
own link has a `?source=` wins.

**The invite loop (D-056, D-057):**

- **Continue with Google** comes first (`components/waitlist/google-sign-in-button.tsx`). Google's
  script loads only when the form nears the screen. In apps' own browsers (Instagram, Facebook,
  LinkedIn, Android WebViews, `lib/in-app-browser.ts`) it's one line pointing at the email path.
  The client id is `googleClientId` in `src/content/site.ts` (`NEXT_PUBLIC_GOOGLE_CLIENT_ID`
  overrides it; an empty value hides the button, say for a tunnel, whose hostname can't be a
  Google origin). Its authorised origins are `https://stridemon.xyz`, `http://localhost` and
  `http://localhost:3000` (`docs/deployment.md` §14.1).
- **Turnstile** (`join-waitlist`) stays out of sight unless it needs a tap.
- **`?ref=`** is read on every page (`ArrivalInviteKeeper` in the layout) and kept in
  `sessionStorage` for the visit, so a friend who browses `/pass` first still joins with it. The
  first code of the visit stays.
- **The joined card** (D-059) is a ticket (the email with **Change**, and when the window opens)
  and one invite block (`components/waitlist/invite-panel.tsx`): the early hour's rule, the link
  with Copy, and the share icons (`components/ui/share-links.tsx`: WhatsApp, Telegram, X and the
  phone's share sheet, each in its own colour). Every share link carries `ref` and its own
  `source` (`invite-whatsapp`, `invite-telegram`, `invite-x`, `invite-share`, `invite-copy`).
  The count shows above the rule. A sign-up from before D-060, or one whose token ran out, gets a
  link to its invites page instead.
- **Joining checks the email (D-060).** Continue with Google, or Join the waitlist with an email,
  which sends a 6-digit `waitlist` code (counted in the API's daily budget) and joins with the
  proof once the code checks. No code, no join: when today's codes are used up, the page offers
  Google or tomorrow. The API still takes a join without a proof (the old live form), but the site
  never sends one.
- **Coming back (D-059).** Joining saves `stridemon:waitlist-joined` in `localStorage` (the email
  and the invite link), beside the invites token. With them, the form shows the joined card
  instead, and the token adds the live count. Change (on the card) and Use a different email (on
  `/waitlist/invites`) clear both.
- **`/waitlist/invites`** (static, `noindex`): check your email (Google or a code), then see the
  count, the link and the early hour. The invites token stays in `localStorage` for 30 days
  (`stridemon:waitlist-invites`).
- The visitor's own code (`stridemon:waitlist-own-invite-code`) rides on the share row of a pass's
  details and after a mint.
- **The count** (`GET /v1/waitlist/count`) shows under the intro only from 1,000 sign-ups.
- The early hour's start is `plannedEarlyHourStartsAt` in `src/content/founding-pass.ts`: keep it
  equal to the API's (`PASS_WAITLIST_WINDOW_STARTS_AT` minus `PASS_EARLY_HOUR_MINUTES`).

To try it on the local stack, start it with `--phase preview` (friends who confirm in the next hour
count) and point the site at it as in "Try the mint locally". Codes print in the stack's terminal.

After joining, the X post (`waitlistShareText`) links `/waitlist`, which leads with the same form
and has its own share image (`app/waitlist/opengraph-image.tsx`), so X shows a card made for the
post. If you change the post, keep it under 280 characters with the link (X counts a link as 23).

The API only answers browsers from the origins in its `WAITLIST_ALLOWED_ORIGINS`. To try the form
locally, run the API with `WAITLIST_ALLOWED_ORIGINS=http://localhost:3000` on another port, and
point the site at it for that run (`NEXT_PUBLIC_API_BASE_URL` moves every API route; the older
`NEXT_PUBLIC_WAITLIST_API_URL` is ignored since the invites, D-056):

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001 bun run dev
```

Count the sign-ups by source (against Atlas, with `mongosh`):

```js
db.waitlistSignups.aggregate([{ $group: { _id: '$source', signups: { $sum: 1 } } }, { $sort: { signups: -1 } }])
```

## Fonts

Satoshi's licence doesn't allow self-hosting the files. The build fetches Fontshare's CSS and
inlines it, so the files still come from Fontshare's CDN but no stylesheet blocks first paint. If
that fetch fails, the page links the stylesheet instead. The Open Graph image fetches Satoshi's
TTF the same way at build time. IBM Plex Mono comes from `next/font/google`.

## Answer engines (D-061)

For ChatGPT, Perplexity, Claude, Gemini and Google's AI answers, on top of the usual SEO (D-051):

- **`/llms.txt`** (llmstxt.org) lists the key facts and links to the Markdown copies;
  **`/llms-full.txt`** is the home page, the Founding Pass page and the help in one file. Each
  copy is a route in `src/app/` (`index.md/`, `pass.md/`, `help.md/`, `pass/all.md/`), written at
  build time from the same content the page renders, so they never need editing by hand. Each
  page links its copy with `rel="alternate" type="text/markdown"` (`buildPageMetadata`'s
  `markdownPath`), and `vercel.json` gives each copy a `Link: rel="canonical"` header to its page.
- **`robots.txt`** names the AI crawlers (search, user and training) and allows them all.
- **`contentUpdatedOn`** (`src/content/site.ts`) is the date in the sitemap's `lastmod`, the
  structured data and `llms.txt`. Change it when the main pages' words really change.
- **IndexNow:** after a deploy, run `bun run indexnow` from `website/` (after `bun run build`). It
  sends the sitemap's URLs to Bing and the other IndexNow engines; `--dry-run` only lists them. The
  key file is `public/<indexNowKey>.txt`.
- **Check it:** `curl https://stridemon.xyz/llms.txt`, Google's Rich Results Test on `/`, `/pass`
  and `/help`, and now and then ask ChatGPT, Perplexity and Claude "what is StrideMon?" and "is the
  StrideMon Founding Pass free?" to see what they quote.

## Deploy (Vercel, free plan)

1. New project from the repo. Root directory `website`, framework Next.js, install command
   `bun install`, build command `bun run build`.
2. Domains (D-040): `stridemon.xyz` (the canonical one), `www.stridemon.xyz` and the old
   `stridemon.yashmittal.xyz`, all on this project. The other two are set to **Redirect to
   `stridemon.xyz` (308)** in Project → Settings → Domains, which keeps the path and query string.
   Don't move this into `vercel.json`: a `/:path*` rule there misses the home page.
   DNS for `stridemon.xyz` is on Namecheap (`docs/deployment.md` §11).

`vercel.json` serves the generated `opengraph-image`, `twitter-image` and `apple-icon` (which
have no file extension in a static export) as `image/png`, the pass pages' ones included, and the
llms and Markdown files as UTF-8 text (D-061).

After a deploy that changes words, run `bun run indexnow` (above).
