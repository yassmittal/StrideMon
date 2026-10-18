# Invite 3 friends, mint an hour early: the build prompt

The brief and build plan for the waitlist's referral loop (`waitlist-growth-plan.md` §4.1). Anyone
on the waitlist who brings **3 friends who confirm their email** can mint from **19:00 IST on
Sat 28 November**, an hour before the rest of the waitlist. It's built one part per Claude Code
session, the way `founding-pass/` was.

Yash said yes to the idea on 2026-10-18. **Part 0 turns the choices below into decisions:**
D-056 (the invite loop), D-057 (Google and the email budget) and D-058 (the early hour), in
`decisions.md`. Where this file and those differ, the decisions win.

## Fill in before the first session (Yash)

| | Default | Yours |
|---|---|---|
| The early hour's name in the copy (`waitlist-growth-plan.md` §8) | "the early hour" | "the early hour" (2026-10-18) |
| Friends who must confirm their email | 3 | 3 |
| When the early hour starts | Sat 2026-11-28 13:30 UTC (19:00 IST), 60 minutes before the window | the default |
| Passes the early hour can mint, at most | 250 (the other 750 or more wait for the window) | 250 |
| Waitlist codes a day, at most (out of Brevo's 300) | 200 | **250** |
| "Continue with Google" to check an email | yes (needs the Google client from Part 0) | yes |

## Paste this into a new Claude Code session (repo root)

> You are a senior software engineer on StrideMon. Read `docs/waitlist-referral-prompt.md`. Find
> the first part in its table that isn't done, read everything that part lists under "Read first",
> and do only that part. Follow `CLAUDE.md`: docs before code, never run git, never run the local
> API against testnet, and ask me before anything that sends real email, deploys, costs money or
> sends a testnet transaction. Before you write code, tell me in a few lines what you'll change and
> why. Then build it, with tests. When the part's "Done when" is met, stop: tell me what changed
> and what I need to check or do, and wait for my go-ahead.

Each session marks its part **Done** with the date in the table at the end of this file, as its last
step.

## The whole picture in plain words

```text
A LINK          Someone on the waitlist shares stridemon.xyz/waitlist?ref=K7M2QX9P on WhatsApp,
                Telegram, X, anywhere. Everyone's link is their own, and it never changes.

JOINING         The friend joins in one tap with Continue with Google (the email is checked on the
                spot, and nothing is emailed), or types an email as today.

CONFIRMING      A friend who typed an email confirms it with a 6-digit code: the same check the
                mint uses. Only confirmed friends count. Confirming is optional for the friend; it's
                what makes their friend's invite count.

THE CARD        After joining: your invite link, share buttons (WhatsApp, Telegram, X, the phone's
                share sheet, Copy) and, once your email is checked, "1 of 3 friends confirmed".

YOUR INVITES    stridemon.xyz/waitlist/invites: check your email (Google or a code), then see your
                link, how many friends have confirmed, and whether you have the early hour. People
                already on the list find their link here. Nobody is emailed without asking.

THE EARLY HOUR  Sat 28 Nov, 19:00 to 20:00 IST. People with 3 confirmed friends can mint, until 250
                passes are gone. At 20:00 the waitlist window opens for everyone on the list,
                exactly as today. Nobody's 48 hours change.

MINT NIGHT      Checking an email works with Google as well as a code, so most people need no code
                email on the busiest night. Brevo's free plan sends 300 a day.
```

## Why it's built this way

- **Email is the tight resource.** Yash stays on Brevo's free plan (300 emails a day) at least until
  the Metropolis results on 11-03 (2026-10-18). A confirmation email for every sign-up, or a code for
  every minter, would hit that limit at a few hundred people. Google sign-in checks an email without
  sending one, and most of the audience is on Android with a Google account.
- **Google can't be the only way.** Google refuses sign-in inside apps' built-in browsers ("Android
  and iOS webviews are not supported", Google's supported-browsers page). That covers Instagram,
  Facebook and LinkedIn, all channels in the plan. The email-and-code path must always work.
- **The form never reveals who's on the list** (D-037). The invite link is computed from the email,
  so a new and a repeat email get the same answer. Progress is shown only after the email is checked.
- **No line, no ranks** (brief §15: "a number in a line isn't something you own"). There's one
  threshold and one reward, and it doesn't push anyone back: the waitlist keeps its whole window.
- **Honest scarcity.** Without a limit, people with the early hour could mint all 1,000 before the
  window opens, and "nobody's window changes" would be true but empty. A limit keeps most of the
  collection for the window. The copy says the number.

## Decisions to record in Part 0

These are the defaults. Part 0 writes them up (they may group into two or three D-numbers) and
Yash approves them.

1. **Who counts.** A friend counts for you when their sign-up:
   - came through your link (the first link they joined through wins, and joining again never
     changes it);
   - checked its email, by Google or a code, before the early hour starts;
   - is a different inbox from yours.

   One inbox counts once.
2. **One sign-up per inbox.** Emails are compared folded:
   - trimmed and lowercased, as now;
   - `+tag` dropped, on every domain;
   - dots dropped for `gmail.com` and `googlemail.com` (which becomes `gmail.com`).

   `waitlistSignups` stores this `canonicalEmail` and is unique on it, so `j.ohn@gmail.com` after
   `john@gmail.com` is a repeat. The stored `email` stays as typed (lowercased), and every email is
   sent to it.
3. **Temporary inboxes are refused** at joining, with a plain message. Use a maintained,
   CC0-licensed list of disposable email domains, vendored into the repo with a script that
   refreshes it.
4. **The invite code** is 8 characters of Crockford base32, cut from
   HMAC-SHA256(`canonicalEmail`, `WAITLIST_INVITE_CODE_SECRET`).
   - The same email always gets the same code, so a new and a repeat email get the same answer
     (D-037).
   - Codes are case-insensitive, and the link is `https://stridemon.xyz/waitlist?ref=<code>`.
   - The secret must not change during the campaign: a new one changes every link.
5. **Progress only to its owner.** Counts and early-hour status show only after the email is
   checked (Google or a code). An invite code alone shows nothing. No leaderboard, no place in a
   line, no per-person numbers in public.
6. **Google as a second way to check an email.** `POST /v1/pass/email-google` takes the ID token
   from the website's Sign in with Google button and checks it on the server: Google's keys, the
   issuer, our client ID as the audience, not expired, and `email_verified`. It answers the same
   **email proof** as `/v1/pass/email-verify`, so everything that takes a proof takes one from Google
   too: joining, the invites page and the mint. Only the email is kept, never the name, photo or
   Google account id.
7. **Turnstile on joining** (`POST /v1/waitlist`, action `join-waitlist`), D-037's "free next step".
   Turnstile now does the bot work, and many Indian mobile users share one IP (carrier NAT), so the
   per-IP limit on joining rises from 5 to about 30 a minute.
8. **The email budget.** Waitlist codes come out of the same 300 a day as the mint's codes.
   - The API counts every email it sends, per UTC day.
   - It stops sending waitlist codes once the day's count of all emails reaches
     `WAITLIST_CODE_DAILY_EMAIL_LIMIT` (250, Yash), so the rest stay for mint codes and tests. Past the limit, the page says so and offers Google, or tomorrow.
   - Mint codes are never refused by our count. Brevo's own refusal is already handled
     (`EMAIL_SEND_FAILED`).
9. **The promise.** "One email, when the waitlist window opens, and nothing else" becomes "We email
   you a code only when you ask for one, and once when the waitlist window opens. Nothing else."
   There's no welcome email: the card and the invites page carry the link.
10. **The early hour is a schedule phase**, `earlyHour`, between `preview` and `waitlistWindow`. It
    starts `PASS_EARLY_HOUR_MINUTES` (60) before the window and mints at most
    `PASS_EARLY_HOUR_MINT_LIMIT` (250) passes.
    - In it, a mint needs an email that joined before the early hour started and has 3 confirmed
      friends.
    - The limit is exact, decided by the database (never a read-then-check), and a mint that fails
      gives its place back.
    - The app and the website go by the same phase.
11. **The window email stays one email** (D-043). `pass:send-waitlist-emails --early-hour`, run
    before 19:00 IST, sends it first to people with the early hour, worded with both times. Everyone
    else gets today's email from the normal run.
12. **Words.**
    - Say invite, confirmed friends, and the early hour (or Yash's name for it).
    - Never say whitelist, WL, allowlist, points, rank, or anything about value (`social/voice.md`).
    - The copy says plainly that the waitlist doesn't promise a pass: 1,000 passes, first come,
      first served, and at most 250 in the early hour.

**Not in this build:** partner early-hour spots (plan §8, undecided), prizes, ads, a different email
provider (Yash decides after 11-03; keep everything behind `EmailSender` so it's a swap), a
leaderboard, new analytics.

---

## Part 0: Decide and write the docs

**Goal:** the decisions above are written, approved by Yash, and in every doc they touch. No code.

### Read first

- This file; `waitlist-growth-plan.md` §4.1 and §8; `social/voice.md`
- `decisions.md` D-037, D-043, D-045, D-049, D-050, D-055; `founding-pass-brief.md` §5.1 and §15
- `architecture/data-model.md` (`waitlistSignups`, `passEmailCodes`, `foundingPassMints`),
  `backend-api.md`, `security.md`
- `website/src/content/waitlist.ts`, `apps/api/.env.example`

### Yash does (ask at the start; the docs go on meanwhile)

- **Fill in the table at the top of this file.**
- **A Google OAuth client** in Google Cloud Console (free):
  1. Create a new project, "StrideMon".
  2. In Google Auth Platform (formerly "OAuth consent screen"), set the branding:
     - app name StrideMon and a support email;
     - home page `https://stridemon.xyz` and privacy policy `https://stridemon.xyz/privacy`;
     - authorised domain `stridemon.xyz`.
  3. Set the audience to **External** and publish it ("In production"). With only the default
     scopes (openid, email, profile), Google doesn't need to review the app. A logo would need
     brand verification, so leave it out.
  4. Create a client of type **Web application**, with authorised JavaScript origins
     `https://stridemon.xyz`, `http://localhost` and `http://localhost:3000`. Google asks for both
     localhost forms for local testing.
  5. Copy the **client ID**. It's public, not a secret.
- **`WAITLIST_INVITE_CODE_SECRET`**: generate it on the server with `openssl rand -hex 32`, and
  keep it only in the server's `.env`.

### Do

1. Write the decisions in `decisions.md` (Decision, Why, Trade-off, Revisit when, like D-055).
   Add a "Changed by D-0xx" line where they change D-037, D-043, D-050, D-055 and brief §15. Don't
   rewrite old decisions.
2. Update `data-model.md` (the new fields and indexes), `backend-api.md` (the routes in Part 1 and
   the phase in Part 4), `security.md` (the Google check, Turnstile on joining, the invite secret,
   what's stored), and `apps/api/.env.example` (each new variable, documented).
3. Add a section to `deployment.md` for this rollout (Part 3's order), including the Google steps
   above.

### Done when

The decisions are approved by Yash, the docs match them, and nothing else changed.

---

## Part 1: API

**Goal:** every route the website needs works on the local stack, with tests.

### Read first

- Part 0's decisions and the docs it changed
- `docs/conventions/coding-standards.md`, `conventions/testing.md`, `architecture/backend-api.md`
- `apps/api/src/`:
  - waitlist: `routes/waitlist/`, `handlers/waitlist/join-waitlist.ts`,
    `repositories/waitlist-signups-repository.ts`;
  - the email check: `handlers/founding-pass/send-pass-email-code.ts`, `verify-pass-email-code.ts`,
    `assert-turnstile-token-valid.ts`, `lib/founding-pass/email-code.ts`, `email-proof.ts`,
    `pass-emails.ts`;
  - services: `email-sender.ts`, `turnstile-verifier.ts`;
  - plugins: `env.ts`, `cors.ts`, `mongo-indexes.ts`, `rate-limit.ts`, `pass-services.ts`;
  - the tests next to each.
- `packages/shared/src/api-contracts/waitlist.ts`, `founding-pass.ts`, `email-address.ts`;
  `packages/shared/src/domain/api-error-code.ts`

### Build

1. **Folding emails** (pure, in `lib/`): decision 2. Test dots, `+tags`, googlemail, uppercase,
   dots kept on other domains, and a `+` at the start of the address.
2. **Invite codes** (pure): build a code from a canonical email and the secret, and read one from a
   `?ref=` value: case-insensitive, Crockford's look-alikes (I and L → 1, O → 0), and `null` for
   anything else. Test them.
3. **Temporary inboxes:** the vendored list (its source and licence noted beside it), a refresh
   script in `package.json`, and a pure `isDisposableEmailDomain`.
4. **Contracts** (`@stridemon/shared`), mirrored by hand in the website (it never imports shared,
   D-035):
   - Joining takes `turnstileToken`, plus an optional `inviteCode` (dropped, not refused, when it's
     malformed, like `source`) and an optional `emailProof`. It answers
     `{ status: 'joined', inviteUrl }`, the same for a new and a repeat email.
   - `POST /v1/pass/email-google` takes `{ googleIdToken }` and answers the same shape as
     email-verify.
   - Sending a code takes `purpose: 'mint' | 'waitlist'` (default `mint`). The purpose picks the
     email's words, the Turnstile action and whether the daily limit applies.
   - `POST /v1/waitlist/invites-session` takes `{ emailProof }`. It confirms the sign-up (if the
     email is on the list) and answers a 30-day **invites token** (HS256, its own audience) with
     the invites.
   - `GET /v1/waitlist/invites` (`Authorization: Bearer <invitesToken>`) answers
     `{ isOnWaitlist, inviteUrl, confirmedFriendCount, requiredFriendCount, hasEarlyHour,
     isEmailConfirmed, countsUntil }`.
   - `GET /v1/waitlist/count` answers `{ signupCount }`, cached for about a minute.
   - New error codes for each new refusal: a temporary inbox, the daily code limit, and Google
     being unavailable or refusing.
5. **`waitlistSignups`:**
   - New fields: `canonicalEmail` (unique), `inviteCode`, `invitedByInviteCode` (or `null`),
     `emailConfirmedAt` and `emailConfirmedBy: 'google' | 'code'`.
   - Joining upserts on `canonicalEmail` with `$setOnInsert`. Confirming sets `emailConfirmedAt`
     once (the first confirmation stays).
   - **Make the unique index partial** (`canonicalEmail: { $exists: true }`). A plain unique index
     treats every old document's missing field as `null`, and the API would fail to boot.
   - A one-off, idempotent `waitlist:backfill-canonical-emails` script fills old sign-ups. It stops
     and prints both if two old sign-ups fold to one inbox, so Yash decides.
6. **Joining:** run the checks cheapest first.
   1. The honeypot, as now.
   2. Turnstile.
   3. The temporary-inbox check.
   4. Fold the email and upsert it, with its own code and the inviter's. Your own code never counts
      as your inviter.
   5. If an email proof came with it for the same inbox, confirm the sign-up.
   6. Answer.
7. **Google:** a `GoogleIdTokenVerifier` service, injected the way `TurnstileVerifier` is, with a
   fake in tests. Verify with `jose` (already a dependency) against Google's published keys,
   cached. `GOOGLE_CLIENT_ID` is optional: without it the route refuses with its own code, and the
   website hides the button.
8. **The daily count:** one document per UTC day (`emailDailyCounts`, kept about a week).
   - Every send increments it atomically: mint codes, waitlist codes and window emails.
   - A waitlist code is refused once the day's count reaches the limit, with `retryAfterSeconds`
     until 00:00 UTC.
   - The waitlist code email's words: "Your code is 123456. Type it on stridemon.xyz to confirm your
     email for the StrideMon waitlist. It works for 10 minutes. Didn't ask for it? Ignore this
     email."
9. **Counting friends:** sign-ups whose `invitedByInviteCode` is yours, confirmed before the early
   hour starts, and not your own inbox. Index it for this query. `hasEarlyHour` is that count
   reaching the threshold, and `countsUntil` is the early hour's start.
10. **CORS:** open `/v1/waitlist/*` to the site's origins, the same way the other browser routes
    are open.
11. **Rate limits per IP:** joining 30 a minute, Google 10, the invites session 10, reading invites
    30, the count 60. Codes stay as they are.

### Check

- `bun run db:start`, then `bun test` in `apps/api`, plus `bun run typecheck` and `bun run lint`
  at the root.
- The tests must cover:
  - **joining:** a new, repeat and dot-variant email give the same answer and one document; the
    first invite wins; your own code is ignored; a missing or failed Turnstile token answers 403;
    a temporary inbox answers 400; the honeypot stores nothing;
  - **Google**, with the fake: a valid token, `email_verified: false`, the wrong audience, an
    expired token;
  - **the daily limit:** once the day's count reaches the limit (250), a waitlist code is refused
    while mint codes still go;
  - **counting:** only confirmed friends from before the cutoff, never your own inbox;
  - **the count route.**
- Then exercise each route by hand with `curl` against `bun run pass:local-stack`. Development logs
  emails and never sends them.

### Done when

Every route works on the local stack, the tests pass, and the docs match the code.

---

## Part 2: Website

**Goal:** a visitor can join with Google or an email, share their link anywhere, and see their
invites. A friend can join through the link and confirm.

### Read first

- Parts 0 and 1; `website/README.md`; `website/AGENTS.md` (this Next.js has breaking changes:
  read its docs in `node_modules/next/dist/docs/` before writing code)
- `architecture/design-system.md` (the quiet Lusion look), D-050, D-055, `social/voice.md`
- `website/src/`:
  - the waitlist: `components/ui/waitlist-form.tsx`, `waitlist-joined-card.tsx`,
    `waitlist-phase-gate.tsx`, `lib/waitlist-request.ts`, `content/waitlist.ts`;
  - the email check and Turnstile: `components/founding-pass/turnstile-check.tsx`,
    `email-check-step.tsx`, `lib/founding-pass/pass-api.ts`;
  - shared helpers: `content/site.ts`, `lib/browser-storage.ts`, `lib/build-x-post-url.ts`;
  - help and privacy: `content/help.ts`, `content/legal/privacy-policy.ts`

### Build

1. **`?ref=`:**
   - Read it on any page and keep it in `sessionStorage` for the visit, so a friend who browses
     `/pass` first still joins with it.
   - Send it with the join.
   - A visitor's own code never replaces the friend's code they arrived with.
2. **The form:**
   - **Continue with Google** comes first: Google's official button, with its script loaded only
     when the form is on screen.
   - Then the email field and Join, as today.
   - Turnstile (`join-waitlist`) stays out of sight unless it needs a tap.
   - In apps' own browsers (Instagram, Facebook, LinkedIn, Android WebViews), the Google button
     becomes one line: "Google sign-in doesn't work inside this app. Use your email, or open this
     page in Chrome or Safari."
   - A temporary inbox gets its own plain message.
3. **The card** (D-055 grows):
   - **The link and sharing:**
     - Your invite link, with Copy.
     - WhatsApp (`https://wa.me/?text=`), Telegram (`https://t.me/share/url?url=…&text=…`), X (as
       now), and the phone's share sheet (`navigator.share`, only where it exists).
     - Each shared link carries `ref` and its own `source`: `invite-whatsapp`, `invite-telegram`,
       `invite-x`, `invite-share` or `invite-copy`.
     - The share texts follow `voice.md`: no hashtags, no emoji, nothing about value.
   - **The early-hour line:** "Bring 3 friends who confirm their email, and your window opens at
     19:00 IST, an hour early. At most 250 passes go in that hour."
   - **After a Google join:** "0 of 3 friends confirmed" right away.
   - **After an email join:** "Confirm your email to see your invites", with a 6-digit code. The
     same code makes the invite of whoever sent them count. It's optional, and skipping it never
     blocks anything.
4. **`/waitlist/invites`** (static, `noindex`):
   - Check your email (Google or a code), then see your link and share buttons, the count, and
     whether you have the early hour. Add "Friends who confirm before Sat 28 Nov, 19:00 IST count."
   - The invites token stays in `localStorage` for 30 days (wrapped as `browser-storage.ts` does),
     so a return visit costs no email. "Use a different email" clears it.
   - Every state has a next step:
     - not on the list: the form;
     - no friends yet: share;
     - 3 confirmed: "You have the early hour";
     - the day's code limit reached: Google, or tomorrow;
     - the API can't be reached: try again, and a help link.
5. **The count:** from `GET /v1/waitlist/count`, shown only from 1,000 sign-ups: "1,240 people on
   the waitlist for 1,000 passes".
6. **Sharing everywhere:** the same share row on a pass's details and after a mint, carrying the
   visitor's `ref` when this browser has one.
7. **Copy:** the new promise (decision 9) everywhere the old one appears, including `/waitlist`'s
   description.
8. **Help** (`content/help.ts`): answers to these:
   - How do invites work?
   - Why doesn't my friend count yet?
   - I lost my link.
   - Why doesn't Google work in this app's browser?
   - Why did codes stop for today?

   Then run `bun run help:export-knowledge` (the API needs a redeploy for it).
9. **Privacy:**
   - Google sign-in: we get only your email, and Google sees that you signed in to StrideMon.
   - Turnstile on joining.
   - Who invited whom is stored.
   - Confirmation codes.

### Check

- In `website/`, `bun run typecheck` and `bun run build` (the static export); at the root,
  `bun run lint`.
- Run it against the local API (`website/README.md`):
  - On the laptop, Google works on `http://localhost:3000`.
  - On Yash's Android phone, through the local stack's tunnel, only codes work: a tunnel's random
    hostname can't be a Google origin.
- **Stuck-point check:** walk every path, failures included. Do it in Chrome, in Instagram's own
  browser (paste the link into an Instagram DM) and from a WhatsApp chat. Every path must end in a
  next step.
- Lighthouse on the landing page: performance doesn't drop, because Google's script loads only
  when it's needed.

### Done when

On the local stack, Yash has done all of this:
- joined with Google, and joined with an email;
- shared an invite to WhatsApp;
- had a second email join through it and confirm;
- seen "1 of 3 friends confirmed" on the first one's invites page.

---

## Part 3: Launch the loop (Yash runs it, Claude drafts)

**Goal:** the loop is live on `stridemon.xyz`, checked by hand, and announced.

### The order

1. Export `waitlistSignups` from Atlas first: Collections → Export, or `mongoexport` with the
   Atlas URI.
2. Put the new variables in the server's `.env` (`deployment.md`, Part 0's section).
3. Redeploy the API. Then run `bun run waitlist:backfill-canonical-emails` once, on the server.
4. Deploy the website to Vercel. Do it within minutes of the API: a page opened before the deploy
   sends no Turnstile token, and its join fails until it's reloaded. The error already says "try
   again".
5. **The real check, on the live site:**
   - join with Google from Chrome on the phone;
   - join with an email from Instagram's own browser;
   - confirm with a code (a real Brevo email, one of the 300);
   - share the invite;
   - see "1 of 3 friends confirmed".
6. **Announce it.** Claude drafts in `social/`: posts on both X accounts, an Instagram Story, the
   personal WhatsApp message (plan §10), a LinkedIn post and that week's DeltaV update. Yash
   approves and posts each one.

### Done when

It's live, Yash has checked it, and the announcement drafts are approved.

---

## Part 4: Mint night

**Goal:** on 11-28, people with the early hour mint from 19:00 IST, up to the limit; everyone on the
waitlist mints from 20:00 IST as planned; and most email checks use no email.

**Deadline: before early access starts (Sat 11-21),** so that Founding Pass Part 9's rehearsal
includes the early hour.

### Read first

- D-043, D-045, D-049, D-050; `founding-pass/part-9-rehearsal.md` and `part-10-launch.md`
- The API (`apps/api/src/`):
  - the schedule: `lib/founding-pass/pass-schedule.ts`;
  - the mint: `handlers/founding-pass/assert-pass-minting-open.ts`, `request-founding-pass-mint.ts`,
    `repositories/founding-pass-mints-repository.ts`, and the outbox code that marks a mint failed;
  - the window email: `jobs/send-waitlist-window-emails.ts`, `cli/send-waitlist-window-emails.ts`;
  - the local stack: `cli/start-local-pass-stack.ts`
- The website (`website/src/`):
  - the schedule: `lib/founding-pass/pass-schedule.ts`, `content/founding-pass.ts`;
  - the mint UI: `components/founding-pass/pass-schedule-panel.tsx`, `get-ready-section.tsx`,
    `email-check-step.tsx`, `pass-mint-dialog.tsx`, `mint-problem-note.tsx`
- The app: `apps/mobile/src/features/founding-pass/founding-pass-gate-copy.ts` and its tests

### Build

1. **The phase:**
   - `PASS_SCHEDULE_PHASES` gains `earlyHour`.
   - `calculatePassSchedulePosition` (the API's and the website's copy) returns it from
     `waitlistWindowStartsAt − PASS_EARLY_HOUR_MINUTES`.
   - `passScheduleSchema` gains `earlyHourStartsAt`, and `isEarlyAccessGateOn` handles the new
     phase (the gate stays on).
   - Config gains `PASS_EARLY_HOUR_MINUTES` and `PASS_EARLY_HOUR_MINT_LIMIT`.
   - The website's `plannedPassScheduleTimes` gains `earlyHourStartsAt`, and it must match the API
     (`CLAUDE.md`).
   - `pass:local-stack` takes `--phase earlyHour`, plus a way to seed a sign-up with 3 confirmed
     friends.
2. **An old app build must not break during the early hour.** The app parses the schedule with the
   shared schema, so an app without `earlyHour` would fail to read it for that hour. Check how it
   parses it, then do one of two things:
   - ship the new build before 11-21 (Founding Pass Part 10 has a build anyway);
   - or make the app read an unknown phase as `preview`.

   Write down which one in the decision.
3. **The gate:**
   - In `earlyHour`, the proof's email must belong to a sign-up from before the early hour, with
     enough confirmed friends (Part 1's count, frozen at the early hour's start).
   - Refusals, each with `waitlistWindowStartsAt`: `PASS_EARLY_HOUR_ONLY` for not enough friends,
     and `PASS_EARLY_HOUR_FULL` for the limit reached.
   - The waitlist window's check also finds the sign-up by canonical email now.
4. **The limit, exact under a rush:** a failed mint frees its place.
   - Either reserve a place with an atomic counter after the repeat check, and give it back on any
     later refusal and in the code that marks a mint failed;
   - or give each live early-hour mint a slot number under a unique partial index, the way designs
     are held.

   Pick one, and test 300 requests at once against 250 places: exactly 250 are accepted.
5. **Google wherever an email is checked:** "Get ready" and the mint dialog's email step get
   Continue with Google next to Send code. It's the same email proof. In apps' own browsers, only
   codes.
6. **The website:**
   - The schedule panel and How it works show the early hour, with its limit.
   - "Get ready" shows from a day before the early hour.
   - The two new refusals get plain words and help answers (`mintProblemHelpTopicIds`).
   - `/waitlist/invites` counts down to 19:00 for people with the early hour.
   - Dates show in the visitor's time (D-050).
7. **The window email:**
   - `pass:send-waitlist-emails --early-hour` emails only the sign-ups with the early hour (worked
     out when it runs). Their version says both times: "Your early hour starts Sat 28 Nov, 19:00
     IST. If you don't mint then, your waitlist window is 20:00 IST to Mon 30 Nov, 20:00 IST."
   - Everyone else gets today's email from the normal run.
   - It's still at most one email per address (`windowEmailSentAt`).
8. **The app:** `founding-pass-gate-copy.ts` and its tests handle `earlyHour`, with the preview's
   words and the early hour's time.
9. **Help:**
   - Add "What is the early hour?" and answers for the two refusals.
   - Run `bun run help:export-knowledge`.
   - Add two questions to the chatbot's test list. `help:check-answers` runs against the live
     model, so ask Yash first: it costs a few cents.
10. **Docs:**
    - Founding Pass Part 9's rehearsal gets the early-hour paths.
    - Part 10's launch calendar gets who runs `--early-hour` and when: before 19:00 IST on 11-28.

### Check

- **API tests:**
  - the phase boundaries;
  - the gate (enough friends, too few, joined too late);
  - the 300-at-once race;
  - a failed mint freeing its place;
  - the window email's order and words.
- The app's tests, and the website's typecheck and build.
- **On the local stack**, with `PASS_EARLY_HOUR_MINT_LIMIT=2`:
  - an email with 3 confirmed friends mints in the early hour;
  - one without them is refused with the right words;
  - the third early mint is refused as full;
  - the waitlist window opens on time for everyone.

### Done when

All of the above passes, and Yash has seen the early hour on the local stack: one mint, both
refusals, and the window opening.

---

## Rules for every part

- **One part per session.** Stop at "Done when", report, and wait for Yash.
- **Docs first.** If the code must differ from this file or a decision, change the doc first.
- **Never run git** (the workspace `CLAUDE.md`).
- **Never send real email from a local run:** development logs it. Only Part 3's live check sends
  real email.
- **Never run the local API against testnet.** Test on the local stack (Anvil).
- **Ask Yash first** before anything that deploys, costs money, sends real email or sends a testnet
  transaction.
- **Search `packages/shared` and `packages/chain` before writing anything new.** Follow
  `coding-standards.md`: routes are thin, `lib/` is pure, Mongo goes through `repositories/`, and
  names are full words.
- **Nobody gets stuck.** Every screen says what's happening, what to do next and where to get help.
  Every error has plain words and a help link.
- **Quiet UI**, the Lusion look: no confetti, no badges shouting at people, no countdown pressure
  beyond the real dates.
- **Done means done:** typecheck, lint and tests pass, and the part's own check passes.

## Parts

| Part | What | Size | State |
|---|---|---|---|
| 0 | Decide and write the docs. Yash: the table, the Google client, the invite secret | S | **Done** 2026-10-18 (D-056 to D-058, approved by Yash) |
| 1 | API: folded emails, invite codes, Turnstile, Google email check, waitlist codes with a daily limit, invites, the count | L | **Done** 2026-10-18 |
| 2 | Website: join with Google or email, the invite card and sharing, `/waitlist/invites`, the count, help, privacy | L | **Done** 2026-10-18 (checked by Yash on the local stack) |
| 3 | Launch the loop: the deploy order, the backfill, the live check, the announcement (Yash runs it) | S | Not started |
| 4 | Mint night: the early-hour phase and limit, Google on "Get ready", the window email, the app, help (before 11-21) | M | Not started |
