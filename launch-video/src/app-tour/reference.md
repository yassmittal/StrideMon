# The reference, measured

`reference.mp4` (repo root): a third-party app ad, 720 × 1280, 30 fps, 900 frames (30.0 s), H.264,
with AAC music (44.1 kHz stereo). It's a guide to study, never material: no pixel or frame of it goes
in the film. Its music is the one exception: Yash chose to keep it as the film's track (2026-10-17,
`CREDITS.md`), so the film is cut to it frame for frame. Measured 2026-10-16 by script (ffmpeg frames at full
resolution, colour-matched edges and bounding boxes, librosa) and by eye from contact sheets. The
frames and the scripts are in the session scratchpad, never in the project.

Frames below are the reference's own (30 fps, 0-based). "@60" is our 60 fps frame. Sizes are shares
of the 720 × 1280 frame, so they carry over to 1080 × 1920 unchanged.

## The section colours

| Section | Background (sRGB) | Headline |
|---|---|---|
| 1 | green `0 130 89` | pale mint |
| 2 | purple `81 66 131` | peach |
| 3 | peach `255 221 176` | near-black |
| 4 | near-black `10 23 28` | mint |
| 5 | orange `253 143 45` | pale peach |
| End | mint `186 231 218` | green (the logo) |

## The beats

| Ref frames | Time | What happens | Measured |
|---|---|---|---|
| 0–3 | 0.00–0.13 s | **Cover**: section 1's styleframe, the phone on the splash and the headline's first words | Phone 57.8% wide, top at 23.3%. Only "Welcome to the" is in (the headline mid-rise), so even the cover is a frame of motion |
| 4–7 | 0.13–0.27 s | **The icon rises in from below**, already big | 81.7% wide (a 588 px square). Its centre goes from 82% of the height (4) to 59% (5), 52% (6) and 50% (7): a fast out-ease over 3 frames (6 @60) |
| 8–10 | 0.27–0.37 s | It grows a little | 82.6% → 86.1% |
| 11–17 | 0.37–0.60 s | **It punches past the frame**: wider than the frame, then eases back | Its height (it's square): 732 (11), 842, 870, **876 = 122% of the width (14)**, 867, 867, 827 (17) |
| 18–24 | 0.60–0.83 s | It shrinks back and settles | 91.7% (18), 68.9%, 63.3%, then **61.9%** held 21–23 (a 446 px square, radius about 21% of its side), 60.8% (24) |
| 25–30 | 0.83–1.03 s | **It collapses into the phone**, which then grows into place. The icon's square stays drawn on the small phone's screen for a frame, then the screen is the splash | 55.0% (25) → the phone's screen 31.0% × 408 px tall (26) → 47.5% (27–28) → 51.7% (29) → 52.6% (30). The phone's outer box lands at **57.8% wide, top 23.5%**, centred, on frame 30 |
| 30–40 | 1.00–1.33 s | The splash holds | |
| 40–70 | 1.33–2.33 s | The phone grows | 57.8% → 63.9% (top 23.5% → 21.6%), standard ease |
| 46–60 | 1.5–2.0 s | "Welcome to the / new equ app." rises in word by word | Two lines, centred; line 1 starts at 10.8% of the height |
| 94–118 | 3.1–3.9 s | The splash slides up to Home **while the phone shrinks back** to 57.8% | |
| 112–144 | 3.7–4.8 s | Home's ring counts down 2000 → 500 | |
| 165 | 5.50 s | **Tap 1**: a pale filled circle on a tab-bar icon, the next screen slides in from the right (166–174) | Circle about 13% of the phone's width, pops and opens to a ring as it fades, about 0.3 s |
| 175–212 | 5.83–7.07 s | **Wipe 1**: purple, "Endless choices." | The curve below. The phone grows 58% → 64% over 200–235 (6.7–7.8 s) |
| 210–300 | 7.0–10.0 s | A list scrolls, the phone holds at 64% | |
| 290 | 9.67 s | Hard cut back to Home | |
| 307 | 10.25 s | **Tap 2**: a thick pale ring on an arrow button | |
| 311–349 | 10.37–11.63 s | **Wipe 2**: peach, "Effortless planning." | |
| 326–372 | 10.87–12.4 s | **The hard push-in**: on the snap (326) the phone jumps to about 83% wide, then eases to **78.9%** by 372, its bottom out of frame | Holds to 420 (14.0 s); the screen scrolls a long list fast |
| 420–468 | 14.0–15.6 s | It pulls back out to 61% | Cut to Home at 444 (14.8 s) |
| 457 | 15.25 s | **Tap 3**: a thick dark ring on a button, which changes state | |
| 475–513 | 15.83–17.10 s | **Wipe 3**: near-black, "Deliciously yours." | |
| 562 | 18.75 s | **Tap 4**: a pale filled circle on a tab | |
| 574–600 | 19.13–20.0 s | **Wipe 4**: orange, a three-line headline. Its snap (588) lands on the break's first hit | The new screen sits with its counters at zero |
| 570–605 | 19.0–20.17 s | **The break**: the music falls away to about −22 dB with two soft hits (19.55, 19.85 s) | |
| 605 | 20.17 s | **The drop**: the clip's strongest onset, on the half beat. The line chart draws (607–630) while three counters roll (to 645) | |
| 612 | 20.40 s | A cut puts the phone back at 57.8%, top at 24.5% | |
| 645–702 | 21.5–23.4 s | It holds | No drift measured: the phone is still to the pixel |
| 702–721 | 23.40–24.03 s | **The phone tilts counter-clockwise and slides off left**, accelerating | Angle 0° (702) → 0.6° (705) → 1.4° (709) → 2.9° (713) → 5.4° (716) → 8.8° (719) → **13.5° (721)**. Its right edge 565 → 307 (720) → gone by 722: an ease-in, like a throw |
| 709–747 | 23.63–24.90 s | **Wipe 5**: mint, **over the phone** | Its snap (723) swallows the phone, whose right edge is level with the wipe's on 721 |
| 723 | 24.10 s | The logo and "For a healthier you." are there as the wipe passes | Logo 63.5% wide at 38.0–53.5% of the height; tagline 54.2% wide at 56.7–59.6% |
| 778–790 | 25.9–26.3 s | The tagline **swaps** to "Ready to transform?" | |
| 795–806 | 26.5–26.9 s | The URL types on under it | 41.0% wide at 61.1–63.2% of the height |
| 815–835 | 27.2–27.8 s | **Two store badges slide in from the left and right edges** and settle | Together 39.9% wide at 67.0–70.2% of the height. Their inner edges: 26→216 and 693→502 px, a fast out-ease |
| 835–900 | 27.8–30.0 s | The end card holds | |

## The wipe

All five wipes are the same move, to the pixel. The edge is **hard and vertical** (2 px of
anti-aliasing, the same x at the top and bottom row), with no blur. The reference was animated at
**25 fps** and delivered at 30 (every fifth or sixth frame is a duplicate), so the curve is 31
keyframes 0.04 s apart: **1.20 s** in all (72 frames @60).

The edge's x as a share of the width, keyframe by keyframe (wipe 1, frames 175–212; wipes 2–5
measure the same within 2 px):

