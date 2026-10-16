# social/instagram/

StrideMon on Instagram (D-053). It follows the X setup in [`../README.md`](../README.md): the same
voice, the same facts, the same states, and Claude drafts while only Yash posts. This file covers
what's different on Instagram.

| Path | What |
|---|---|
| `profile.md` | Username, name, bio, links, avatar, account settings |
| `stories.md` | The seven Stories, which Highlight each goes in, and where each sticker goes |
| `posts/` | The first nine feed posts, in posting order: caption, alt text and files for each |
| `design/` | The HTML source of every image, `instagram.css`, and `render.sh` |

The images are rendered into the gitignored `social/media/instagram/`. Rebuild all of them from
the repo root:

```bash
bash social/instagram/design/render.sh social/instagram/design/*.html
rsvg-convert -w 1080 -h 1080 website/src/app/icon.svg -o social/media/instagram/avatar-1080.png
```

`render.sh` reads each page's `<meta name="canvas">` for its size. It uses headless Chrome, as the
X posters do. The art is never copied: the pages read it from `website/public/`,
`launch-video/public/` and `packages/contracts/art/`, and inline it so IBM Plex Mono reaches the
contract's own SVGs.

## Sizes (checked 2026-10-16)

| What | File size | What to keep in mind |
|---|---|---|
| Feed post, carousel slide | 1080 × 1350 (4:5) | The profile grid shows a 3:4 crop, about 34 px off each side. Nothing that matters sits within 84 px of a side |
| Reel cover | 1080 × 1920 (9:16) | The grid crops it to 3:4 and the feed to 4:5, so everything sits between y 345 and 1575 |
| Story | 1080 × 1920 | The top 270 px and bottom 340 px sit under Instagram's own buttons |
| Highlight cover | 1080 × 1920 | Instagram crops a circle from the middle, so the glyph sits dead centre |
| Profile picture | 1080 × 1080 | Shown as a small circle. The mark is the website's icon, like on X |

Sources: [Neal Schaffer](https://nealschaffer.com/instagram-post-size/),
[inro](https://www.inro.social/blog/instagram-post-size) and
[socialbu](https://socialbu.com/blog/instagram-post-aspect-ratio) on the 3:4 grid (since January
2025); [Later](https://later.com/blog/instagram-hashtags/amp) on the five-hashtag cap
(Instagram's @creators, 2025-12-18); story safe zones from
[argil](https://argil.ai/blog/instagram-story-dimensions). Meta doesn't publish safe zones, so
check each upload's crop in the composer.

## How Instagram differs from X

- **Links in captions don't work.** Posts say "Link in bio". Stories use the link sticker.
- **Every site link carries `?source=ig-stridemon`**, which the waitlist stores (D-037).
- **Hashtags:** at most three, at the end of the caption, and only plain topical ones
  (`#walking`, `#running`, `#indiedev`, `#gamedev`, `#web3gaming`). Instagram allows five. Never
  `#airdrop`, `#nftdrop`, `#crypto`, `#passiveincome` or anything else from voice.md §3.
- **Alt text:** Advanced settings → Accessibility → Write alt text, for each image of a carousel.
  Each post file has one per image. Reels have no alt text field: the caption has to carry it.
- **Captions** can be longer than on X (up to 2,200 characters), but only the first line or two
  shows before "more". The first line is the hook and makes sense alone.
- **Disclaimers are the same as on X:** any post or slide that shows a STRIDE amount says
  "Monad testnet. STRIDE has no monetary value."
- **No Boost, no ads.** Meta's ad rules need prior written approval for crypto and NFT ads, and
  StrideMon is free with nothing to buy.
- **The films' music is "Content ID registered" on Pixabay** (`launch-video/CREDITS.md`). That's
  allowed by the licence, but Instagram may flag or mute a Reel. If it does, dispute it with the
  Pixabay licence. Both films still make sense muted. Don't add Instagram's own music on top.

## The launch

The grid alternates dark and light, so the first nine posts make a checkerboard (top-left is the
newest). Post them in this order:

| # | Day | Post | Format | Tile |
|---|---|---|---|---|
| 01 | Launch day | Meet StrideMon | Image | Dark |
| 02 | Launch day | The launch film | Reel, 0:45 | Light |
| 03 | Launch day | How a run works | Carousel, 5 | Dark |
| 04 | +1 | The rules live in the contract | Image | Light |
| 05 | +2 | Driving earns nothing | Image | Dark |
| 06 | +3 | 1,000 Founding Passes | Carousel, 4 | Light |
| 07 | +4 | No image file. A contract draws it. | Image | Dark |
| 08 | +5 | 1,000 Sneakers, one beat | Reel, 0:30 | Light |
| 09 | +6 | The waitlist mints first | Image | Dark |

On launch day, set up the profile first (`profile.md`), then post 01 to 03 about ten minutes
apart so the top row is full, then post the seven Stories and save them as Highlights
(`stories.md`). After post 09, keep the checkerboard going: a light post after a dark one.

Until the waitlist window (planned 2026-11-28 14:30 UTC), the daily countdown belongs in Stories,
with Instagram's countdown sticker, not in the feed. If Part 10 moves the date, change
`post-06-pass-3-dates.html`, `post-09-waitlist.html`, `story-03-founding-pass.html`,
`story-04-waitlist.html` and the captions, and render again.

## Rules

- **Nothing goes on Instagram without Yash.** Claude drafts here and never posts, schedules,
  logs in, connects a tool or calls an API. A post goes live only with Yash's name in its
  `approved:` field.
- Everything in `../voice.md` applies: tone, vocabulary, the never-say list and the standing
  answers to "airdrop?", "iOS?" and "can I play?".
- Every number cites its source in the post file, and in a comment in the HTML that shows it.
