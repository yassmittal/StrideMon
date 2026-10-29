# The Stash film: brief

Written 2026-10-26, after Yash added `nailpaints.mp4` (the repo root, untracked): an 11.3 s 9:16 ad
from a press-on nail brand on the "what is bro filming 💀" trend. A phone hangs on a tape measure
down through a pavement grate; underneath, a gloved hand shows a clear case of ten nails. His ask:
the same video, but the showcase is our Sneakers, and at the end something simple like "If you want
a Founding Pass, waitlist yourself to get access to free mint 48 hours before everyone else", or
simpler.

So the film is **the reference itself, frame for frame, with six Founding Pass Sneakers in its case
and the waitlist line at the end**. It's `Stash9x16` in `launch-video/` (`src/stash/`), 1080 × 1920,
30 fps (the reference's rate), 431 frames (14.4 s). Render it with `bash scripts/render.sh stash-9x16`.

## The rights, said plainly

The hook is the reference's own footage of a real person, and the music is the reference's own
track. **StrideMon holds no licence for either.** It's Yash's ask (2026-10-26), with that said. The
same rules as the Crush and Dial films apply: never for Instagram, YouTube may claim it, and the
rights holder or the person in it can ask for it to come down anywhere it's posted.

## The cut

Measured frame by frame from the reference (frame numbers are the reference's and the film's).

| Frames | Reference | The film |
|---|---|---|
| 0–124 | "what is bro filming 💀": the phone lowered on a tape measure into the grate | The reference's footage, its brand credit taken out |
| 125–140 | The phone's own view up the street | The same |
| 141–196 | Dark, under the grate | The same |
| 197–204 | The case fades up from black, still sliding into place | The same fade (the reference's measured curve) on frame 205, held: too dark to track |
| 205–267 | Shot A: the case held front-on, ten nails | The same hand, case and camera; six Sneakers in two columns of three where the nails were |
| 268–277 | A whip (a smear, one close frame, a zoom back out) | The film's own whip: shot A zooms in and blurs away, shot B comes back out of the blur |
| 278–325 | Shot B: the case closer and tilted | The same, with the same six Sneakers in the same places |
| 326–430 | (ends at 334) | On the song's last beat: the case held, blurred and darkened, under the end card |

The end card: the StrideMon mark, `Want a Founding Pass?`, `Join the waitlist.` / `Mint free, 48 hours
early.` and the lime `stridemon.xyz/pass` pill. It's the Dial film's line, said shorter, as Yash asked.

## How it's made

- **`scripts/build-stash-plates.py`** (run by `scripts/copy-stash-media.sh`, about ten minutes):
  - The brand's credit under the caption is inpainted out of every frame it's on, with LaMa.
  - **The case track.** The case is rigid, so one homography per frame takes shot A's keyframe (230)
    onto the frame: SIFT on the nails, matched straight to the keyframe in shot A, chained frame to
    frame in shot B (its focus and size change too much). Shot B's keyframe (300) is tied to shot
    A's by the ten nails' middles, refined by ECC, so the Sneakers are placed once, in shot A's
    keyframe pixels. Written to `src/stash/tracks.ts` (generated), with each frame's light.
  - **The case floor.** The nails are inpainted out of shot A's keyframe once, and that floor is
    carried onto every case frame by the track and matched to its light, so no nail shows.
  - The cleaned frames become `public/stash/reference.mp4`, which the film plays.
- **The Sneakers** are the contract renderer's laced SVGs, never redrawn or recoloured
  (DESIGNS_FROZEN_ON), drawn flat on the case floor through a CSS `matrix3d` of the track, laid out
  three times larger so they stay sharp in the close shot, with a soft shadow, dimmed or lifted by
  the frame's light and toned down a little to sit in the phone's picture. Picked to echo the
  nails' red, black, white and silver, one of each template: #0137 Rose Hiker Night, #0220 Chrome
  Hoop Eclipse, #0110 Cherry Racer Night, #0363 Chrome Trail Night, #0082 Cherry Spike Frost and
  #0713 Cherry Chunky Night.
- **The music** is the reference's track (75 BPM) up to the end card on its last beat (10.86 s),
  then the same track from one bar back (7.66 s), fading out over the card's last 40 frames.

## Not in it

No STRIDE amount (so no testnet line), no price, no date, nothing of the nail brand (its nails,
credit or name), and no wallet or app screen.
