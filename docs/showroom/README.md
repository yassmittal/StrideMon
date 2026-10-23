# The StrideMon Showroom: build plan

A premium 3D store at **`https://showroom.stridemon.xyz`**: the StrideMon store from the Showroom
film, live in the browser. A Founding Pass holder, or anyone from X, walks in after hours, looks
at the Sneakers on its walls, puts any of the 1,000 on the counter's stand, and goes to
`stridemon.xyz` to mint it. The app will live in `showroom/` at the repo root (Part 1 creates it).

It's built **one part per Claude Code session**. This folder holds one file per part: what to
read, what to build, how to check it, and where to stop.

| File | What |
|---|---|
| [`brief.md`](brief.md) | The *what*: the idea, the store, the visit, flat Sneakers in a 3D store, the art direction, the tech, the budgets, the open questions |
| [`references.md`](references.md) | The research: the film, the sites, spaces and code this is modelled on, and what to take from each |
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
ARRIVE       showroom.stridemon.xyz. A short loader draws the line-Sneaker mark. You're on a
             night street: wet-dark road, fog, a sodium lamp, dim neighbours. The StrideMon
             front is dark, then its lights come on. "Step inside" walks you through the glass.

THE STORE    The film's store, 10 × 10 m: a polished warm-grey floor that reflects the light,
             white walls, a grid of downlights. Five stops: the #0137 lightbox, the Rare wall,
             the Legendary corner, the Founding Pass wall, the Sneaker wall and its stand.
             Scroll or swipe to walk; drag to look around a little.

LOOK CLOSER  Tap any Sneaker: the camera comes to it and a small white shop tag beside it says
             its number, name and rarity. Tap the tag for its page on stridemon.xyz.

FIND         The lit "Find a Sneaker" plate by the stand (or /): by number or name, or
             "Surprise me". That Sneaker goes on the counter's stand and the camera walks there.

LEAVE        Lit buttons in the store (D-068): the window decal and the blade sign on the
             street; "Get your Founding Pass" and the waitlist kiosk at the Founding Pass wall.
```

**The Sneakers stay flat:** each is its frozen laced art, a cut-out on a lit shelf or a print in
a lightbox, exactly as in the film. Never redrawn, never recoloured. The building is the premium
part: real floor reflections, gentle bloom on the lit things, soft shadows, an environment map,
faint grain.

The showroom **only shows**. It never connects a wallet, takes an email or mints: every action
links to `stridemon.xyz`.

## Parts

| Part | What | Size | State |
|---|---|---|---|
| [0](part-0-decide.md) | Decide: the plan rewritten for the film's store, the open questions, the decision entry, the docs | S | **Done** (2026-10-22, D-063) |
| [1](part-1-store.md) | The store: set up `showroom/`, export the art, port the film's store, add what live rendering brings, first tiers, the colour check | L | **Done** (2026-10-22, D-064) |
| [2](part-2-walk.md) | The arrival and the walk: the street, the lights coming on, Step inside, five stops, look around | M | **Done** (2026-10-22, D-065) |
| [3](part-3-look-closer.md) | Look closer and find: tap a Sneaker, the card, the minted state (the API's showroom origin), Find and the stand, the deep link | M | **Done** (2026-10-22, D-066) |
| [4](part-4-finish.md) | Finish and fallbacks: the loader, the last light pass, tuned tiers, no-WebGL still, slow network, the stuck-point check | M | **Done** (2026-10-23, D-067, D-068) |
| [5](part-5-launch.md) | Launch: Vercel, `showroom.stridemon.xyz`, the API origin, links from the website, the X post draft | S | Built (2026-10-23, D-069): Yash deploys (`deployment.md` §16), then the live check |

## Rules for every part

- **One part per session.** Stop when "Done when" is met, report, and wait for Yash. Don't start
  the next part.
- **Docs first.** If the code needs to differ from the brief or a part file, update the doc
  first. A new decision takes the next free number in `docs/decisions.md`.
- **Never run git** (the workspace `CLAUDE.md`). Leave changes in the working tree.
- **Ask Yash first** before anything that deploys, touches DNS or the server's `.env`, sends a
  transaction or costs money. Free options only: no paid models, textures, fonts or plugins.
- **Never run the local API against testnet** (`CLAUDE.md`). The showroom calls no server since
  D-068.
- **The film is the look.** The store's sizes, colours and lights come from
  `launch-video/src/showroom/`. Changing them needs Yash's ok.
- **The art is frozen** (`DESIGNS_FROZEN_ON`, 2026-10-08). The Sneakers are the exported laced
  SVGs, shown flat: never redrawn, recoloured, bloomed or tinted. Generated files say so and are
  never edited by hand. A Sneaker on screen must match its card on `stridemon.xyz/pass`, checked
  side by side.
- **`showroom/` is its own app**, like `website/`: its own `package.json` and `bun.lock`, not a
  Bun workspace, never imports `@stridemon/*`. Its Next.js differs from training data: read
  `node_modules/next/dist/docs/` before writing Next code.
- **Rich, not loud, and in the store.** Follow the brief's §6. The interface is lit things in the
  store (D-068); the little left over the canvas is the Lusion look
  (`docs/architecture/design-system.md`): quiet motion, no corner "+" marks, nothing that bounces
  or flashes.
- **Nobody gets stuck.** The store says where you are (each stop's lit words, the dots), the
  arrows and a one-time hint say what to do next, and every failure says what happened with a
  next step and Help (`stridemon.xyz/help`). Help isn't over the walk (D-068). Every UI part ends
  with a **stuck-point check**: walk each path, the failures included (slow network, no WebGL,
  reduced motion, keyboard only, a screen reader), and confirm each one ends in a next step.
- **Words.** Founding Pass, founder, waitlist, waitlist window, open mint, one of one. Never
  *whitelist*, *WL*, *allowlist*, *airdrop*, *alpha* or *sold out* (say "all minted"). Anywhere a
  pass is offered, say it's free and can't be sent or sold. Rarity is cosmetic: never say a rare
  design is worth more.
- **Phone first.** Most visitors come from X on an Android phone. Check every visual part on
  Yash's Android phone (Chrome, over the LAN: `ipconfig getifaddr en1`) as well as the laptop. It
  has to look great and run smoothly there, on its tier (brief §7.6).
- **Lean.** The main path end to end with great visuals. A few tests where they matter (the
  export, the data, the API's CORS), not a test matrix.
- **Done means done:** typecheck, lint and tests pass, and the part's own check passes.
