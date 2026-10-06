# Roadmap

The hackathon is 2–6 weeks out. Phases 0–7 deliver the complete MVP defined in
`MVP.md` §26, Phase 8 makes it demo-proof, and Phases 9–10 are after the MVP.

Each phase is **vertical**: it ends with something you can run and show, not a
half-built layer. Each one has a detailed spec in [`phases/`](phases/).

```text
 Phase 0  Foundations ──────────────┐
 Phase 1  Smart contracts ──────────┤  chain + skeleton
 Phase 2  Wallet & sign-in ─────────┤
 Phase 3  Starter Sneaker & home ───┘  ← "I own a Sneaker NFT on Monad"
 Phase 4  Activity tracking ────────┐
 Phase 5  Settlement & rewards ─────┘  ← "I ran and earned STRIDE"
 Phase 6  Repair & upgrade ─────────   ← "I improved my Sneaker"
 Phase 7  Sneaker transfer ─────────   ← MVP COMPLETE (MVP.md §26)
 Phase 8  Demo hardening ───────────   ← hackathon-ready
 ─────────────────────────────────────────────── hackathon line
 Phase 9  Marketplace (optional)
 Phase 10 Beyond the hackathon (mainnet readiness, scale)
```

| Phase | Name | Size | Demo at the end |
|-------|------|------|-----------------|
| 0 | [Foundations](phases/phase-00-foundations.md) | M | App opens on a real phone and shows the API health status; contracts compile |
| 1 | [Smart contracts](phases/phase-01-smart-contracts.md) | L | Contracts are live and verified on Monad testnet; a full game loop runs via `cast` |
| 2 | [Wallet & sign-in](phases/phase-02-wallet-and-sign-in.md) | M | Connect wallet, sign in, see your address and MON balance |
| 3 | [Starter Sneaker & home](phases/phase-03-starter-sneaker-and-home.md) | M | A new wallet receives a Sneaker NFT; home shows stats, energy and balance from the chain |
| 4 | [Activity tracking](phases/phase-04-activity-tracking.md) | L | Walk outside and see live time, distance, speed and an estimated reward; the server validates the run |
| 5 | [Settlement & rewards](phases/phase-05-settlement-and-rewards.md) | M | STOP → STRIDE arrives in your wallet and durability drops on-chain |
| 6 | [Repair & upgrade](phases/phase-06-repair-and-upgrade.md) | S | Spend rewards to repair and to level up; the stats change on-chain |
| 7 | [Sneaker transfer](phases/phase-07-sneaker-transfer.md) | S | Send the Sneaker to wallet B, and B sees it. **MVP done.** |
| 8 | [Demo hardening](phases/phase-08-demo-hardening.md) | M | The full `MVP.md` §21 demo runs on a hosted API without surprises |
| 9 | [Marketplace](phases/phase-09-marketplace.md) | M | List a Sneaker for MON; another wallet buys it |
| 10 | [Beyond the hackathon](phases/phase-10-beyond-hackathon.md) | — | A backlog, not a sprint |

Sizes: **S** ≈ 1–2 days, **M** ≈ 3–4 days, **L** ≈ 5–6 days of focused work.
Phases 0–8 come to roughly 4–5 weeks.

**If time runs short:** protect Phases 0–7 in order. Cut Phase 8 down to "hosted
API + demo wallets + demo script". The optional durability-below-50 penalty
(Phase 6) and the on-chain SVG art (Phase 8) are the first features to drop.

## How to run a phase

1. Read the phase spec and the architecture docs it links to.
2. If the spec is wrong or missing something, **update the doc first** and then build.
3. Build in the order the spec lists (usually contract/shared → API → mobile).
4. Check every item in the phase's *Definition of done*, including tests.
5. Run the phase's demo check on a real device.
6. Update the status table in `docs/README.md`.

## Naming (decided — see `decisions.md` D-014)

| What | Value |
|------|-------|
| Product name | **StrideMon** (domain `stridemon.com`) |
| App slug / bundle id / Android package | `stridemon` / `com.stridemon.app` |
| Reward token | name `Stride`, symbol **`STRIDE`**, 18 decimals, contract `StrideToken` |
| npm workspace scope | `@stridemon/*` |
| MongoDB database | `stridemon` |

## Open questions (answer before the phase that needs them)

| Question | Needed by | Default if unanswered |
|----------|-----------|-----------------------|
| Energy regeneration speed for the demo | Phase 1 (config, changeable later) | 1 point / 30 min |
| API hosting provider | Phase 8 | **Answered (D-028):** Bun under PM2 on Yash's EC2 instance, Atlas cluster shared with `meAsAgent` |
| Apple / Google developer accounts for store builds | Phase 8 | Demo uses dev builds / internal distribution |