```
0.000 0.006 0.011 0.019 0.031 0.042 0.056 0.072 0.094 0.122 0.161 0.222
0.489 0.758
0.819 0.858 0.886 0.906 0.925 0.939 0.950 0.961 0.969 0.975 0.981 0.986 0.989 0.992 0.994 0.997 1.000
```

- **Creep** (keyframes 0–11, 0.44 s): each step about 1.3× the last, an exponential ease-in to 22%.
- **Snap** (11–13, 0.08 s): 22% → 49% → 76%, 192 px a frame at 720 wide.
- **Settle** (13–30, 0.68 s): the remaining distance shrinks about 0.8× a step, an exponential
  ease-out.

`src/app-tour/wipe.ts` holds these 31 values and interpolates them with a monotone cubic, so the
curve is the measured one at any frame rate.

| Wipe | Starts (frame, s) | Snap midpoint (s) | Full (s) | On the music's grid |
|---|---|---|---|---|
| 1 | 175, 5.83 | 6.30 | 7.07 | beat 9.35 |
| 2 | 311, 10.37 | 10.83 | 11.63 | beat 17.0 |
| 3 | 475, 15.83 | 16.30 | 17.10 | beat 26.0 |
| 4 | 574, 19.13 | 19.60 | 20.0 | beat 31.5 (the break's first hit) |
| 5 | 709, 23.63 | 24.10 | 24.90 | beat 39.0 |

**Layering:** the new colour is a layer over the old field. The **old headline stays on top** of it
until the snap, then disappears in one frame. The phone stays on top of wipes 1–4; wipe 5 goes over
it.

## The headline

- **The words aren't masked.** On the snap frame each word of the new headline appears whole, about
  **0.7 em below** its place (44 px at 720 wide), over both colours, and slides up on a fast
  out-ease: 44 → 21 → 16 → 12 → 10 px over the next keyframes, settled about 0.6 s after the snap.
  The second word starts one keyframe later than the first (its first offset is 61 px, not 44).
- **Size:** centred; cap height about 45 px at 720, so a font size of about 9.5% of the width.
  "Endless choices." spans 117–605 px (68% of the width) at 10.8–14.6% of the height.
- The cover (frames 0–3) shows the headline mid-rise, so even the thumbnail has motion in it.

## The phone

| When | Width | Top | Notes |
|---|---|---|---|
| Lands (1.0 s) | 57.8% | 23.5% | centred |
| Grows (1.3–2.3 s) | 63.9% | 21.6% | |
| Splash slides up (3.1–3.9 s) | 57.8% | 23.5% | shrinks back |
| Wipe 1 (6.7–7.8 s) | 63.9% | 20.4% | grows again |
| Wipe 2 snap (10.87 s) | ~83% | | a jump on the snap… |
| Push-in (to 12.4 s) | **78.9%** | | …then an ease down to it; the bottom is out of frame |
| Back out (14.0–15.6 s) | 61% | | |
| After the drop (20.4 s) | 57.8% | 24.5% | a cut |
| Exit (23.4–24.0 s) | | | tilts to 13.5° counter-clockwise and slides off left |

The phone is an iPhone in the reference (black bezel, Dynamic Island). Ours is the website's plain
Android frame (`PhoneFrame`).

## The taps

Two kinds, as the brief describes: a **pale filled circle** (about 13% of the phone's width) that
pops and opens to a ring as it fades, about 0.3 s, for tab-bar taps (5.50 s, 18.75 s); and a
**thick ring** around a button, about 0.4 s, pale on dark (10.25 s) and dark on light (15.25 s),
for button taps. Every screen change inside the phone happens on a tap, a hard cut or under a wipe.

## The end card

| Element | Height (share) | Width |
|---|---|---|
| Logo | 38.0–53.5% | 63.5% |
| Tagline (then "Ready to transform?") | 56.7–59.6% | 54.2% (then about 41%) |
| URL | 61.1–63.2% | 41.0% |
| Store badges (ours: two pills) | 67.0–70.2% | 39.9% together |

## The music

- **Tempo: 100.01 BPM, rock steady.** A beat every 0.5999 s from **0.690 s**; the beat-time
  regression's residual is 5.4 ms (std), 19.8 ms at most, over 40 beats. At 60 fps a beat is
  **36 frames**.
- **Loudness: −12.1 LUFS integrated**, LRA 4.5 LU, peak −0.1 dBFS.
- **Energy:** the kick comes in at 0.75 s (−9 dB RMS from −22). It stays full until 19.0 s.
- **The break: 19.0–20.1 s.** Not dead silence: the music falls to about −22 dB with two soft hits
  at 19.55 s (under wipe 4's snap) and 19.85 s.
- **The drop: 20.17 s**, the clip's strongest onset by far (20.4, next 17.5), on the half beat
  (beat 32.5).
- **The end:** the music runs to 24.75 s, then a tail at about −24 dB to 27.0 s, silent from 27.3 s.
- **No sound effects.** None of the four taps has an onset above the music around it (tap 3 is
  below it). The snaps of wipes 4 and 5 coincide with musical hits (the break's hit and the
  resolve). One soft onset at 26.5 s (under the URL) sits in the music's tail.

## What makes it work

One idea per section. Something always moves inside the phone: a count, a scroll, a chart. The
colour change carries the story, so the cuts inside the phone never read as cuts. The phone's size
breathes with the sections (58% → 64% → 58% → 64% → 79% → 61% → 58%), so the frame is never still
even when the screen is.

## What our film keeps, changes and why

- **Kept:** the wipe curve exactly, its layering, the headline's unmasked rise on the snap, the
  icon's rise, punch and collapse into the phone, the phone's sizes, the push-ins, the taps, the
  break before the drop, the tilt-off under the last wipe, and the end card's stack and timing.
- **Changed:** our film is 60 fps; the phone is the plain Android frame; the end card's badges are
  two pills (`ANDROID DEMO`, `MONAD TESTNET`), never store badges; the URL rises instead of typing
  on; and holds drift (the reference's phone is still to the pixel, our motion rules ban a dead
  frame).
