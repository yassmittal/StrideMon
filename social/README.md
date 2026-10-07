# social/

StrideMon's presence on X, kept next to the code (D-036). The research and the reasoning are in
[`../docs/social-plan.md`](../docs/social-plan.md). This file is the how-to.

| Account | Who | Posts |
|---|---|---|
| [@stridemon](https://x.com/stridemon) | The product (no Premium) | Proof and deep dives |
| [@yash_mittal_dev](https://x.com/yash_mittal_dev) | Yash (Premium) | Build stories, the weekly changelog, quote-posts of launches |

The two accounts never post the same text: the second one quotes or reposts, and adds its own line.

## What's here

| Path | What |
|---|---|
| `voice.md` | How we write: tone, vocabulary, banned phrases, disclaimers, tagging, visual rules. **Read before drafting** |
| `profile.md` | @stridemon's name, bio, link, avatar, header and setup checklist |
| `ideas.md` | Backlog: one line per idea |
| `posts/` | One file per post or thread, named `<slot date>-<slug>.md`. The dated names *are* the calendar |
| `templates/` | Start every post from one of these |
| `reviews.md` | The weekly review, newest first |
| `media/` | X-only images and clips. **Gitignored**: each file's post says the command that rebuilds it |
| `deltav/` | The DeltaV profile: rewards, unlock timeline, weekly update drafts (`updates/`), and how to earn believers and feedback |

No tooling, no `package.json`, not a Bun workspace. Images and clips come from `ffmpeg` and
`rsvg-convert`. Later, cards will come from `remotion still` in `launch-video/`.

## A post's life

```text
idea → draft → approved → scheduled → posted        (or dropped)
```

1. **Idea:** one line in `ideas.md`.
2. **Draft:** copy a template into `posts/`, write it, and fill `sources` and every `alt`.
   Claude can take a post this far and no further.
3. **Approved:** Yash edits in place and writes his name and the date in `approved:`. That line is
   the only gate.
4. **Scheduled or posted:** Yash pastes the text into x.com himself, sets `status`, and fills in
   `x_url`.
5. **Results:** about 48 h later, copy the post's stats from the X app into `results`.

### Commands

```bash
ls social/posts                                  # the calendar
grep -H '^status:' social/posts/*.md             # every post's state
grep -l '^status: approved' social/posts/*.md    # ready to go
```

## How to post

- **Threads, the launch, and everything on @stridemon:** by hand on x.com. Paste Post 1, then
  reply to it with Post 2, and so on. Attach the media listed under each post.
- **Single posts on @yash_mittal_dev:** X's scheduler is fine (Premium has it). Threads can't be
  scheduled.
- Stay around for the first hour after a post and answer replies. The ranking rewards replies the
  author answers.
- Check in the composer how an image or video crops before posting.

## Rules

- **Nothing goes on X without Yash.** Claude drafts here, and never posts, schedules, logs in,
  connects a tool or calls the X API.
- **No X API and no API keys.** The API has no free tier. If that ever changes, a decision comes
  first, and keys go in `social/.env` (gitignored by the root `.env` rule).
- **Every number in a post cites its source** (`sources:` in the front-matter). Usually that's
  `launch-video/FACTS.md`, `docs/architecture/game-rules.md` or a decision. If a fact isn't
  checked anywhere, add a row to `FACTS.md` first.
- **Never copy** a screenshot, video or SVG into `social/`. Point at the original path.
- **The token is STRIDE**, live since the 2026-10-06 redeploy. Material from before that date
  (screenshots, the demo video, old transactions) says SOLE. See `voice.md` §4 before using it.
