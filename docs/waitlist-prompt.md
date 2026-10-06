# Waitlist Prompt

The brief for adding a **waitlist** to StrideMon's landing page: interested people leave an email
and hear when they can play. Paste everything below the line into a fresh Claude Code session
started in the repo root (`monad/`). It's self-contained, and its facts were checked against the
repo on 2026-10-05. Background: [`social-plan.md`](social-plan.md) §15.

## Why it's shaped this way (2026-10-05)

- **"Waitlist", not "whitelist".** On crypto X, a whitelist (WL, allowlist) is a guaranteed spot
  in a token or NFT sale. StrideMon sells nothing, and SOLE has no monetary value, so the word
  would promise the very thing we deny. A waitlist promises one email.
- **Email only, never a wallet address.** A list of wallets reads as an airdrop list. Testnet
  farmers rank projects by expected airdrop
  ([airdrops.io](https://airdrops.io/blog/best-testnets-to-farm-airdrops/)), and asking for a
  wallet would invite them. The app gets the wallet when someone actually plays.
- **The site is a static export** (`output: 'export'`, D-035), so it has no server to receive a
  form. The free options: the hosted StrideMon API (our own Atlas database), a third-party form
  service, or a Google Form link.
- **The API has no CORS today.** Only the mobile app calls it, and native apps don't send an
  origin. A browser on `stridemon.yashmittal.xyz` needs `@fastify/cors`, limited to that origin.
- **`?source=`** is the only free way to see which X account brings sign-ups, because the site has
  no analytics on purpose (D-035).

---

## The prompt

You're adding a **waitlist** to StrideMon's landing page (`website/`). Read `CLAUDE.md`,
`docs/decisions.md` (D-035 above all), `docs/architecture/backend-api.md`,
`docs/architecture/data-model.md`, `docs/architecture/security.md`,
`docs/conventions/coding-standards.md` and `website/README.md` first. Then **give me a short
plan and wait for my go-ahead before writing code.**

### 1. Rules

- **Never run git commands.** Leave every change in the working tree.
- **Don't touch `launch-video/`**: another session is working in it.
- **Don't deploy anything.** No Vercel deploy, no SSH, no PM2. At the end, tell me the deploy steps.
- **Never run the local API against testnet** (CLAUDE.md): it shares the game-server key with the
  hosted one. Tests use local Mongo and the test Anvil as usual.
- The docs come first: the decision and doc updates in §5 go in **before** the code.
- Free only. Ask before adding any third-party service, script, cookie or tracking.

### 2. What the visitor sees

- A short section near the end of the page, before the FAQ, with its own `id` (`waitlist`) and a
  header nav link. It's light, in the page's Lusion look (`docs/architecture/design-system.md`).
- Meta `WAITLIST • ANDROID FIRST`. Heading: **"Get notified when StrideMon opens."** One line under
  it: "StrideMon runs on Monad testnet as an Android demo build today. Leave your email and we'll
  write once when you can play."
- Fields: **email** (required, `type="email"`, `autocomplete="email"`) and **phone** as two pills
  (Android, iPhone), optional. A pill button with the arrow: **Join the waitlist**.
- Under the button, small: "One email when it opens, nothing else. No token sale, no airdrop. SOLE
  has no monetary value. Ask and we'll delete your email."
- After submitting: the form is replaced with "You're on the list." The same message shows for an
  email that was already on the list, so the form never reveals who signed up.
- Errors: one plain line under the field ("That doesn't look like an email.", "Something went
  wrong. Try again in a minute."). No alerts, no exclamation marks.
- A label for each field, keyboard friendly, `aria-live` on the result, and it works on a 360 px
  phone. Motion follows the page's rules and stops under `prefers-reduced-motion`.
- Copy lives in `website/src/content/waitlist.ts`, like every other section.
- Add a FAQ entry: *Can I play now?* "It's an Android demo build on Monad testnet. Join the
  waitlist and we'll email you when it opens."
- Also fix the MetaMask line in `website/src/content/contracts.ts` (`onChainContent.artText`).
  MetaMask shows the art, but it doesn't refresh when the Sneaker changes. Something like: "…so
  the app, MonadVision and MetaMask show the same image. The app and the explorer redraw it when
  you repair or upgrade."
- Remove the `PLACEHOLDER` comment above `githubRepositoryUrl` in `website/src/content/site.ts`:
  the URL is final.

### 3. Where the email goes (decide at the plan gate)

**Recommended: the hosted StrideMon API.** It's free, and the data stays in our own Atlas
`stridemon` database.

- `POST /waitlist` with body `{ email, phonePlatform?: 'android' | 'ios', source? }`. The zod
  contract goes in `packages/shared/src/api-contracts/waitlist.ts`, exported from its `index.ts`.
  The route is thin; a handler and `repositories/waitlist-signups-repository.ts` do the work
  (backend-api.md's layering).
- Collection `waitlistSignups`: `{ _id, email (trimmed, lowercased), phonePlatform, source,
  createdAt }`, with a **unique index on `email`** in `plugins/mongo-indexes.ts`, and documented
  in `data-model.md`. A repeat email is an upsert that changes nothing and answers the same
  `200 { status: 'joined' }`. Never store an IP address or a user agent.
- `source` comes from the page's `?source=` query (for example `x-stridemon`, `x-yash`): at most
  32 characters of `[a-z0-9-]`, otherwise dropped.
- **Abuse:** a stricter per-route rate limit (for example 5 a minute per IP) through the existing
  `@fastify/rate-limit` route config, plus a hidden honeypot field. If it's filled in, answer
  `200` and store nothing. No CAPTCHA.
- **CORS:** add `@fastify/cors` (same version family as the other `@fastify/*` 5.x-compatible
  plugins; check npm), allowing only `https://stridemon.yashmittal.xyz`, plus
  `http://localhost:3000` in development, and only for `/waitlist`. Its origin list is an env value
  validated in `plugins/env.ts`, with `.env.example` updated.
- The site reads the API URL from one constant in `website/src/content/site.ts`
  (`waitlistApiUrl`), next to `siteUrl`.
- **Tests** (`bun test`, real Mongo): a valid sign-up stores one record; the same email twice
  stores one; a bad email gets 400; the honeypot stores nothing; a disallowed origin gets no CORS
  headers. Keep it lean (it's a hackathon build): these cases, nothing more.

**Alternative: a Google Form link.** No code and no API change, but it leaves the page's look,
Google holds the emails, and there's no `source`. Only if I pick it: the section's button opens
the form in a new tab, and nothing else changes.

Name the trade-off in your plan, recommend one, and wait.

### 4. Done means

- Root `bun run lint` passes. `bun run typecheck` and `bun test` pass for `apps/api` and
  `packages/shared`. `bun run build` passes in `website/`.
- The page still meets D-035's targets: Lighthouse ≥ 95 on mobile in all four categories, CLS 0,
  and no new client JavaScript beyond the form's own small island.
- Checked by hand: the local site posting to the local API (Mongo running), in a 390 px window.
  Show me screenshots of the empty, error and joined states.

### 5. Docs (before the code)

- A new decision in `docs/decisions.md`: the next free number after **D-036** (D-036 is reserved
  for the social plan; check that it's there). It says the waitlist replaces D-035's "no
  newsletter form" for this one form, gives where the emails live and why email only, and notes
  that the API now accepts browser requests from the site's origin.
- `data-model.md` (the collection), `backend-api.md` (the route and CORS), `security.md` (CORS, the
  honeypot, the rate limit, deletion on request), `landing-page-prompt.md` §9's "Don't" list (an
  *as built* note), and `website/README.md`.

### 6. When it's built

Report the files changed, the test output, the Lighthouse scores and the screenshots. Then give
me the deploy steps, in order:

1. The API first: what I commit, then `deployment.md`'s "Updating the API later" on the instance,
   plus any new `.env` value, then a `curl` I can run to check CORS from the site's origin.
2. Then the site on Vercel.
3. How I count sign-ups and see them by source: one `mongosh` query against Atlas.
