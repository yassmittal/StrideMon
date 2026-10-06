# Research: reference launch films

Done 2026-10-05, time-boxed to about 20 minutes. Each film was downloaded and read as contact
sheets (one frame every 0.5 s, or every 1/6 s for short clips), so every timestamp below was seen,
not taken from someone's write-up.

## What was studied

| Id | Film | Source | Length |
|---|---|---|---|
| L1 | Linear, "Loops" (triggers) | `linear.app/changelog`, `webassets.linear.app/…/80f59b06….mp4` | 28.5 s, 60 fps |
| L2 | Linear, "Loops" (agent steps) | `linear.app/changelog`, `…/cb230e1a….mp4` | 40.5 s |
| L3 | Linear, "The right environment for every session" | `linear.app/changelog`, `…/3922f252….mp4` | 17.2 s |
| L4 | Linear, "Write with Agent" project update | `linear.app/changelog`, `…/47ba9e0b….mp4` | 19.0 s, 60 fps |
| L5 | Linear, issue done → customer reply | `linear.app/changelog`, `…/7eea0fd4….mp4` | 28.6 s |
| D1 | Dia (The Browser Company), product clip | `arc.net/video/ArcDiaPLG_Video.mp4` | 6.7 s |

**Not studied.** Apple's product films, Raycast's launch and a Monad-ecosystem launch on X: none
is a plain file on its site (Apple and X stream in segments, Raycast's page has no video file), and
no downloader is installed. I didn't guess timestamps for films I couldn't see.

## Stealable techniques

1. **One label rolls on a still frame, one swap per second.** L1 0:00–0:06 swaps the centred mono
   uppercase line four times (`ISSUE IS ASSIGNED` → `PROJECT STATUS CHANGES` → `INITIATIVE UPDATE
   POSTED` → `CYCLE STARTS`) while the dial behind it doesn't move. *Ours:* scene 6, one rule card
   per beat, the card fixed and only the words rolling.
2. **A lit stroke travels a path and switches each label on as it arrives.** L2 0:00–0:08: one
   bright line runs along an arc, and the mono step labels light up as it passes them. *Ours:* the
   Sneaker's line draw in scene 4, and the energy bar in scene 2 whose fill end triggers its number.
3. **Lock the frame, change only the value.** L5 0:04–0:06 is a tight crop of one properties row
   where `In Progress` turns into `Done` and nothing else moves. *Ours:* the durability `060 → 100`
   and level `01 → 05` macros: hold the crop and let the digits and lime do the work.
4. **A black card with one plain sentence that names what the next shot proves.** L5 0:06.5–0:08
   ("When an issue is marked done") and 0:12.5–0:14 ("Linear drafts a customer response"), each
   about 1.5 s, cut in and out of the UI. *Ours:* the scene 5 line "Not points in an app." between
   the reward and the explorer.
5. **The end card builds in separate beats, one thing at a time.** L1 0:20–0:28: the product name
   alone (about 2 s), then one two-line sentence (about 2 s), about 1 s of black, then the logo held to
   the last frame. L2 0:31–0:39 does the same. *Ours:* scene 7, "Walk." / "Earn." / "Upgrade." on
   three beats, then the wordmark, then the URL pill, never all at once.
6. **Real UI panels in 2.5D that never stop drifting.** L3 0:00–0:11 tilts real config panels in
   perspective and slides them slowly through the frame, one in focus at a time. *Ours:* the mono
   callouts in scene 2 and the three-frames-at-once layout in scene 5, always on a slow drift.
7. **Real interaction at 1×, cropped tight.** L4 0:00–0:03 shows the real cursor clicking
   `Update`, then `Write with Agent`, at normal speed, cropped to the panel. *Ours:* the real STOP
   tap and the real MetaMask Confirm, both at 1×, cropped to the button and the sheet.
8. **Hard cut from busy UI straight to the mark on black.** L4 16.0–16.5 s goes from a full
   document to the Linear logo with no transition, then holds 2 s. *Ours:* the flips between black
   and off-white sections.
9. **One accent colour, used once.** L4 11.5–12.5 s: the only colour in the film is a small blue
   `Post update` button; everything else is greyscale. *Ours:* blue `#1A2FFB` only on VIEW
   TRANSACTION, lime only on dark.
10. **Lock the camera and let the content animate.** D1 0:00.3–0:05: the frame never moves while the
    answer builds itself line by line under a fixed prompt pill. *Ours:* `+10 SOLE` counts up in a
    locked frame. The digits move and the camera doesn't.

## What not to take from them

- D1 0:00–0:00.3 brings its prompt pill in from a blur. Blur-in is banned for us.
- L1 and L2 put a soft vignette and a glow on the moving stroke. We use flat colour and no glow.
