# The StrideMon Showroom: build plan

A 3D gallery at **`https://showroom.stridemon.xyz`** where anyone can walk through all 1,000
Founding Pass Sneakers, turn any one of them in their hands, and go mint it on `stridemon.xyz`.
The app lives in [`showroom/`](../../showroom/README.md) at the repo root.

It's built **one part per Claude Code session**. This folder holds one file per part: what to
read, what to build, how to check it, and where to stop.

| File | What |
|---|---|
| [`brief.md`](brief.md) | The *what*: the idea, the building, the visit, how a 2D drawing becomes a 3D Sneaker, the art direction, the tech, the budgets, the open questions |
| [`references.md`](references.md) | The research (2026-10-22): the sites, spaces and code this is modelled on, and what to take from each |
| `part-*.md` | The *how* and the *order*, one file per session |

## Start a session

Paste this into a new Claude Code session in the repo root:

> Read `docs/showroom/README.md`. Find the first part in its table that isn't done, read that
> part's file and everything it lists under "Read first", and do only that part. Follow
> `CLAUDE.md` (docs first, never git). When the part's "Done when" is met, stop: tell me what
> changed, what I need to check or do, and wait for my go-ahead.

When a part is done, its row in the table below changes to **Done** with the date (the session
does that as its last step).

## The whole picture in plain words

```text
ARRIVE       showroom.stridemon.xyz. A short loader draws the line-Sneaker mark, then the doors
             open on a long, dim stone hall: the nave.

THE NAVE     Overhead, 1,000 white plaster casts hang from the vault, one per design (after
             Snarkitecture's cast-sneaker ceilings for Kith). When a pass is minted, its cast
             takes its colours, live. Scroll or swipe to walk down the hall.

THE CHAPELS  Ten small, jewel-lit rooms off the nave, five a side: one per template (Runner,
             Racer, Trail, Court, Hoop, Chunky, Sock, Skate, Spike, Hiker). Each holds its 100
             designs on steel shelves with museum placards, and its Legendary in a glass case.

THE APSE     The end of the hall, under an open oculus: one Sneaker on a tall plinth, turning
             slowly. The Sneaker of the day, or the latest mint once minting starts.

UP CLOSE     Tap any Sneaker: it comes off the shelf and turns in your hands. Its placard says
             its number, name, rarity, layers and whether it's minted. One button goes to its
             page on stridemon.xyz to favourite or mint it.

FIND         "Find a Sneaker" by number or name, with filters and "Surprise me". The camera
             walks you there.
```

Every Sneaker is the **frozen on-chain drawing, given depth**: the SVG's flat panels become
raised enamel, its ink lines become dark metal ridges (cloisonné). Nothing is redrawn by hand.

The showroom **only shows**. It never connects a wallet, takes an email or mints: every action
links to `stridemon.xyz`.

## Parts

| Part | What | Size | State |
|---|---|---|---|
| [0](part-0-decide.md) | Decide: the few open questions, the decision entry, the docs | S | Not started |
| [1](part-1-look.md) | The look: set up `showroom/`, turn the art into 3D, one plinth to pick the finish and the mood | L | Not started |
| [2](part-2-building.md) | The building: nave, chapels, apse, light, and the guided walk | L | Not started |
| [3](part-3-collection.md) | The collection: all 1,000 on the shelves, the cast vault, the live minted state | L | Not started |
| [4](part-4-up-close.md) | Up close: inspect, the placard, find, deep links, links to mint | M | Not started |
| [5](part-5-finish.md) | Finish: the arrival, light and post, speed tiers, fallbacks, the stuck-point check | M | Not started |
| [5b](part-5b-baked-light.md) | Baked light in Blender (optional: only if Part 5 still looks flat, Yash decides) | L | Not started |
| [6](part-6-launch.md) | Launch: Vercel, `showroom.stridemon.xyz`, the API origin, links from the website, the X post draft | S | Not started |
| [7](part-7-your-sneaker.md) | Your Sneaker: any Sneaker by number, read from Monad (optional, after early access starts) | M | Not started |

## Rules for every part

- **One part per session.** Stop when "Done when" is met, report, and wait for Yash. Don't start
  the next part.
- **Docs first.** If the code needs to differ from the brief or a part file, update the doc
  first. A new decision takes the next free number in `docs/decisions.md`.
- **Never run git** (the workspace `CLAUDE.md`). Leave changes in the working tree.
- **Ask Yash first** before anything that deploys, touches DNS or the server's `.env`, sends a
  transaction or costs money. Free options only: CC0 textures and HDRIs, the fonts the website
  already uses, no paid models or plugins.
- **Never run the local API against testnet** (`CLAUDE.md`). For a minted state on your laptop,
  use `cd apps/api && bun run pass:local-stack`.
- **The art is frozen** (`DESIGNS_FROZEN_ON`, 2026-10-08). The showroom reads the exported art
  and never changes a shape or a colour. Generated files say so and are never edited by hand. A
  Sneaker's colours on screen must match its card on `stridemon.xyz/pass`, checked side by side.
- **`showroom/` is its own app**, like `website/`: its own `package.json` and `bun.lock`, not a
  Bun workspace, never imports `@stridemon/*`. Its Next.js differs from training data: read
  `node_modules/next/dist/docs/` before writing Next code.
- **Rich, not loud.** Follow the brief's §6 (restraint, light, space, weight, the museum voice).
  The UI layer is the Lusion look (`docs/architecture/design-system.md`): quiet motion, pills
  with arrows (D-029), no corner "+" marks, nothing that bounces or flashes.
- **Nobody gets stuck.** Every view answers three things in plain words: where you are, what to
  do next, and where to get help (`stridemon.xyz/help`). Every UI part ends with a
  **stuck-point check**: walk each path, the failures included (slow network, no WebGL, the API
  down, reduced motion, keyboard only), and confirm each one ends in a next step.
- **Words.** Founding Pass, founder, waitlist, waitlist window, open mint, one of one. Never
  *whitelist*, *WL*, *allowlist*, *airdrop*, *alpha* or *sold out* (say "all minted"). Anywhere a
  pass is offered, say it's free and can't be sent or sold. Rarity is cosmetic: never say a rare
  design is worth more.
- **Phone first.** Check every visual part on Yash's Android phone (Chrome, over the LAN:
  `ipconfig getifaddr en1`) as well as the laptop. Most visitors come from X on a phone.
- **Lean.** The main path end to end with great visuals. A few tests where they matter (the art
  converter, the data), not a test matrix.
- **Done means done:** typecheck, lint and tests pass, and the part's own check passes.
