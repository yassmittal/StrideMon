# Phase 8 — Demo Hardening & Polish

**Goal:** the product survives a live demo in front of judges: a hosted API, a
clean visual design, no dead ends, and a rehearsed script.

Phase 8 is built in **seven parts, in this order** (D-028). Each part ends with a check on the
phone, and work stops for a report after each one. All the product work (8.1 to 8.5) is finished
on the development build against the laptop API. **Deployment comes last (8.6):** the hosted
API, the bundled-JS demo build and the outdoor checks are done once, on the finished app.

| Part | What it delivers | New development build? |
|------|------------------|------------------------|
| 8.1 | Design foundation, applied to sign-in, minting and Home | **Yes** (`expo-font`, `expo-haptics`) |
| 8.2 | Design applied to every other screen | No |
| 8.3 | Sneaker NFT image: on-chain SVG art, also shown in the app | No (contracts are redeployed) |
| 8.4 | Loading, empty, error, offline and paused states; data hygiene | No |
| 8.5 | Demo tooling and a first rehearsal on the development build | No |
| 8.6 | Deployment: EC2, Atlas, the demo build, the outdoor checks | Demo build (bundled JS) |
| 8.7 | iOS device day | iOS development build |

## 8.1 — Design foundation

Applies [`../architecture/design-system.md`](../architecture/design-system.md) (modeled on
lusion.co, D-017). Like every design part, it only touches `theme/`, `components/ui` and the
feature components' styles.

- Token values from design-system §2 to §7. Existing token names are kept, and the new ones are added.
- Fonts: Satoshi (the free fallback from design-system §3.1; no Aeonik licence is bought) and
  IBM Plex Mono, loaded with `expo-font`, with the splash screen held until they load.
- The `components/ui` set from design-system §8, including its press animations (text roll, dot fill).
  8.1 builds the pieces its screens use; `TextField`, `CrossMarks` and `IconCircleButton` come with
  8.2's screens.
- Haptics on START, STOP and success (`expo-haptics`). They're here so that one new development
  build covers both native packages.
- The new fonts and palette reach every screen, because every text style moves to `textStyles`
  and the old weights go.
- Sign-in, "Minting your Sneaker…" and Home get their full design-system §9 layout. Home gets
  its dark `HeroPanel`; the Sneaker art that fills it comes in 8.3.

**On the phone:** the three screens match §9, the fonts load with no flash, START and STOP buzz.

## 8.2 — Design across the app

- Active run, run summary, the Sneaker tab (repair, upgrade, transfer sheets), History and
  Profile get their full design-system §9 layout.
- No raw hex, pixel or font values remain outside `src/theme/`.
- The last three §8 components arrive: `TextField` (transfer address), `CrossMarks` (the active
  run's estimated reward) and `IconCircleButton` (sheet close, transfer back). Their icons are
  drawn with `react-native-svg`, which is already in the development build. The component sizes
  are `layout` tokens (design-system §4.2), and the sheet backdrop is `colors.backdrop` (§2.2).

**On the phone:** every screen matches §9.

## 8.3 — Sneaker NFT image

- `SneakerNft.tokenURI` gains an `image`: an on-chain SVG that reflects level and durability, so
  the explorer and wallets show a picture.
- The app shows the same picture on Home's `HeroPanel`, so the art exists in one place.
- `SneakerNft` builds `tokenURI` itself and can't be changed in place, so this part redeploys the
  contracts on testnet and every wallet starts again from a new starter Sneaker. The local
  database is reset with it. The approach is settled at the start of the part, as D-029.

**On the phone:** Home's Sneaker and the MonadVision / MetaMask image agree, and change after a
repair or upgrade.

## 8.4 — States and data hygiene

- Every screen audited for loading, empty, error and offline states.
- Pausing `SneakerGame` shows a friendly "maintenance" state instead of a failure.
- The explorer links in the app open the right pages.
- `locationSamples` get a 30-day TTL index, and a privacy note goes on the permission explainer.

**On the phone:** airplane mode, a paused contract and each explorer link.

## 8.5 — Demo tooling

- `scripts/prepare-demo-wallets`: two funded testnet wallets. Wallet A has enough rewards for an
  upgrade; wallet B is empty.
- A **demo energy config**: faster regeneration via `setGameConfig`, applied before the demo and
  reverted after.
- A written demo script (`docs/demo-script.md`) that follows `MVP.md` §21, with a fallback for
  each step (e.g. a pre-recorded walk if the venue has no GPS signal).
- Maestro flow for the non-GPS parts (sign-in → home → repair → upgrade → transfer).

**On the phone:** one full rehearsal of the script on the development build.

## 8.6 — Deployment and the outdoor checks

Hosting follows `meAsAgent`'s setup (D-028):

- The API runs with Bun under **PM2 on an EC2 instance**, from `apps/api/ecosystem.config.cjs`
  (one instance, because the background jobs run inside it). Secrets live in `apps/api/.env` on
  the instance. HTTPS sits in front of it on that instance; release Android builds refuse plain
  HTTP.
- **MongoDB Atlas:** the cluster `meAsAgent` already uses, with StrideMon in its own `stridemon`
  database and its own database user, limited to that database. Network access stays restricted
  to the instance.
- Structured logs: Pino's production JSON, read with `pm2 logs`.
- The health check is `GET /health`.
- An EAS build profile for the demo (internal distribution), pointing at the hosted API. Unlike
  the development build, this one bundles its JavaScript, and `.env` files are never uploaded to
  EAS (they're gitignored). The `EXPO_PUBLIC_*` values must therefore be set on the profile
  (`eas.json` → `env`) or as EAS environment variables.
- **Never run the local API against testnet while the hosted one is live.** Both send with the
  same game-server key from different databases, so their transaction nonces would collide.

Then Phase 4's outdoor checks (D-025), on the hosted API with the demo build:

- A 10-minute locked-phone walk on a 400 m track (distance within ~10% of laps × 400 m), a car
  ride as a passenger (0 active minutes), and kill-and-reopen mid-walk (no samples lost).

**On the phone:** Wi-Fi off, laptop closed: sign in, walk, settle, History. Then the outdoor
checks and a full rehearsal on Android.

## 8.7 — iOS device day (D-022)

- One day with a borrowed iPhone and an EAS iOS development build (needs a paid Apple
  Developer account and the device's UDID registered first).
- Re-run the device checks of Phases 2–7 on it, starting with Phase 4's locked-phone walk:
  the blue location indicator, background delivery, uploads while locked (D-020's keychain
  note), and "kill the app and reopen" losing no samples. The outdoor checks run again here.

## Definition of done
- [ ] Two full rehearsals on the hosted stack, on both iOS and Android, without touching a laptop.
- [ ] The explorer links in the app open the right pages.
- [ ] The pause switch has been tested: pausing `SneakerGame` shows a friendly "maintenance" state.
- [ ] No raw hex, pixel or font values outside `src/theme/`, and every screen matches the design-system §9 treatment.
