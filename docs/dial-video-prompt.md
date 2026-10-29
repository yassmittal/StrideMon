# The Dial film: brief

Written 2026-10-26, after Yash asked to remake `iphone.mp4` (the repo root, untracked) with Sneakers to
market the Founding Pass. The reference is a 10.5 s 9:16 ad for a cake shop ("Dial a slice"): a phone
keypad fills with a cake per digit, the call button is pressed, the keypad zooms into key 1, and ten
numbered cakes follow on the beat, then the logo. His ask for the end: something simple like "if you
want a Founding Pass, join the waitlist to mint free, 48 hours before everyone else".

So the film is **the reference's structure and timing, with ten Founding Pass Sneakers in place of
its cakes**, and a longer end card with the waitlist line. It's `Dial9x16` in `launch-video/`
(`src/dial/`), 1080 × 1920, 30 fps (the reference's rate), 420 frames (14 s).

## The rights, said plainly

The ten café backgrounds are the reference's own frames (its cakes, plates and captions taken out
with LaMa), and the music is the reference's own track. **StrideMon holds no licence for either.**
The same rules as the Crush film apply: never for Instagram, YouTube may claim it, and the rights
holder can ask for it to come down. A silent picture renders with `musicFileName: null`.

## The cut

Measured frame by frame from the reference (key fills from the keys' colour, cuts from frame
differences). Every number is in `src/dial/timeline.ts`.

| Frames | Reference | The film |
|---|---|---|
| 0–99 | The keypad under "Happy Cake / Dial a slice"; a cake fades into each key, 1 to 9 then 0, on frames 6, 11, 18, 25, 32, 39, 46, 53, 79 and 97 | The keypad under the StrideMon lockup and "Dial a Sneaker"; each key's Sneaker fades in on the same frames |
| 100–113 | The call button is pressed; the keypad zooms into key 1 and its circle opens onto the first shot | The same: the zoom ends at the first shot's own scale (112), then the circle opens (112–113) |
| 114–294 | Ten cakes in a café, one per key, each captioned `①` / `Cake “Honey Cake”`, cut on the beat | The same ten backgrounds with the cake gone and a Sneaker standing where it was, captioned `①` / `#0049 “Gold Skate Night”`, on the same cuts, with a slow push-in |
| 295–311 | The logo | The lockup pops in |
| 308–419 | (the reference has ended) | `Want a Founding Pass?`, `Join the waitlist and mint it free, 48 hours before everyone else.`, `stridemon.xyz/pass →` |

## The Sneakers

One per template, each echoing the cake it replaces (`src/dial/content.ts`): 1 #0049 Gold Skate Night,
2 #0137 Rose Hiker Night (the other films' hero), 3 #0868 Ember Court Night, 4 #0429 Clay Sock Frost,
5 #0289 Cobalt Spike Dusk, 6 #0498 Glory, 7 #0224 Clay Racer Dusk, 8 #0542 Nacreous, 9 #0184 Gold
Trail Eclipse, 0 #0020 Earthshine. The laced art is the website's own file, never edited
(DESIGNS_FROZEN_ON); it stays flat, a cut-out standing on the table with a contact shadow.

## The music

The reference's track repeats every 8 beats (97.9 BPM). It ends at 9.7 s, before the reference's own
logo; the end card here is 4 s longer, so `scripts/copy-dial-media.sh` plays it up to just before its
last hit, adds 6 beats from one period earlier, and ends on that hit (13.1 s, on the end card).

## Make and render

From `launch-video/`: `bash scripts/copy-dial-media.sh` (music, Sneakers, plates), then
`bash scripts/render.sh dial-9x16` (`out/stridemon-dial-9x16.mp4`, a silent copy and the poster).
