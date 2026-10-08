# Part 10: Launch

**Goal:** the preview week, the waitlist window, the open mint and opening day happen on
schedule, and people get help fast when they need it.

## Read first

- The brief §2, §5.1 and §9, D-041, `docs/social-plan.md` and `social/voice.md` (D-036), and
  `social/deltav/README.md`
- Part 9's `rehearsal.md` (every stuck point fixed)

## Set the dates with Yash

The schedule, in IST and UTC:
- the preview week starts
- the waitlist window starts and runs 48 hours
- the open mint starts when the window ends
- the backup opening date, 14 days after the open mint starts (Part 0)

Part 0's rough dates (D-041, brief §5.1): the preview week from Sat 2026-11-21, the waitlist
window from Sat 2026-11-28 20:00 IST, the open mint from Mon 2026-11-30 20:00 IST, and the
backup opening date Mon 2026-12-14 20:00 IST.

All of it lands after Metropolis judging ends on 2026-10-27.

## Before the preview week (Yash deploys, with the session's help)

1. **A fresh `FoundingPass`**, since the rehearsal's mints took real designs. Reset the pass
   collections in the hosted database and keep the waitlist. Export the ABIs, and update the
   website's and app's addresses.
2. **Fund the game-server key** for the whole launch (Part 3's budget). The faucet is slow.
3. **Configure the hosted API** with the dates. Turn the early-access gate **on**.
4. **Ship the website and the app build**, then check `/pass`, `/help` and the app against
   production once.

## Preview week

- `/pass` is live with its countdown, and the landing page asks people to join the waitlist to
  mint 48 hours early.
- **Drafts for X** in `social/` (Claude drafts; only Yash posts, D-036):
  - a colour family a day, a "Legendary of the day", and the schedule
  - every STRIDE mention carries "Monad testnet. STRIDE has no monetary value."
  - never "whitelist" or "airdrop"
- **No email yet.** The waitlist was promised a single email, and it goes out when the window
  opens. Dates go on X and the site.

## The waitlist window, the open mint, opening day

- Watch the outbox, the API logs, the minted count and the key's MON balance. Answer the help
  inbox. Reply "airdrop?" with the same plain no every time.
- **When the window opens:** send the waitlist its one email (Part 3's sender, within Brevo's
  daily limit), and draft the post.
- **At the open mint:** draft the post. The waitlist already had its email.
- **Opening day:** when all 1,000 are minted or the backup date arrives, the gate switches off by
  itself. Check that a new wallet gets a normal Sneaker. Draft the "most-wanted passes" post from
  the brief §12 metrics.
- A **DeltaV update**, drafted in `social/deltav/updates/`, posted only with Yash's ok
  (`CLAUDE.md`).

## Done when

All 1,000 are minted, or the backup date has passed, and the app is open to everyone. Mark Part
10 **Done**, write the metrics into the brief §12, and stop.
