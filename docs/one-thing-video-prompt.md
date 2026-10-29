# The One thing film: brief

Written 2026-10-26, after Yash asked to remake `menWantOneThing.mp4` (the repo root, untracked) for
StrideMon. The reference is a 12.3 s 9:16 ad for a plot of land: a woman says "Men only want one
thing, and it's not money, it's not power, it's not love," then a second voice says "it's 418 square
meters of land" over gold captions ("418m²", "OF LAND", "R3,500,000 📍 HOUT BAY"). His ask: after
"it's not money…", the answer is a StrideMon Sneaker, then "waitlist yourself now, to get 48 hours
early access" or something like it.

So the film is **the reference's hook as it is, then its reveal with #0137 Rose Hiker Night in place
of the land**, and an end card with the waitlist line. It's `OneThing9x16` in `launch-video/`
(`src/one-thing/`), 1080 × 1920, 30 fps (the reference's rate), 489 frames (16.3 s).

## The rights, said plainly

The hook is the reference's own footage (a real person) and the music is its own track, with the
second voice taken out. **StrideMon holds no licence for either.** The same rules as the Crush film
apply: never for Instagram, YouTube may claim it, and the rights holder can ask for it to come down.
A silent picture renders with `soundtrackFileName: null`.

## The waitlist line, said truly

"48 hours early access" isn't quite true: the waitlist **mints the Founding Pass 48 hours before
everyone else**, and the pass is the early access (`website/src/content/founding-pass.ts`). "Early
access" alone means the game restart on 11-21 (D-049). So the end card says "Join the waitlist now.
Mint your Founding Pass 48 hours before everyone else. It's your early access to StrideMon."

## The cut

Measured from the reference (its cuts from frame differences, the words from a Whisper transcript
with word times). Every number is in `src/one-thing/timeline.ts`.

| Frames | Reference | The film |
|---|---|---|
| 0–154 | The hook, black and white, word captions; "…it's not love," ends at 4.78 s | The same, untouched |
| 155–224 | The plot with the woman in red; "418m²" sparkles in; the music drops on the cut (5.16 s) | #0137 on a dark plum stage; "STRIDEMON" sparkles in, on the same drop |
| 225–299 | The plot from the air, "OF LAND" | A close-up of #0137, "SNEAKER" |
| 300–368 | "R3,500,000 📍 HOUT BAY" | #0137's Founding Pass card, "FREE 📍 MONAD TESTNET" |
| 369–488 | (the reference ends at 368) | The lockup, "JOIN THE WAITLIST NOW", the 48 hours, `stridemon.xyz/pass →` |

## The sound

`scripts/copy-one-thing-media.sh` makes it: the reference's mix to 5.08 s (the hook's voice), then
its music alone (demucs `htdemucs_ft` takes the second voice out), which repeats every 2.405 s, so
two more periods carry the end card before a half-second fade. A transcript of the render hears
only the hook's words.
