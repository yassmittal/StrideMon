# Part 0: Decide

**Goal:** before any code, the docs say exactly what will be built. This part writes docs only.

## Read first

- [`README.md`](README.md) in this folder (the picture and the rules)
- [`../founding-pass-brief.md`](../founding-pass-brief.md), all of it, §7 and §13 most closely
- [`../../packages/contracts/art/founding-pass/README.md`](../../packages/contracts/art/founding-pass/README.md) (the approved art system)
- `docs/decisions.md` (the last few entries, for the format), `CLAUDE.md`

## Already decided (2026-10-08, with Yash)

- **Two linked NFTs.** The Founding Pass (website, soulbound) and a Founder Sneaker (app, drawn in
  the pass's design). Neither can be sent or sold. Normal Sneakers still can.
- **The art** is Part 1a's system, as the art README describes it.
- **Mint on the website**, free, with the email step (one pass per email and wallet).
- **Schedule:** preview week, then a **48-hour waitlist window** for people who joined the
  waitlist before it opened, then the **open mint** for anyone.
- **Early access:** while passes remain, only pass holders can start in the app. The app opens to
  everyone when all 1,000 are minted, or on a **backup date** if they aren't.
- **After the 1,000:** everyone gets a free normal Sneaker in today's look. No new passes, ever.
- **Redeploying the game contracts is fine.** There are no users yet.
- **Nobody gets stuck:** plain-words help everywhere (Part 7), maybe a chatbot (Part 8), and a
  full rehearsal before launch (Part 9).

## Ask Yash (one message, with a recommendation each)

1. **Legendary names:** keep the generated ones ("Prism Runner Storm") or hand-pick ten?
   (§13 question 3.) Recommend: hand-pick ten. They're the most shared.
2. **Gold frame** at random on about 1 in 10 passes? Recommend: yes.
3. **Turnstile on the mint button**, on top of the email step? Recommend: yes. It's free.
4. **The match quiz** in the gallery? Recommend: yes.
5. **Backup opening date:** how long after the open mint starts? Recommend: 14 days.
6. **A lost wallet:** may support move a pass to a new wallet after an email check? Recommend:
   yes, an admin-only action that keeps the design, founder number and frame.
7. **Dates:** when the preview week and the waitlist window start (after judging ends on
   2026-10-27). A rough week is enough. Part 10 sets the exact times.

## Write

1. **D-041** in `docs/decisions.md`, in the usual shape (Decision, Why, Trade-off, Revisit
   when): everything under "Already decided" plus Yash's answers. It overturns D-037's "the
   website never asks for a wallet" for the `/pass` page only. The waitlist stays email only.
2. **The brief:** answer §13, and fix anything the answers change.
3. **Architecture docs:** what will change, briefly, each linking to the brief and D-041.
   - `smart-contracts.md`: `FoundingPass` and its renderer; Founder Sneakers in `SneakerNft` and
     `SneakerGame`
   - `backend-api.md`: the pass routes, the waitlist window, the early-access gate, Founder
     Sneakers, lacing
   - `data-model.md`: the email-code and mint collections, and how waitlist sign-ups count for the
     window
   - `security.md`: email codes, Turnstile, rate limits, CORS for the site, who holds which role
   - `mobile-app.md`: the `founding-pass` feature
4. **`CLAUDE.md`, "Current phase":** one short paragraph saying the Founding Pass is being built
   from `docs/founding-pass/`, one part per session.
5. **`docs/README.md`:** this folder in the reading order, and the status row.

Leave the privacy page's text to Part 5: it changes when the mint page ships.

## Done when

Yash has answered the questions, D-041 and the docs say the same thing, and he has confirmed
they match what he wants. No code has changed. Mark Part 0 **Done** in this folder's README, then
stop.
