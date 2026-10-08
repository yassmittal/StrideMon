# Part 9: Rehearsal

**Goal:** prove that nobody gets stuck. Real people on real devices go through the whole flow, the
failures included, before launch, and every stuck point is fixed.

## Read first

- [`README.md`](README.md) in this folder, and Parts 3 to 8
- `docs/rehearsal-checklist.md` and `docs/demo-script.md` (how the Phase 8 rehearsal was run),
  `docs/device-testing.md`, `apps/mobile/.maestro/`

## Before it starts (Yash does, with the session's help)

- The API is deployed with the Part 3 config (`docs/deployment.md`).
- The website is deployed to a preview URL.
- An app build has the founder flow (EAS, `docs/device-testing.md`).
- **Rehearsal mints take real designs.** Every pass minted here is gone for good on that contract,
  so Part 10 deploys a fresh `FoundingPass`, and resets the pass collections, before launch.

## Build and run

1. **Write `rehearsal.md`** in this folder: the personas below, each with steps, the expected
   screens, and space for notes.

   | # | Who | What should happen |
   |---|---|---|
   | 1 | On the waitlist, phone only | Mints in the waitlist window on the phone, gets the app, runs, laced |
   | 2 | Mints on a laptop, runs on the phone | The app spots the wallet mismatch, and help gets them onto the right account |
   | 3 | Not on the waitlist, during the window | Told when the open mint starts, and can set a reminder |
   | 4 | No wallet at all, during the open mint | The guide takes them from zero to a minted pass |
   | 5 | Two people, one design | One gets it. The other gets 3 similar designs and mints one |
   | 6 | The email code is slow or lost | Resends after a minute and finds the help answer |
   | 7 | No pass, opens the app | Sees the gate with a way in. After opening day, gets a normal Sneaker |
   | 8 | A founder tries to send their Founder Sneaker | A clear "stays with you" message |

2. **Walk the schedule:** move the configured times so a test deployment passes through every
   phase (preview, waitlist window, open mint, all minted, and the backup date instead), and
   check both the website and the app at each one.
3. **Automate what's cheap:**
   - the API tests already cover the rules
   - a website flow test (Playwright) with an injected test wallet against a local chain
   - the Maestro flow extended for the founder path in the app
4. **A stuck-points table** in `rehearsal.md`: where someone hesitated or got stuck, what fixed
   it, and when it was fixed. Fix each one (docs first if the behaviour changes), then rerun that
   persona.

## Done when

- Every persona ends in success or a clear next step.
- Yash has run persona 1 himself on his phone.
- Every row of the stuck-points table is fixed.

Mark Part 9 **Done**, then stop.
