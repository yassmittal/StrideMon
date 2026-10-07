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
| `src/content/site.ts` | `siteUrl` (the one place the domain lives), `githubRepositoryUrl`, `waitlistApiUrl`, `supportEmail` and the legal page paths |
| `src/content/legal/` | The privacy policy (`/privacy`) and account deletion (`/delete-account`) pages Google Play asks for (D-039). Keep them true to the app and API |
| `src/content/waitlist.ts` | The waitlist section's copy and error lines |
| `src/content/contracts.ts` | Addresses copied from `packages/contracts/deployments/10143.json` |
| `src/content/game-rules.ts` | `SneakerGame`'s launch config, from `docs/architecture/game-rules.md` |
| `src/components/sections/` | One component per page section |
| `src/components/ui/` | Pills, labels, cross marks, phone frame, and the client components (reveal, count-up, copy, video, waitlist form) |
| `src/app/` | Layout, home page, `privacy/` and `delete-account/`, Open Graph image, icons, sitemap, robots |

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
| `public/videos/stridemon-demo.mp4` | 56 s demo: sign in, a 3:31 walk at 16×, +15 STRIDE settled, the Sneaker tab, transfer to wallet B. 540 × 1134, 30 fps, H.264, no audio | 1.6 MB |
| `public/videos/stridemon-demo-poster.webp` | Its poster: the run summary, +15 STRIDE settled | 21 KB |
| `public/videos/stridemon-walk-loop.mp4` | 6 s run-screen loop (12×, +10 → +15 STRIDE) for How it works' Move step, 540 × 1170 | 96 KB |

The demo loads nothing but its poster until the visitor presses play. It uses our own controls
(`src/components/ui/demo-video-player.tsx`), not the browser's: a play button on the poster, chapter
bars on a frosted strip while it plays (pressing one jumps there), a press anywhere else to pause,
and a replay button at the end. The chapter times are `demoVideoChapters` in
`src/content/demo-video.ts`; they follow the scene starts that `cut-demo-video.sh` prints, so update
them after a re-cut. The loop loads
when its step nears the viewport, plays only on screen, and never shows with reduced motion (the
screenshot stays).

The raw screen recordings live in **`media-source/`**, which is gitignored: they are hundreds of MB
and must never be committed or deployed. The cut uses `video3.mp4` (2026-10-06, STRIDE);
`video1.mp4` and `video2.mp4` are the older SOLE recordings, no longer used. To redo the cut
(from `website/`, with ffmpeg and cwebp):

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

## Waitlist

The `#waitlist` section (D-037) posts `{ email, phonePlatform?, source?, website? }` to the
StrideMon API at `waitlistApiUrl` (`POST /v1/waitlist`). `website` is a hidden honeypot. The
page's `?source=` goes along when it's 1–32 characters of `[a-z0-9-]`, so a link such as
`https://stridemon.xyz/?source=x-stridemon` credits the X account that shared it.

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
2. Domains (D-040): `stridemon.xyz` (the canonical one), `www.stridemon.xyz` and the old
   `stridemon.yashmittal.xyz`, all on this project with no dashboard redirect. `vercel.json`
   308-redirects the other two to `https://stridemon.xyz`, keeping the path and query string.
   DNS for `stridemon.xyz` is on Namecheap (`docs/deployment.md` §11).

`vercel.json` also serves the generated `opengraph-image`, `twitter-image` and `apple-icon` (which
have no file extension in a static export) as `image/png`.
