# Part 7 (optional): Your Sneaker

**Only after early access starts on fresh contracts** (D-049, planned 2026-11-21), because the
addresses change that day. Yash decides whether it's worth it.

**Goal:** anyone can put any Sneaker that exists on Monad on the apse plinth by its number and
see it in the showroom. Read-only: no wallet.

## Read first

- D-030 (the Sneaker's on-chain picture), D-042 (Founder Sneakers and passes), D-046
- `packages/contracts/README.md` (the live addresses) and `website/src/content/contracts.ts`
- `showroom/src/lib/sneaker-geometry/`

## What's different about these Sneakers

Checked on 2026-10-22:

- A **Founder Sneaker** is drawn in its pass's design. Read which design from the chain and
  reuse that design's relief: no new drawing to convert.
- A **normal Sneaker**'s picture (`SneakerArtRenderer`, D-030) is a different drawing: curves,
  rectangles, circles and text. The cloisonné converter doesn't read it. Show it as its on-chain
  picture, lit in a frame on the plinth, unless Yash wants the converter extended (flatten the
  curves, skip the text).

## Build

1. A "Your Sneaker" pill opens a number field.
2. Read the Sneaker from Monad testnet with a viem public client (the website's RPC, the addresses
   copied by hand as the website does). Founder Sneaker → its design's relief. Normal Sneaker →
   its picture in a frame.
3. It goes to the apse plinth with a placard: the number, Founder or normal, the level. No STRIDE
   amounts (if any ever appear, add the testnet line).
4. **Nobody gets stuck:** a number that doesn't exist, a slow or failed read, and a burned
   Sneaker each get one plain line and a next step.

## Done when

- Yash sees his own Sneaker in the apse, on his phone.
- Typecheck, lint and tests pass.

Mark Part 7 **Done**, then stop.
