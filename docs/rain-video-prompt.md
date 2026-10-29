# The Rain film

`Rain9x16` in `launch-video/` (`src/rain/`), 2026-10-26. A Founding Pass waitlist ad remade from
`keywordType.mp4` at the repo root: the "I always wondered what the rain would say..." trend, where
rain on a laptop keyboard "types" gibberish, then `Y BUY THE CORVETTE!!!!!`, and the video cuts to
the car.

## What changes, what stays

The film is the reference frame for frame: same 17.37 s, same 30 fps, same cuts, same music.

| Frames | Reference | Film |
|---|---|---|
| 0–218 | Rain on the keyboard (caption burnt in), the whip to the laptop, the gibberish up to `HGBXHGVEU` | Untouched |
| 219–405 | The rain types `Y BUY THE` / `CORVETTE!!!!!` / `!!!!`, the doc scrolls on the music's hit (379–382) | The same laptop with its words wiped; the rain types `WAITLIST` / `YOURSELF` / `NOW!!!!!` in the doc's own Arial, on its tracked page |
| 406–519 | Five car shots: wide under palms, close front, front, close rear, night | The same backgrounds with the car taken out, and a Founding Pass Sneaker standing where the car stood |
| 520 | Black | Black |

The words keep the reference's line breaks: `WAITLIST` on its `Y BUY THE` line, `YOURSELF` on its
`CORVETTE` line (which the scroll moves to page 2), and `NOW!!!!!` typed after the scroll, on the
music's hit. The keys land on the reference's own keystrokes where it has them (`referenceTypedExtents`
in `src/rain/tracks.ts`). The Sneakers (`src/rain/content.ts`) are racers for the car, and the last
is #0678 Moonbow, a Legendary named for a rainbow at night.

No end card and no URL on screen, as the reference: the post's text carries `stridemon.xyz/pass`.

## How it's made

- `bash scripts/copy-rain-media.sh` (from `launch-video/`) copies the reference, its music and the
  five laced Sneakers, then runs `scripts/build-rain-plates.py`, which:
  - fits a model of the Google Doc (Arial, 100 units, 1.15 spacing) to frame 330 and tracks it on
    every typing frame (optical flow; the frames after the scroll from frame 400, joined to the rest
    by the screen's toolbar and dock),
  - wipes the reference's typed words off the paper and writes a plate per typing frame,
  - inpaints the car out of one frame per car shot (LaMa) and tracks each shot's camera,
  - writes every track to `src/rain/tracks.ts` (generated).
- The film draws the words (`src/rain/components/DocText.tsx`) and the Sneakers
  (`StandingSneaker.tsx`) over the plates.
- Render: `bunx remotion render src/index.ts Rain9x16 out/rain/rain-9x16.mp4`.

## Rules

- The reference's footage and music are unlicensed (Yash's choice, CREDITS.md): **never for
  Instagram**; YouTube may claim it.
- The Sneakers are the laced art as minted, only dimmed to the shot's light: never recoloured
  (DESIGNS_FROZEN_ON).
- On-screen claims: `launch-video/FACTS.md` §21.
