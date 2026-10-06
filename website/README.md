# StrideMon landing page

The one-page site at `https://stridemon.yashmittal.xyz` (Phase 8.8, D-035). Next.js 16 + React 19 +
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
| `src/content/site.ts` | `siteUrl` (the one place the domain lives), `githubRepositoryUrl` and `waitlistApiUrl` |
| `src/content/waitlist.ts` | The waitlist section's copy and error lines |
| `src/content/contracts.ts` | Addresses copied from `packages/contracts/deployments/10143.json` |
| `src/content/game-rules.ts` | `SneakerGame`'s launch config, from `docs/architecture/game-rules.md` |
| `src/components/sections/` | One component per page section |
| `src/components/ui/` | Pills, labels, cross marks, phone frame, and the client components (reveal, count-up, copy, video, waitlist form) |
| `src/app/` | Layout, page, Open Graph image, icons, sitemap, robots |

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
| `public/videos/stridemon-demo.mp4` | 78 s demo: sign in, walk, reward, repair, upgrade, transfer. 540 × 1136, 30 fps, H.264, no audio | 2.1 MB |
| `public/videos/stridemon-demo-poster.webp` | Its poster: Home with Sneaker #2 | 19 KB |
| `public/videos/stridemon-walk-loop.mp4` | 5 s run-screen loop (12×) for How it works' Move step, 540 × 1170 | 90 KB |

The demo loads nothing but its poster until the visitor presses play. The loop loads
when its step nears the viewport, plays only on screen, and never shows with reduced motion (the
screenshot stays).

The raw screen recordings live in **`media-source/`**, which is gitignored: they are 190 MB and
must never be committed or deployed. To redo the cut (from `website/`, with ffmpeg and cwebp):

```bash
bash scripts/cut-demo-video.sh
```

The script holds every segment (source, in and out points, speed), so new recordings mean new
times there. What it runs, per step:

```bash
# 1. Each segment: crop the status bar, 540 wide, constant 30 fps, sped up where speed > 1
ffmpeg -nostdin -ss <start> -t <length> -i media-source/video2.mp4 -an \
  -vf "setpts=(PTS-STARTPTS)/<speed>,crop=586:1232:0:48,scale=540:-2:flags=lanczos,fps=30,format=yuv420p" \
  -c:v libx264 -preset veryfast -crf 12 -r 30 segment-NN.mp4
# 2. Segments of one chapter joined with hard cuts
ffmpeg -f concat -safe 0 -i chapter-N.txt -c copy chapter-N.mp4
# 3. Chapters joined with 0.2 s crossfades (xfade), then the web encode
ffmpeg -i chapter-1.mp4 … -filter_complex "[0:v][1:v]xfade=transition=fade:duration=0.2:offset=<t>[faded1];…" \
  -an -c:v libx264 -profile:v high -preset slow -crf 23 -pix_fmt yuv420p -r 30 -movflags +faststart \
  public/videos/stridemon-demo.mp4
# 4. Poster
ffmpeg -ss 12.5 -i public/videos/stridemon-demo.mp4 -frames:v 1 poster.png
cwebp -q 80 poster.png -o public/videos/stridemon-demo-poster.webp
# 5. Walk loop: status bar painted black and fitted to the screenshots' aspect
ffmpeg -ss 190.2 -t 62.8 -i media-source/video2.mp4 \
  -vf "setpts=(PTS-STARTPTS)/12,crop=586:1270:0:5,drawbox=x=0:y=0:w=586:h=43:color=black:t=fill,scale=540:1170:flags=lanczos,fps=30,format=yuv420p" \
  -an -c:v libx264 -profile:v high -preset slow -crf 22 -pix_fmt yuv420p -r 30 -movflags +faststart \
  public/videos/stridemon-walk-loop.mp4
```

After a re-cut, update `durationSeconds` in `src/content/demo-video.ts` from what the script
prints. Keep the demo under 8 MB and each loop under 1.5 MB.

## Waitlist

The `#waitlist` section (D-037) posts `{ email, phonePlatform?, source?, website? }` to the
StrideMon API at `waitlistApiUrl` (`POST /v1/waitlist`). `website` is a hidden honeypot. The
page's `?source=` goes along when it's 1–32 characters of `[a-z0-9-]`, so a link such as
`https://stridemon.yashmittal.xyz/?source=x-stridemon` credits the X account that shared it.

The API only answers browsers from the origins in its `WAITLIST_ALLOWED_ORIGINS`. To try the form
locally, run the API with `WAITLIST_ALLOWED_ORIGINS=http://localhost:3000` on another port, and
point the site at it for that run:

```bash
NEXT_PUBLIC_WAITLIST_API_URL=http://localhost:3001/v1/waitlist bun run dev
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

## Deploy (Vercel, free plan)

1. New project from the repo. Root directory `website`, framework Next.js, install command
   `bun install`, build command `bun run build`.
2. Add the domain `stridemon.yashmittal.xyz`. The `*.yashmittal.xyz` wildcard already points at
   Vercel, so no DNS record is needed.

`vercel.json` serves the generated `opengraph-image`, `twitter-image` and `apple-icon` (which
have no file extension in a static export) as `image/png`.
