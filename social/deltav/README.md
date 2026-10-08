# DeltaV

StrideMon's DeltaV profile: <https://deltav.monad.xyz/startup/stridemon>. This file tracks the
rewards, the weekly updates that unlock them, and how to earn the community numbers honestly.

## 1. The rewards (copied from the Rewards page, 2026-10-07)

| Reward | Weekly updates | Believers | Followers | Other |
|---|---|---|---|---|
| DeltaV Telegram Group | 2 | | | |
| Credits Access | 4 | 10 | | account age 30 days |
| Community Feedback Directory | 6 | | | |
| Angel Directory Access | 8 | 50 | 100 | |
| Product Launch Amplification | 6 | 50 | 100 | |
| VC Directory Access | 12 | 70 | 148 | |
| Keone tries out your product | 16 | 100 | 200 | 20 feedbacks, average rating 4 |

"Weekly updates" counts **unique weeks**, so posting twice in one week counts once. Nothing here
can be rushed: the 16-week reward is four months of steady updates, whatever else happens.

## 2. When each one can unlock

Assuming the first update goes out this week (Mon 2026-10-05 to Sun 10-11) and one follows every
week after it, with no gaps. DeltaV doesn't say where its week starts; Monday is assumed.

| Updates | Week of | Unlocks (if the other numbers are there) |
|---|---|---|
| 2 | 2026-10-12 | Telegram group |
| 4 | 2026-10-26 | Credits (also needs 10 believers and the account 30 days old, about 2026-11-06) |
| 6 | 2026-11-09 | Feedback directory; Launch amplification (with 50 believers, 100 followers) |
| 8 | 2026-11-23 | Angel directory (with 50 believers, 100 followers) |
| 12 | 2026-12-21 | VC directory (with 70 believers, 148 followers) |
| 16 | 2027-01-18 | Keone tries it (with 100 believers, 200 followers, 20 feedbacks at ≥ 4) |

**A missed week pushes every later row back a week.** Post something small rather than skip.

## 3. Weekly updates

One file per week in `updates/`, named for that week's Monday (`2026-10-05.md`). Same life as an X
post (`../README.md`): Claude drafts, Yash edits and writes his name in `approved:`, then it's
posted.

**Posting** (only with Yash's ok; the key lives only in the `DELTAV_API_KEY` env var):

```bash
curl -sS -X POST https://deltav.monad.xyz/api/v1/weekly-updates \
  -H "Authorization: Bearer $DELTAV_API_KEY" \
  -H "Content-Type: application/json" \
  -d @- <<'JSON'
{"content": "<the update>", "xLink": "<optional X post URL>"}
JSON
```

Or paste it into the profile by hand. Then set `status: posted` and `posted:` in the file.

**Writing one:**

- 3–5 plain sentences in Yash's voice: what shipped, what was learned, what's next. The rules in
  `../voice.md` apply (no hype, no money words, "Monad testnet", STRIDE in caps).
- Only real progress, written the week it happened. Never pre-write a future week's "shipped".
- If the week was slow, say so in one line and name the next step. A short true update keeps the
  streak; a padded one costs trust with exactly the people these rewards put you in front of.
- Link the week's X post in `xLink` when there is one. It sends DeltaV readers to @stridemon.

**Likely topics for the next weeks** (fill them with what actually happens):

| Week of | Likely topic |
|---|---|
| 2026-10-12 | Metropolis submitted: the demo video, the first repair and upgrade on the new contracts |
| 2026-10-19 | Judging; the API and website redeployed with account deletion; first outside players |
| 2026-10-26 | Play Store closed test, or what testers broke and what got fixed |
| 2026-11-02 | Phase 9 (the Sneaker marketplace), if started |
| later | Phase 10 items from `docs/phases/phase-10-beyond-hackathon.md`, the iOS day (D-035), waitlist size |

## 4. Believers, followers, feedback and rating

These come from other people, so they can only be earned. What moves them:

- **Put the profile link where people already are.** The @stridemon bio or a pinned reply, the
  Metropolis submission's description, the README's links section, and the landing page footer.
  Ask plainly: "If you want to follow the build, StrideMon is on DeltaV: <link>."
- **Ask playtesters for feedback on DeltaV.** Everyone who installs the APK (the demo wallets'
  friends, Metropolis judges and other builders) gets one message after their first walk: what
  worked, what broke, and the link. 20 real feedbacks at ≥ 4 means 20 people who actually walked.
- **Give feedback to others.** Other DeltaV founders are the most likely believers. Try their
  products and leave specific feedback; many look back.
- **Monad builder spaces:** DevNads (@monad_dev), the Metropolis channels and Monad's Discord.
  Share progress with something specific (a decision, a bug, a number), never just the link.
- **Answer every reply and feedback** on DeltaV the same week, and mention the fix in the next
  weekly update when one ships.

**Never:** buy followers, use alt accounts to believe or rate, trade ratings, or offer STRIDE,
Sneakers or "early user" perks for them (`../voice.md` §3 bans "early users will…" anyway). It's
against the spirit of the program, and the reward at the end is a person (Keone) actually trying
the app.

## 5. Log

| Week of | Status | Posted | xLink |
|---|---|---|---|
| 2026-10-05 | posted | 2026-10-07 | |
| 2026-10-12 | draft (Founding Pass, from 2026-10-09) | | |
