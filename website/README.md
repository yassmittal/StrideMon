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
| `src/content/site.ts` | `siteUrl` (the one place the domain lives) and `githubRepositoryUrl` |
| `src/content/contracts.ts` | Addresses copied from `packages/contracts/deployments/10143.json` |
| `src/content/game-rules.ts` | `SneakerGame`'s launch config, from `docs/architecture/game-rules.md` |
| `src/components/sections/` | One component per page section |
| `src/components/ui/` | Pills, labels, cross marks, phone frame, and the three client components (reveal, count-up, copy) |
| `src/app/` | Layout, page, Open Graph image, icons, sitemap, robots |

A contract redeploy or a rule change must update `src/content/` too (D-035).

## Screenshots

The Android PNGs (1080 × 2340, status bar painted out) live in `public/screenshots/` under the
names in `src/content/screenshots.ts`. A missing file listed there fails the build. `bun run build`
first runs `bun run images`, which writes WebP and AVIF copies at 240–1080 px into
`public/screenshots/optimized/` (gitignored). A static export has no image optimizer, so
`next/image` points at those files through `src/lib/screenshot-image-loader.ts`.

The demo section appears only when `public/screenshots/demo-walk.mp4` exists (with
`demo-walk-poster.png` as its poster).

When you replace a screenshot, update its `alt` text in `src/content/screenshots.ts` to match
what the screen shows.

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
