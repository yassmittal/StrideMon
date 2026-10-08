# Part 1b: Art on-chain

**Goal:** the Solidity renderer becomes the only implementation of the art, and Yash approves and
freezes all 1,000 designs.

## Read first

- [`../../packages/contracts/art/founding-pass/README.md`](../../packages/contracts/art/founding-pass/README.md):
  the art system, the generator rules, what's left open
- The brief §4 (the pipeline) and §10.1 (`FoundingPassArtRenderer`)
- `docs/architecture/smart-contracts.md`, D-030 (on-chain art, `react-native-svg` parity),
  `packages/contracts/README.md`, `CLAUDE.md`'s Foundry notes (Foundry 1.8.3, `forge clean`)

## Build

1. **`FoundingPassArtRenderer`** draws exactly what the TypeScript sketch draws:
   - `renderDesignPreviewSvg(designNumber)`: the available card, for the gallery
   - `renderPassSvg(tokenId, passRecord)`: minted, laced or gold-framed
   - the shoe on its own, as a function Part 2's Founder Sneaker art can call
   - the ten Legendaries' hand-picked names (D-041, brief §3.2) in place of their generated
     ones, kept with their template so a re-roll never separates a name from its shoe
   - If one contract is over Monad's 128 KB, split it: the drawing, the art data, the design
     table.
2. **One source for the data.** Generate the Solidity constants (template polygons, lace slats,
   families, colourways, the design table) from the TypeScript art data with a script, marked
   "generated, never edit by hand". The drawing logic lives only in Solidity. The generator stays
   in TypeScript.
3. **Prove the port.** A `forge script` (simulation only, never broadcast) writes every design's
   SVG to disk. A check compares them with the sketch's output: identical bytes for all 1,000, or
   each difference explained. Then delete the TypeScript renderers, so only the Solidity one
   remains. The sheet layout code can stay for composing contact sheets.
4. **The ten contact sheets** of 100, built from the Solidity output (PNG via `rsvg-convert`, as
   the sketch does), plus the sketch's extra sheets if they help the review.
5. **The phone check** (D-030): show a set of cards in the app with `SvgXml`: every template,
   every family, laced, gold-framed. Compare them with a browser. A temporary dev-only screen is
   fine, and it's deleted afterwards. Fix anything that differs.
6. **Review and re-roll.** Yash marks the designs he doesn't like on the sheets. Give the
   generator a way to re-roll only those numbers under the same rules (seeded, repeatable), and
   repeat until he approves all ten sheets. Plan for a few hours of his time.
7. **Freeze.** The final `designs.json` becomes `FoundingPassDesigns.sol` (generated).

## Tests

- Every one of the 1,000 renders, and no two SVGs are the same.
- The preview and the pass SVGs for a sample, all four states.
- Gas for one `tokenURI`-sized render stays far inside an `eth_call`.
- The contract sizes stay under Monad's limit.

## Done when

- `forge test` passes.
- The port matches the sketch.
- The phone check is done.
- Yash has approved all 10 sheets, and the designs are frozen.

Update the art README, since it now describes the Solidity renderer. Mark 1b **Done**, then stop.

## Status (2026-10-08)

This part waits on Yash's review of the sheets, so it runs over more than one session. The art
README has the details.

| Step | State |
|---|---|
| 1. The renderer | **Done.** One contract, about 56 KB, so nothing split. `renderSneakerMarkup` takes any layers, for Part 2 |
| 2. One source for the data | **Done.** `art/founding-pass/solidity/` writes `FoundingPassArtData.sol` and `FoundingPassDesigns.sol` |
| 3. Prove the port | **Done.** 5,800 files byte-identical, then the TypeScript renderers were deleted |
| 4. The ten contact sheets | **Done.** `previews/3-designs-*.png`, drawn by the renderer |
| 5. The phone check | **Done** (2026-10-08). 19 cards matched on the Android phone and in a browser, and the temporary screen was deleted |
| 6. Review and re-roll | **Ready, waiting for Yash.** Rounds go in `art/founding-pass/generator/review-rounds.ts` |
| 7. Freeze | Not started: set `DESIGNS_FROZEN_ON` once all ten sheets are approved |

The next session on 1b: add Yash's marked numbers as a round, rebuild, run `forge test`, and send
him the new sheets. When he approves all ten, freeze (step 7) and mark 1b **Done**.
