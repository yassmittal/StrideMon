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
  Unlike the development build, this one bundles its JavaScript, and `.env`
  files are never uploaded to EAS (they're gitignored). The `EXPO_PUBLIC_*`
  values must therefore be set on the profile (`eas.json` → `env`) or as EAS
  environment variables.

### Product polish
- A visual design pass: theme tokens, a Sneaker illustration, and typography,
  applying [`../architecture/design-system.md`](../architecture/design-system.md)
  (modeled on lusion.co, D-017). Because of the Phase 0–7 discipline, this
  should only touch `theme/`, `components/ui` and the feature components' styles.
  - Token values from design-system §2 to §7. Existing token names are kept, and
    the new ones are added.
  - Fonts: Aeonik (buy the app licence from CoType first) and IBM Plex Mono,
    loaded with `expo-font`, with the splash screen held until they load.
  - The `components/ui` set from design-system §8, including its press
    animations (text roll, dot fill).
  - The Sneaker art sits on the dark `HeroPanel`.
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

### iOS device day (D-022)
- One day with a borrowed iPhone and an EAS iOS development build (needs a paid Apple
  Developer account and the device's UDID registered first).
- Re-run the device checks of Phases 2–7 on it, starting with Phase 4's locked-phone walk:
  the blue location indicator, background delivery, uploads while locked (D-020's keychain
  note), and "kill the app and reopen" losing no samples.

## Definition of done
- [ ] Two full rehearsals on the hosted stack, on both iOS and Android, without touching a laptop.
- [ ] The explorer links in the app open the right pages.
- [ ] The pause switch has been tested: pausing `SneakerGame` shows a friendly "maintenance" state.
- [ ] No raw hex, pixel or font values outside `src/theme/`, and every screen matches the design-system §9 treatment.
