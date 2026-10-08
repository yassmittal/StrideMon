# Part 3: API

**Goal:** the API does everything the website and app need: email codes, mints, the schedule
(waitlist window, open mint, opening day), the early-access gate, Founder Sneakers and lacing.

## Read first

- The brief §5.3, §7, §9, §10.2 and §15 (what the first attempt taught us), D-041
- `docs/architecture/backend-api.md`, `security.md` and `data-model.md` (updated in Part 0)
- `CLAUDE.md`: never run the local API against testnet. API tests use real Mongo
  (`bun run db:start`) and the throwaway Anvil the test helper starts. Give slow chain tests an
  explicit timeout.

## Yash does (ask at the start, and the rest can be built meanwhile)

- A **Brevo** account, its DKIM and `brevo-code` records in Namecheap (not its DMARC record: see
  §15), and the API key
- **Cloudflare Turnstile** site and secret keys

## Build

1. **Email codes and proof** (§15's rules): 6-digit codes, stored only hashed, valid for 10
   minutes and 5 tries, one a minute per email, and the same answer for new and known emails.
   Sending a code needs a Turnstile token too (D-041), so bots can't use up Brevo's daily 300.
   Verifying returns a short-lived signed **email proof**, good for a few hours, so "Get ready"
   works ahead of time. In development the code is logged. In production the API refuses to boot
   without the Brevo key.
2. **The schedule**, from config: when the waitlist window starts, its 48-hour length, and the
   backup opening date (14 days after the open mint starts, D-041). One function says which
   phase it is (preview, waitlist window, open mint, all minted, open to all), so every route
   and both clients agree.
3. **Mints:** `POST /v1/pass/mints` with the SIWE token, design number, email proof and Turnstile
   token.
   - **During the waitlist window**, the email must have joined the waitlist **before** the window
     opened.
   - One pass per email and per wallet (the chain checks the wallet). The design must be free.
   - It queues the mint in the outbox.
   - Losing a race answers `PASS_ALREADY_MINTED` with 3 similar available designs.
   - Every refusal has its own error code, so the website can show the right plain-words message.
   - `GET /v1/pass/mints/:mintId` returns the mint's state for the reveal.
4. **The collection:** `GET /v1/pass/collection` returns the minted bitmap (cached a few
   seconds), mints still queued, the total, the last 10 mints, and the schedule phase with its
   next time (for the countdowns).
5. **The early-access gate:** while it's on, a starter Sneaker only goes to pass holders. It
   switches off by itself when all 1,000 are minted or the backup date passes. Keep it **off
   until Metropolis judging ends** (2026-10-27).
6. **Founder Sneakers:** a pass holder without a Founder Sneaker gets one (through the outbox,
   with the usual gas drip), even if they already own a normal Sneaker. After opening day,
   everyone else gets today's normal starter Sneaker.
7. **Lacing:** after a wallet's first settlement confirms, queue `setLaced` for its pass.
8. **CORS and limits:** the `/v1/pass/*` routes and SIWE's nonce, verify and refresh routes
   accept the site's origin only (refresh too, so "Get ready" lasts until the mint: D-043), and
   every public route has a per-IP rate limit. In `bun test`, give each
   injected request its own `remoteAddress`.
9. **The waitlist email**, built now and sent in Part 10. The site promises "one email when it opens,
   nothing else", so each waitlist address gets **exactly one** email: "Your 48 hours start now",
   sent when the waitlist window opens. That's the moment a waitlist member can get in. Brevo's
   free plan sends 300 a day: if the list is bigger, start sending earlier, oldest sign-ups first,
   and say in the email when the window opens and closes. The sender reports what it sent and never
   emails an address twice.
10. **The testnet MON budget:** the game-server key pays for every pass mint, Founder Sneaker
    and gas drip. Today's drip alone is about 0.13 MON per new player (`CLAUDE.md`), so 1,000
    founders could need well over 100 MON. Measure the real cost per founder, and tell Yash the
    total and whether to lower the drip. The faucet is slow, so the key has to be funded well
    before launch.

## Tests

Cover the main path, plus the edges the brief names:
- a racing mint for the same design
- one pass per email and per wallet
- the waitlist-window rule (joined before, after, not at all)
- the gate switching off on all-minted and on the backup date
- one Founder Sneaker per pass
- lacing once
- the code limits

## Done when

API tests, typecheck and lint pass. A real code reaches Gmail with DKIM and DMARC both passing
(check "Show original"). The schedule works with its times moved into the past and the future.
Mark Part 3 **Done**, then stop.
