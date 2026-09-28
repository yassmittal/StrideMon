# Game Rules

All numbers here are **initial tuning values**. The rules are enforced by
`SneakerGame` on-chain. The admin can change them through `GameConfig` without
redeploying, and every change emits `GameConfigUpdated`.

`packages/shared/src/game-rules/` mirrors these formulas in TypeScript **for UI
estimates only**. The contract always has the final say.

All arithmetic is integer. Token amounts are `uint256` with 18 decimals
(`bigint` in TypeScript). Durations and distances are whole seconds, minutes
and meters.

---

## Sneaker attributes

| Attribute | Type | Starter value | Range |
|-----------|------|---------------|-------|
| `level` | `uint16` | 1 | 1 … `maxLevel` (30) |
| `efficiency` | `uint16` | 10 | grows with level |
| `durability` | `uint16` | 100 | 0 … `maxDurability` (100) |
| `storedEnergy` + `energyUpdatedAt` | `uint16` + `uint64` | 10, mint time | see Energy |

## Energy

- `1 energy = 1 active minute that can earn rewards` (from `MVP.md` §6).
- `maxEnergy = 10`.
- Energy regenerates by 1 point every `energyRegenerationSeconds`, up to `maxEnergy`.
  - Initial value: **1 point every 30 minutes** on testnet, so a demo wallet
    refills in 5 hours. Tune it later.
- Energy is **computed lazily**. Nothing ticks on-chain:

```text
regeneratedPoints = (now − energyUpdatedAt) / energyRegenerationSeconds
currentEnergy     = min(maxEnergy, storedEnergy + regeneratedPoints)
```

When energy is spent, `storedEnergy` becomes `currentEnergy − spent`, and
`energyUpdatedAt` advances by the regeneration time already credited. It does
**not** reset to `now`, so partial progress toward the next point is never lost.

## Starting a session (checked by the API before it accepts a run)

- The caller owns the Sneaker (`ownerOf(tokenId) == walletAddress`).
- `currentEnergy ≥ 1`.
- `durability ≥ 1`.
- No other active session exists for this wallet **or** this Sneaker.

## Rewarded minutes

The API validates the run (see `security.md` → activity validation) and reports:

- `activeMinutes`: whole minutes in which the average speed stayed inside the
  allowed band (**1 – 20 km/h**). Idle minutes and vehicle-speed minutes don't count.
- `distanceMeters`: the distance covered during those active minutes.

The contract then caps by energy:

```text
rewardedMinutes = min(activeMinutes, currentEnergy)
```

## Reward

```text
reward = rewardedMinutes × efficiency × rewardPerEfficiencyMinute
rewardPerEfficiencyMinute = 0.5 SOLE (5 × 10^17 wei)
```

Check against `MVP.md`: 10 minutes × efficiency 10 × 0.5 = **50 SOLE**. ✓

Distance is stored and emitted for history and anti-cheat analytics, but it
doesn't change the MVP reward. Paying per distance rewards spoofed GPS the most,
while paying per minute inside a speed band limits what a cheater can gain.

## Durability loss

```text
durabilityLoss = ceil(rewardedMinutes × durabilityLossPerMinuteBasisPoints / 10_000)
durabilityLossPerMinuteBasisPoints = 3_000   (0.3 per minute)
```

Check: 10 minutes → `ceil(3.0)` = **3**. ✓ Durability never goes below 0.

- **Durability 0:** the Sneaker can't start a session until it is repaired.
- **Durability below 50:** reward × 0.5. This gives players a reason to repair
  *before* the Sneaker hits zero. *(Optional for MVP. It ships in Phase 6 if time allows.)*

## Repair

```text
repairCost = (maxDurability − durability) × repairCostPerPoint(level)
repairCostPerPoint(level) = 0.7 SOLE + (level − 1) × 0.1 SOLE
```

Check: level 1, durability 72 → 28 × 0.7 ≈ **19.6 SOLE** (`MVP.md` shows ~20). ✓

A repair always restores to `maxDurability`. Partial repairs are Phase 10.

## Upgrade

```text
upgradeCost(level)      = 50 SOLE × level
efficiencyGainPerLevel  = 2
```

Check: level 1 → 2 costs **50**, and efficiency goes from 10 to **12**. ✓

- It requires `level < maxLevel`.
- It doesn't restore durability. Repairing and upgrading are separate decisions.

## Where each rule is enforced

| Rule | Contract | API | Mobile |
|------|:--------:|:---:|:------:|
| Ownership to start a session | — | ✔ enforces | shows |
| Ownership at settlement | ✔ enforces | ✔ pre-checks | — |
| Energy cap on reward | ✔ enforces | ✔ pre-checks | estimates |
| Speed band / plausibility | — | ✔ enforces | shows warnings |
| Reward formula | ✔ enforces | — | estimates |
| Durability loss | ✔ enforces | — | estimates |
| Repair / upgrade cost | ✔ enforces + quotes | — | reads quote |
| One settlement per session | ✔ enforces (`sessionId`) | ✔ enforces (outbox) | — |
