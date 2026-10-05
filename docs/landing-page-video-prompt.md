# Landing Page Video Prompt (Phase 8.8)

The brief for turning Yash's two screen recordings into the landing page's demo video. Paste
everything below the line into a fresh Claude Code session started in the repo root (`monad/`).

What's known about the recordings (checked 2026-10-05):

| File | Length | Size | Video | Audio |
|---|---|---|---|---|
| `website/public/screenshots/video1.mp4` | 7 min 07 s | 106 MB | H.264, 586 × 1280, ~24 fps (variable) | AAC |
| `website/public/screenshots/video2.mp4` | 7 min 45 s | 82 MB | H.264, 586 × 1280, 23.976 fps | AAC |

**Don't commit before this is done:** everything in `website/public/` is deployed, and these two
files are far too large to ship. Step 1 of the prompt moves them out.

---

## The prompt

You're preparing the demo video for StrideMon's landing page (`website/`, Phase 8.8, D-035). Two
raw Android screen recordings exist. Your job: look at them, cut them into a short demo that tells
the game's story, encode it for the web, and place it on the page. Read these first:

- `CLAUDE.md` (repo rules: **never run git commands**, docs before code)
- `website/README.md` (how the site is built, the screenshot pipeline, the demo section)
- `docs/landing-page-prompt.md` (the page's brief: tone, motion rules, SEO, the "Don't" list)
- `website/src/components/sections/demo-section.tsx`, `website/src/content/screenshots.ts` and
  `website/src/app/page.tsx` (the demo section shows only when its video file exists)

`ffmpeg` and `ffprobe` are installed (`/opt/homebrew/bin`). You can't watch video directly, so you
**see it through frames**: extract stills and read them as images. Work in your scratchpad
directory for every frame and draft; only the final files go into the repo.

### 1. Move the raw files out of `public/`

1. Create `website/media-source/` and move `video1.mp4` and `video2.mp4` there from
   `website/public/screenshots/`.
2. Add `website/media-source/` to the root `.gitignore` (under the landing page block), so the
   raw recordings are never committed or deployed.
3. Confirm `website/public/` holds no raw video.

### 2. See what's in them

For each video:

1. `ffprobe` its duration, frame rate and streams.
2. Build **contact sheets**: one frame every 2 seconds, small (about 180 px wide), tiled 6 × 5,
   so one image covers 60 seconds. Name each sheet by its time range (for example
   `video1_000-060s.png`) and keep a record of which tile is which second. Example:

   ```bash
   ffmpeg -v error -i input.mp4 -ss 0 -t 60 \
     -vf "fps=1/2,scale=180:-2,tile=6x5" -frames:v 1 video1_000-060s.png
   ```

3. Read every sheet. Wherever something important happens (a button press, a wallet sheet, the
   reward appearing, a transfer confirming), extract full-size frames every 0.5 s around it to
   find exact cut points.
4. Write a **timeline** per video in a scratchpad markdown file: a table of
   `start – end | what's on screen | keep / speed up / cut`.
5. Check for **anything private or messy**: notifications, other apps, messages, contacts, a
   low-battery or status bar you'd crop, the MetaMask seed or password screens, the phone's home
   screen. List them with timestamps. Wallet addresses and testnet balances are public and fine.
6. Note the audio: if it's only phone sounds or silence, it gets dropped. If there's narration
   worth keeping, say so and ask.

### 3. Propose the edit, then stop

Send me the two timelines and a short edit plan, then **wait for my go-ahead**. The plan should
cover:

- **The main demo video** (required): 45–90 seconds, telling `MVP.md` §21 in order. Sign in →
  the Sneaker on Home → START → the walk → STOP and the reward settling → repair or upgrade →
  (if recorded) transfer to wallet B. Pull the best take of each moment from either video.
  - The walk plays sped up (about 6–10×) so it reads as a walk in a few seconds. Keep every tap,
    wallet confirmation and result at normal speed, and trim waiting time to about a second.
  - Cuts are clean hard cuts. A short fade (about 0.2 s) is fine between scenes, but no zooms,
    titles or effects inside the video. Text goes on the page instead (next point).
- **Chapters on the page, not in the video:** a short list beside the player (for example "Sign
  in · 0:00", "Walk · 0:12", "Reward · 0:24"), from `src/content/`. Each one seeks the video to
  its time. That's one small client component; it must work with the keyboard and announce
  nothing loudly.
- **Optional short loops** (only if they clearly help, at most two): 4–8 s silent loops that could
  replace a static screenshot in How it works (for example the reward counting in on the
  summary). Under 1.5 MB each, autoplay muted and looped **only** when on screen and only without
  `prefers-reduced-motion`, otherwise show the screenshot. If they don't clearly beat the
  screenshots, skip them.
- Where each output goes on the page, and its target size.

### 4. Encode (after my go-ahead)

Outputs go in `website/public/videos/` (create it). For each video:

- **MP4, H.264** (`libx264`, `-profile:v high`, `-pix_fmt yuv420p`), **constant 30 fps**
  (`-vf fps=30` with the other filters; the sources have variable frame rate), **no audio**
  (`-an`), **`-movflags +faststart`** (it starts playing before it's fully downloaded).
- Width 540 px (scale with `-2` for an even height). Crop the status bar first if it shows
  anything from step 2.5, and keep the crop identical across all clips.
- Pick the CRF that meets the size target (start at 28): **main demo ≤ 8 MB**, loops ≤ 1.5 MB.
  Screen recordings compress well; check text stays sharp in a frame from the result.
- Build the main demo from trimmed segments with `trim`/`setpts` and `concat`, or cut segments to
  intermediates in the scratchpad and join them. Speed changes use `setpts=PTS/<factor>`.
- **A poster** per video: the best single frame (the Home screen with the Sneaker, or the reward
  on the summary), saved as WebP at the video's size, about 50 KB or less.
- Re-check each output: `ffprobe` (duration, fps, no audio stream, size) and a fresh contact
  sheet, so you see the final cut, not your intent.

### 5. Put it on the page

- Rename the demo to fit the content: replace `demoVideo` in `src/content/screenshots.ts` (or
  move it to `src/content/demo-video.ts` if that reads better) with the new file names
  (`/videos/stridemon-demo.mp4`, its poster), the **real** width and height of the encode (not
  the screenshot's 1080 × 2340), its duration, a heading and a description that say what the
  video shows, and the chapters.
- Update `demo-section.tsx` and the `hasPublicFile` check in `page.tsx` to the new path. Keep
  `preload="none"`, `muted`, `playsInline` and `controls`, and keep it from playing until the
  visitor presses play. Keep the phone-frame look the section already has.
- Hero's **Watch the demo** pill already links to the section: check it still does.
- **SEO:** add a `VideoObject` to the page's JSON-LD (`src/lib/build-structured-data.ts`): name,
  description, `thumbnailUrl` (the poster, absolute from `siteUrl`), `contentUrl`,
  `uploadDate` (2026-10-05), and `duration` in ISO 8601 (`PT1M12S`).
- Loops (if approved): the How it works step shows the loop when it's on screen and motion is
  allowed, otherwise the screenshot. They don't load until the step is near the viewport.
- Update `website/README.md`: the demo now lives in `public/videos/`, the raw recordings live in
  `media-source/` (gitignored), and the exact `ffmpeg` commands you used, so the cut can be redone
  from new recordings.

### 6. Check, then report

- `cd website && bun run build` passes, and `bun run lint` passes from the repo root.
- `du -sh website/out` and the size of each file in `website/public/videos/`. Nothing over the
  targets in step 4.
- Open the built site (`bun run start`) in a browser at 390 px and 1440 px: the video plays,
  chapters seek, the poster shows before play, and nothing shifts while it loads.
- Lighthouse on mobile stays at 95+ in all four categories.

Report: the final timeline of the main demo (what's shown at which second), the files created
and their sizes, before/after Lighthouse scores, and frames from the result at three points.
Don't delete the raw recordings in `media-source/`; ask me first.
