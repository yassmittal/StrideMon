# The Crush film: brief

Written 2026-10-23, after Yash asked to fit the Founding Pass Sneakers into `inspiration.mp4` (the repo
root, untracked): a 25.4 s 9:16 bubble-tea ad from Naisnow built on the "He will look at the person he
likes first" trend. His words: "use the same face, no worries about using their faces … make the
perfect video end to end, using same voice, same music, everything's same."

So the film is **the reference itself, shot for shot, with #0137 Rose Hiker Night in place of its
cup**. It's `Crush9x16` in `launch-video/` (`src/crush/`), 1080 × 1920, 25 fps (the reference's rate),
634 frames.

## The rights, said plainly

The hook is the reference's own footage of four real people, and the music is the reference's own
track (a Brazilian funk song with vocals: "rouba meu coração"). **StrideMon holds no licence for
either, and the people never agreed to promote StrideMon.** It's Yash's call, made with that said
(2026-10-23). The same rules as the App tour and Showroom films apply: never for Instagram, YouTube may
claim it, and the rights holder or the people in it can ask for it to come down anywhere it's posted.

## The cut

Measured frame by frame from the reference (scene cuts, plus grids drawn on its frames).

| Frames | Reference | The film |
|---|---|---|
| 0–263 | Three rounds of the trend; in the third he looks up | The reference's footage, untouched (caption included) |
| 264–278 | The camera pans up to a cup pasted in mid-air | The same pan on clean plates, #0137 floating where the cup was |
| 279–293 | The cup drops onto a stone ledge | The Sneaker drops onto the same ledge |
| 294–308 | Pearls into an empty clear cup | The sole drops into the empty, clear outline |
| 309–323 | Tea poured in | The base colour poured in, rising from the bottom |
| 324–338 | Cream poured on top | The panels flood down from the top |
| 339–352 | Honeycomb set on with tongs | The laces and heel tab land on top |
| 353–366 | Top down into the cup | Top down, close on the laces |
| 367–379 | Held up to the sky | Floating against the same sky |
| 380–393 | The grip close-up | Close on the heel |
| 394–407 | The straw stirring, top down | The laces, turning |
| 408–439 | Tilting up the cup, "4-layers Indulgence" | The same move on the Sneaker, `4-layers On-chain` |
| 440–475 | Pulling back to the cup on the bench, "Love In Every Sip" | `Love In Every Step` |
| 460–519 | A second cup set down beside it, "CAMELOT MILK TEA" | A second #0137 set down beside it: the pair, `ROSE HIKER` / `NIGHT` |
| 520–525 | Wash to white | The same |
| 526–633 | The logo builds on white | The StrideMon mark draws stroke by stroke, then `StrideMon` and `stridemon.xyz/pass` |

The four making shots build the Sneaker one layer each, so "4-layers" is literally what the viewer just
watched; the art itself is drawn on-chain (D-030, D-041).

## How it's made

- **Clean plates.** `scripts/build-crush-plates.py` takes the cup, hands and burnt-in titles out of one
  frame per shot with LaMa (big-lama, Apache 2.0, the ONNX export from Hugging Face, run locally).
  The two top-down bench shots are mostly cup, more than the model can invent, so their wood is
  spread and blurred outward instead; the Sneaker's close-up covers nearly all of it.
- **The reference's camera.** The same script tracks each shot's camera (ORB features, RANSAC, the cup,
  hands and text masked out) into `src/crush/tracks.ts`, and the film moves each plate and its Sneaker
  by it. Three shots whose features sit on the pour or the foam are held still instead. Every short
  shot gets a slow push-in from 1.03, so no edge shows. The bench close-up keeps 45% of the
  reference's tilt, because the Sneaker is less than half as tall as the cup.
- **The Sneaker** is the contract renderer's laced SVG, never redrawn or recoloured (DESIGNS_FROZEN_ON).
  The build only moves, clips and hides its own paths. It stays flat, like the reference's own pasted
  cup, with a contact shadow on surfaces and a soft drop shadow in the air.
- **Type.** Poppins (OFL), the reference's own face, at the reference's sizes. The typing speeds are
  measured: about 2.6 letters a frame for the small lines, and one letter a frame for the title, each
  letter popping in.

## Not in it

No STRIDE amount (so no testnet line), no price or "free mint" claim, nothing of Naisnow's (cup,
logo, name), and no wallet or app screen.
