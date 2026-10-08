# Founding Pass: build plan

The Founding Pass is built **one part per Claude Code session**. This folder holds one file per
part: what to read, what to build, how to check it, and where to stop. The *what* (the idea, the
flow, the research) lives in [`../founding-pass-brief.md`](../founding-pass-brief.md). This folder
is the *how* and the *order*.

## Start a session

Paste this into a new Claude Code session in the repo root:

> Read `docs/founding-pass/README.md`. Find the first part in its table that isn't done, read that
> part's file and everything it lists under "Read first", and do only that part. Follow `CLAUDE.md`
> (docs first, never git). When the part's "Done when" is met, stop: tell me what changed, what I
> need to check or do, and wait for my go-ahead.

When a part is done, its row in the table below changes to **Done** with the date (the session
does that as its last step).

## The whole picture in plain words

```text
PREVIEW WEEK     The gallery of all 1,000 designs goes up at stridemon.xyz/pass with a
                 countdown. People browse, pick favourites, share, and join the waitlist.

WAITLIST WINDOW  48 hours. Only people who joined the waitlist before it opened can mint.
                 Each picks one design and mints it free on the website.

OPEN MINT        Anyone can mint what's left, until all 1,000 are gone.

IN THE APP       Pass holders sign in with the same wallet, get their Founder Sneaker
                 (drawn in their pass's design) and start running. The first run laces it.
                 Anyone without a pass sees "Mint a Founding Pass to get in early".

OPEN TO ALL      When all 1,000 are minted, or on the backup date if they aren't, anyone can
                 sign in and get a free normal Sneaker. No new passes, ever.
```

| A founder owns | What it is | Can it be sent or sold? |
|---|---|---|
| **Founding Pass** | Minted on the website. The membership card: a one-of-one design, the founder number, sometimes a gold frame | No, never |
| **Founder Sneaker** | Given in the app. The shoe they run in, drawn in their pass's design, with level, energy and durability | No |

Everyone after the 1,000 gets a **normal Sneaker**: free, today's look, and it can be sent.

## Parts

| Part | What | Size | State |
|---|---|---|---|
| [0](part-0-decide.md) | Decide: the last open questions, D-041, the docs | S | **Done** (2026-10-08, D-041 confirmed by Yash) |
| 1a | Art design: templates, families, the pass card ([`art/founding-pass`](../../packages/contracts/art/founding-pass/README.md)) | L | **Done** (2026-10-08, look approved by Yash) |
| [1b](part-1b-art-on-chain.md) | Art on-chain: the Solidity renderer, the review of all 1,000, the freeze | XL | Not started |
| [2](part-2-contracts.md) | Contracts: `FoundingPass`, Founder Sneakers in the game, the deploy | L | Not started |
| [3](part-3-api.md) | API: email codes, mints, the waitlist window, the gate, Founder Sneakers, lacing | L | Not started |
| [4](part-4-website-gallery.md) | Website: the gallery, the 1,000 pass pages, preview mode | L | Not started |
| [5](part-5-website-mint.md) | Website: "Get ready", the mint, the reveal, sharing | L | Not started |
| [6](part-6-app.md) | App: the gate, the Founder Sneaker, the pass on Profile, laced | M | Not started |
| [7](part-7-help.md) | Help: plain-words guides and a next step everywhere | M | Not started |
| [8](part-8-help-chatbot.md) | Help chatbot on the website (optional, Yash decides the cost first) | M | Not started |
| [9](part-9-rehearsal.md) | Rehearsal: the whole flow, end to end, so nobody gets stuck | M | Not started |
| [10](part-10-launch.md) | Launch: preview week, the waitlist window, open mint, opening day | S + calendar | Not started |

## Rules for every part

- **One part per session.** Stop when "Done when" is met, report, and wait for Yash. Don't start
  the next part.
- **Docs first.** If the code needs to differ from the brief or a part file, update the doc first.
  A new decision takes the next free number in `docs/decisions.md`.
- **Never run git** (the workspace `CLAUDE.md`). Leave changes in the working tree.
- **Ask Yash first** before anything that sends a testnet transaction from the deployer or
  game-server key, deploys the API or website, or costs money. The project prefers free options.
- **Never run the local API against testnet** (`CLAUDE.md`). Test against a local Anvil, or
  against the hosted API once it's deployed.
- **No users yet** (as of 2026-10-08), so redeploying the game contracts and resetting test data
  is fine when it makes the experience better. Still ask before broadcasting.
- **Words.** Say Founding Pass, founder, waitlist, waitlist window, open mint, one of one. Never
  *whitelist*, *WL*, *allowlist*, *airdrop*, *alpha* or *sold out* (say "all minted"). Every
  surface with the pass says it's free and can't be sent or sold. STRIDE stays "Monad testnet.
  STRIDE has no monetary value."
- **Nobody gets stuck.** This is Yash's main ask. Every screen on the website and in the app
  answers three things in plain words: what is happening, what to do next, and where to get help.
  Every error says what went wrong and what to do about it, and links to the help answer
  (Part 7). Use short sentences and no jargon: "can't be sent or sold", not "soulbound".
  Every UI part ends with a **stuck-point check**: walk each path, the failures included, and
  confirm each one ends in a next step.
- **Calm UI.** The Lusion look (`architecture/design-system.md`), no confetti, no sound, quiet
  motion.
- **Done means done:** typecheck, lint and tests pass (plus `forge test` for contracts), and the
  part's own check passes.
