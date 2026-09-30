# Testing

Test what would hurt if it broke: game math, anti-cheat, money flows,
idempotency. Don't chase a coverage number on glue code.

## By package

| Package | Runner | Focus |
|---------|--------|-------|
| `packages/contracts` | `forge test` (unit, fuzz, invariant) | Every rule in `game-rules.md`; roles; idempotent settlement; burn-only-from-sender; reward-supply invariant |
| `packages/shared` | `bun test` | Game-rule mirror vs fixtures; unit helpers; schema edge cases |
| `apps/api` | `bun test` + `fastify.inject` against a throwaway Mongo database and, for chain calls, a local Anvil | `lib/activity-validation` (heavy); route contracts; auth flow; outbox idempotency |
| `apps/mobile` | `jest-expo` + React Native Testing Library | Hooks with logic (`useActiveActivitySession`), formatting, screens' loading/empty/error states |
| End to end | Maestro (Phase 8) | The demo script from `MVP.md` §21 on a real build |

## One formula, two languages: shared fixtures

The reward, energy and durability formulas exist in Solidity (the authority) and
TypeScript (the estimates). They are kept identical with one fixture file:

```text
packages/shared/src/game-rules/game-rule-fixtures.json
{
  "gameConfig": { "maxEnergy": 10, "rewardPerEfficiencyMinuteWei": "500000000000000000", … },
  "session": [
    { "name": "MVP example: 10 minutes at efficiency 10",
      "input":  { "activeMinutes": 10, "currentEnergy": 10, "efficiency": 10, "durability": 100 },
      "expect": { "rewardedMinutes": 10, "rewardAmountWei": "50000000000000000000", "durabilityLoss": 3 } },
    …
  ],
  "energy": […], "repair": […], "upgrade": […]
}
```

- One array per formula, all sharing the file's `gameConfig`, which must equal
  the initial config `DeployGame.s.sol` deploys (a Foundry test checks this).
- Wei amounts are decimal **strings**. A JSON number above 2^53 loses precision
  in JavaScript.

- `packages/contracts/test/GameMath.t.sol` reads it with `vm.readFile` + `vm.parseJson`.
- `packages/shared/src/game-rules/*.test.ts` imports it.

Every rule change adds a fixture. If the two implementations drift, one of the
two test suites fails.

## Activity validation tests

Synthetic GPS traces are built by helpers such as `buildWalkingTrace({ durationSeconds, speedKilometersPerHour })`.
Every validation rule has a passing and a failing case at minimum:

- steady walk at 5 km/h for 10 minutes → 10 active minutes
- car trip at 50 km/h → 0 active minutes
- teleport jump in the middle → that segment is dropped and the rest still counts
- mocked location → rejected
- clock set into the future → samples dropped
- a full minute of standing still inside a walk → that minute doesn't count, while 30 s of
  standing inside a walking minute still does (its average stays in the band, D-021)

## Rules

- Test names describe the behavior: `it('caps rewarded minutes at current energy')`,
  not `it('works')`.
- One behavior per test, following Arrange → Act → Assert.
- Test pure functions without mocks. Test I/O at the boundary with real Mongo
  (a throwaway database) rather than mocking the driver. Chain calls go to a
  local Anvil (`anvil`, from Foundry) that the API test helper starts, never to
  the testnet RPC, so tests don't fail when the network does.
- API tests need `bun run db:start` and Foundry's `anvil` on the `PATH`.
- Outbox and chain-reader tests also deploy the contracts to that Anvil with
  `test-support/deploy-test-contracts.ts`, from Foundry's `packages/contracts/out/`.
  Run `bun run contracts:build` first. Never broadcast `DeployGame.s.sol` to the test
  Anvil: it shares chain id 10143 with the testnet and would overwrite
  `deployments/10143.json` (D-019).
- Tests are part of the phase, not a later phase. A phase isn't done while its
  tests are missing.
