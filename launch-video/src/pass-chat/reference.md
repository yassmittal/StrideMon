# The reference, measured

`demo.mp4` (repo root): a third-party clip, 1920 × 1080, 30 fps, 224 frames (7.47 s), HEVC, with a
silent audio track (−91 dB). It's a guide to study, never material: no pixel, frame or sound of it
goes in the film. Measured 2026-10-16 from its frames (ffmpeg, full resolution), by eye from 4 × 4
contact sheets and by script (bounding boxes of the white page, the lime and the pale ring).

Frames below are the reference's own (30 fps, 0-based). "@60" converts to our 60 fps.

## The beats

| Ref frames | Time | What happens | Measured |
|---|---|---|---|
| 0 | 0.00 s | A white frame | Our frame 0 must not be empty (X thumbnail): it shows the phone, partly in |
| 1–8 | 0.03–0.27 s | The lime phone swings in from the right on its vertical axis, seen from below, heavily motion blurred on 1–3 | On 1 only its lime edge is in (x 877–929); on 3 the phone spans x 602–1135 at a steep angle; settled by 8–10. 8 frames = 16 @60 |
| 5–9 | 0.17–0.30 s | Bubble 1 pops in from its tail corner | Tiny on 5, full size on 9: about 4 frames (8 @60). No visible overshoot |
| 31, 59, 84 | 1.03, 1.97, 2.80 s | Bubbles 2, 3, 4 pop in the same way | 26, 28, 25 frames apart: about 0.88 s (53 @60). The older bubbles scroll up during the pop, over about 5 frames |
| 4–95 | 0.13–3.17 s | The camera never stops: the phone turns from facing left (its right side visible, 8–30) to facing right (its left side visible, 40–95), rolls about 6°, and pushes in | Phone width at the bottom edge: 72% of the frame on 41. A fast push-in on 59–64 (with bubble 3): the bubble text roughly doubles in size. The newest bubble always sits just above the compose bar and near the frame's middle |
| 96–114 | 3.20–3.80 s | The phone turns away on Y, faster and faster: its left side widens, it goes edge-on on 110–111, its back (lime, a camera block) slides left on 112–114 | 18 frames = 36 @60. Edge-on at 78% of the turn's time, as a cubic ease-in gives (t³ = 0.47 of the turn). Horizontal smear on 112–114 |
| 115–121 | 3.83–4.03 s | The whip into the card: white page, the card arrives huge and blurred and settles | Card width 90% (115, smeared), 68%, 64%, 61%, 60%, 59%, then 57% from 121. Settles in 6 frames (12 @60), fast out |
| 121–127 | 4.03–4.23 s | The card holds: the mascot balloon floats in the same sky, bobbing | Card 1090 × 613 px: **57% × 57%** of the frame (not the brief's 30%), centred, radius about 24 px. The balloon is about 30% of the card's height |
| 128–140 | 4.27–4.67 s | The card grows; a stadium rim (fisheye, convex up) rises into its bottom; the contents zoom too | 58% → 64% (132) → 85% (134) → 90% (136) → 93% × 90% (140). 12 frames = 24 @60, fast out. The balloon grows about 1.5× |
| 134–157 | 4.47–5.23 s | Objects burst out from behind the balloon, blurred and spinning, then drift | Leave on 134, mostly placed by 140 (6 frames = 12 @60), then drift outwards; by 144–156 they cross the card's edges and the frame's |
| 157–167 | 5.23–5.57 s | The card shrinks into the middle and blurs out; the objects pull back in towards the balloon | 100% → 94% → 87% → 78% → 61% → 45% (167): accelerating. 10 frames = 20 @60 |
| 168–176 | 5.60–5.87 s | A pale lime scalloped ring (12 soft waves, a thick band) **closes in** on "This" (sky blue, centred) and fades | Diameter: past the frame (168), 64% (169), 54%, 50%, 44%, 37%, 35%, 30% (175), gone on 176. It contracts the whole time and fades over its last 4 frames. Echo copies (motion blur) on 169–172. "This" is 318 px wide on 170 |
| 175–188 | 5.83–6.27 s | "isn't" writes itself on in a heavy, slanted, round-ended marker script, stroke by stroke | i stem (175–177), s (177–181), the i's dot (about 178), n (181–183), apostrophe (184–185), t stem (185–186), t cross (187–188). 13 frames = 26 @60. "This" turns from sky blue to ink over 174–181. The camera keeps the written part centred: "This isn't" spans 687–1236 on 185 |
| 190–195 | 6.33–6.50 s | A whip pull-back with a horizontal smear (191), then "a" (192), "prediction" (193) and "market" (194) slide in from the right with a horizontal blur | The pull-back takes 2 frames (4 @60); the slide about 3 (6 @60). The line is 1343 px wide on 194 |
| 195–223 | 6.50–7.47 s | The line holds, centred, small, on white, still pulling back slowly | 1290 → 1190 px wide (67% → 62%), decelerating |

## Sizes, as a share of the frame

- Phone (chat): about 72% wide at its bottom edge, only the screen's lower half in frame.
- Bubbles: text about 46 px at 1920 on 41, about 90 px after the push on 64. Slate blue bubbles,
  white sans text, one lime script word each, a curled tail at the bottom corner.
- Card: 57% × 57%, radius about 24 px. Grown: 93% × 90%.
- Ring: closes from past the frame to 30% wide in 8 frames.
- The line at rest: 62% wide.

## Eases (by eye and from the sizes above)

- Swing in, bubble pops, card settle, card growth, slide-in: fast out (out-expo).
- Spin, card exit: accelerating into the cut (a cubic ease-in measures right; the theme's three
  curves all slow down at their end).
- The chat camera: a continuous drift with pushes on top. Nothing ever starts from a dead stop.
- The pull-back after the handwriting: a whip (very fast), then a slow drift.

## What our film keeps, changes and why

Our film runs 11.5 s at 60 fps against the reference's 7.5 s: the chat's lines are longer and
must read muted (4.6 s, not 3.2), the card holds long enough to read its label (1 s, not 0.25),
and the end card needs time. The motion inside each beat follows the measurements above: the
card is 57% wide, the ring closes in and fades rather than blooming out, the spin and the exit
accelerate (cubic), and the pull-back is a whip followed by a drift.
