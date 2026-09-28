# Phase 10 — Beyond the Hackathon

This is a backlog, not a sprint. It's ordered roughly by what a real launch
needs first. Each item becomes its own phase doc when it's picked up.

## Mainnet readiness (required before real value)
- External smart-contract audit, plus Slither / static analysis in the pipeline.
- Multisig (e.g. Safe) as `DEFAULT_ADMIN_ROLE`; timelock on `setGameConfig`.
- Game-server key in a KMS/HSM signer, with no raw private key in env.
- Replace the testnet gas drip with a **paymaster / account abstraction**, so
  players don't need MON to repair or upgrade.
- Tokenomics review: emission rate vs sinks, per-day caps and inflation modelling.
- Legal review of the token and the rewards in the target markets.

## Anti-cheat v2
- Correlate the accelerometer and pedometer (`expo-sensors` step count) with GPS.
- Device attestation: App Attest (iOS) and Play Integrity (Android).
- Per-device and per-IP velocity limits, plus anomaly flags for manual review.

## Scale
- A chain indexer that mirrors contract events into Mongo (as a cache) for
  history, leaderboards and marketplace lists.
- Horizontal API scaling. Leases already make the jobs safe across instances;
  add a Redis-backed rate limit.
- Sharding or a time-series collection for `locationSamples`.

## Product
- Embedded wallets (email or social login → wallet) as an alternative to external wallets.
- Leaderboards and achievements (`MVP.md` optional list).
- Multiple Sneaker types (walker, runner) with different speed bands.
- Energy scaled by the number of Sneakers owned.
- Push notifications: "Energy full", "Your Sneaker needs repair".
- Maps and route drawing on the summary screen.
- Store releases (App Store / Play Store) and CI/CD pipelines through EAS.
