# Phase 8 — Demo Hardening & Polish

**Goal:** the product survives a live demo in front of judges: a hosted API, a
clean visual design, no dead ends, and a rehearsed script.

## Deliverables

### Hosting
- Choose and set up API hosting that supports a **long-running process** (the
  background jobs need it, so serverless functions are out). Add HTTPS and a
  health check.
- MongoDB Atlas free tier, with network access restricted to the host.
- Structured logs you can search during the demo.
- An EAS build profile for the demo (internal distribution), pointing at the hosted API.

### Product polish
- A visual design pass: theme tokens, a Sneaker illustration, and typography.
  Because of the Phase 0–7 discipline, this should only touch `theme/`,
  `components/ui` and the feature components' styles.
- On-chain SVG art in `SneakerNft.tokenURI` that reflects level and durability,
  so the explorer and wallets show a picture. *(This is the first item to cut if
  time is short.)*
- Every screen audited for loading, empty, error and offline states.
- Haptics on START, STOP and success.
- `locationSamples` get a 30-day TTL index, and a privacy note goes on the permission explainer.

### Demo safety
- `scripts/prepare-demo-wallets`: two funded testnet wallets. Wallet A has
  enough rewards for an upgrade; wallet B is empty.
- A **demo energy config**: faster regeneration via `setGameConfig`, applied
  before the demo and reverted after.
- A written demo script (`docs/demo-script.md`) that follows `MVP.md` §21, with
  a fallback for each step (e.g. a pre-recorded walk if the venue has no GPS signal).
- Maestro flow for the non-GPS parts (sign-in → home → repair → upgrade → transfer).

## Definition of done
- [ ] Two full rehearsals on the hosted stack, on both iOS and Android, without touching a laptop.
- [ ] The explorer links in the app open the right pages.
- [ ] The pause switch has been tested: pausing `SneakerGame` shows a friendly "maintenance" state.
