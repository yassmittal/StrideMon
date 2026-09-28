# Coding Standards

This project will grow. What lets it grow is code that a new contributor, or you
six months from now, can read top to bottom without asking what anything means.
These rules exist for that, and they apply to every package.

---

## 1. Naming

**A name should make a comment unnecessary.**

### 1.1 Use full words

| ❌ | ✅ |
|----|----|
| `usr`, `u` | `user` |
| `sess`, `s` | `activitySession` |
| `cfg`, `conf` | `gameConfig` |
| `res`, `data`, `result` (as the only name) | `sneakerAttributes`, `verifyResponse` |
| `tmp`, `val`, `item`, `obj` | say what it is |
| `e` in a catch | `error` |
| `i` | fine for a plain index in a short loop; otherwise `sampleIndex` |

Accepted abbreviations: `id`, `url`, `api`, `nft`, `jwt`, `rpc`, `abi`, `siwe`, `gps`.

### 1.2 Put units in names

This is a GPS and token app, and unit bugs are the bugs we'll actually ship.

| ❌ | ✅ |
|----|----|
| `distance` | `distanceMeters`, `distanceKilometers` |
| `duration`, `time` | `durationSeconds`, `activeMinutes` |
| `speed` | `speedMetersPerSecond`, `speedKilometersPerHour` |
| `reward`, `amount` | `rewardAmountWei` (bigint) or `rewardAmountDisplay` (formatted string) |
| `timeout` | `timeoutMilliseconds` |
| `regenRate` | `energyRegenerationSeconds` |

### 1.3 Booleans read as yes/no questions

`isActive`, `hasClaimedStarterSneaker`, `canStartSession`, `shouldShowRepairPrompt`.
Never `active`, `flag` or `status` for a boolean.

### 1.4 Functions start with a verb and say what they return or do

| Kind | Pattern | Examples |
|------|---------|----------|
| Computes | `calculate…`, `compute…` | `calculateSessionReward`, `calculateHaversineDistanceMeters` |
| Reads (I/O) | `fetch…`, `read…`, `find…` | `fetchSneakerAttributes`, `findActiveSessionByWallet` |
| Writes (I/O) | `create…`, `update…`, `insert…`, `enqueue…` | `enqueueSessionSettlement` |
| Checks | `is…`, `has…`, `can…` returning boolean | `isWithinSpeedBand` |
| Asserts / throws | `assert…`, `ensure…` | `assertOwnsSneaker` |
| Converts | `to…`, `…To…` | `metersToKilometers`, `toChecksumAddress` |
| Formats for display | `format…` | `formatTokenAmount`, `formatDuration` |
| React event handlers | `handle…` in the component, `on…` as the prop | `onPress={handleStartPress}` |
| React hooks | `use…` + noun | `useActiveActivitySession`, `useRepairSneaker` |

`find…` may return `null`, and `get…` / `fetch…` throws if it's missing. Pick one
and stay consistent within a module.

### 1.5 Types and constants

- Types and components use PascalCase: `ActivitySessionStatus`, `SneakerCard`.
- Name types after what they are, with no `I` prefix and no `Type` suffix:
  `UserDocument`, not `IUser` or `UserType`.
- zod schemas are camelCase + `Schema`, and the inferred type drops the suffix:

  ```ts
  export const startActivitySessionBodySchema = z.object({ sneakerTokenId: tokenIdStringSchema })
  export type StartActivitySessionBody = z.infer<typeof startActivitySessionBodySchema>
  ```

- True constants are `SCREAMING_SNAKE_CASE` with units: `MAX_SAMPLES_PER_UPLOAD`,
  `SESSION_MAX_DURATION_SECONDS`.
- Use string unions, not TypeScript `enum`s:
  `type ActivitySessionStatus = 'active' | 'settling' | …`.

### 1.6 One word per concept

Pick a term and use it everywhere: in contract, API, DB, app and UI copy.

| Concept | Term | Not |
|---------|------|-----|
| A walk/run | **activity session** | run, workout, activity, session (bare) |
| Login state | **auth session** | session (bare) |
| The NFT | **Sneaker** | shoe, item, nft (in domain code) |
| The ERC-20 | **SOLE** in UI copy and docs; `SoleToken` for the contract; **reward** for amounts in code (`rewardAmountWei`) | coins, points, credits, soles |
| Player wallet | **walletAddress** | address, account, wallet (as a string) |
| NFT id | **sneakerTokenId** (TS) / `tokenId` (inside Solidity) | id, nftId |

## 2. Functions and files

- **One job per function.** If the description needs "and", split it.
- **Return early** instead of nesting:

  ```ts
  // ✅
  function assertCanStartSession(sneaker: SneakerState): void {
    if (sneaker.currentEnergy < 1) throw new ApiError('SNEAKER_OUT_OF_ENERGY', 409)
    if (sneaker.durability < 1) throw new ApiError('SNEAKER_NEEDS_REPAIR', 409)
  }
  ```

- **Use an object parameter once there are more than two arguments**, so every
  call site is self-labelling:

  ```ts
  // ❌ calculateSessionReward(10, 12, 5n * 10n ** 17n)
  // ✅
  calculateSessionReward({ rewardedMinutes: 10, efficiency: 12, rewardPerEfficiencyMinuteWei })
  ```

- **No magic numbers.** Every number with a meaning gets a named constant or
  comes from config.
- **Keep files short.** Around 200 lines is a signal to split by responsibility.
- **Exports:** named exports only. Default exports are allowed only where a
  framework requires them (Expo Router screens).
- **Put the reader first:** exported and high-level functions at the top, helpers
  below.

## 3. TypeScript

`tsconfig.base.json` enables `strict`, `noUncheckedIndexedAccess`,
`noImplicitOverride`, `noFallthroughCasesInSwitch` and `exactOptionalPropertyTypes`.

- **No `any`.** Use `unknown` and narrow it (zod parse, type guard).
- **No non-null assertions (`!`)**, except in tests. Handle the null case.
- **No `as` casts** to silence errors. Casting a validated zod output or
  `as const` is fine.
- `catch (error)` is `unknown`, so use `getErrorMessage(error)` from the shared helper.
- **`bigint` for every on-chain integer** (token amounts, token ids). Convert to
  `number` only for small values you know are bounded (level, durability,
  energy), and do it in one named function.
- Model states as **discriminated unions**, not a bag of optional fields:

  ```ts
  type RepairTransactionState =
    | { phase: 'idle' }
    | { phase: 'awaitingSignature' }
    | { phase: 'confirming'; transactionHash: Hash }
    | { phase: 'succeeded'; transactionHash: Hash }
    | { phase: 'failed'; errorCode: ApiErrorCode | 'WALLET_REJECTED' }
  ```

- Make switch statements exhaustive with a `never` check, so adding a status
  breaks the build everywhere it isn't handled.

## 4. Reuse — and when *not* to abstract

**Before writing anything, search for it:**

1. `packages/shared`: a schema, domain type, unit helper or game-rule function?
2. `packages/chain`: an ABI, address or chain?
3. The app's own `lib/` and `components/ui/`.

If it exists, use it. If it almost fits, extend it, and don't fork a copy.

**But don't abstract early.** Duplicate once. When the *third* copy appears,
extract it. A premature abstraction costs more than duplication, because every
later change has to fit its guesses.

**Write only what the current phase needs:**

- no options, parameters or config for cases that don't exist yet
- no "generic" base classes or factories for one implementation
- no commented-out code (version control keeps old versions)
- no unused exports, files or dependencies. Delete them in the same change.

Scale comes from **clear boundaries** (layers, features, packages), not from
extra code.

## 5. Comments

- Comments explain **why**, never **what**. If you need a "what" comment, rename
  things instead.
- ✅ `// Advance by credited time, not to now, so partial regeneration progress isn't lost.`
- ❌ `// increment the counter`
- Use JSDoc on exported functions in `packages/*` and `lib/`, where a caller
  benefits from hover docs. Don't add JSDoc that repeats the signature.
- `TODO` comments need an owner and a phase: `// TODO(phase-8): replace with SVG art`.

## 6. Errors

- Handle errors at boundaries (route error handler, React Query `onError`, error
  boundaries), not with a try/catch around every call.
- Throw typed errors with a code: `ApiError` on the API, parsed `ApiError` in
  the app. **The UI switches on `code`, never on message text.**
- Never swallow an error silently. Log it with context, or rethrow it.

## 7. React Native specifics

- Use function components and hooks only.
- A component that does more than one visual job gets split.
- Components receive data through props and don't fetch it themselves (except
  thin screen containers).
- Wrap expensive derived values in `useMemo` and callbacks passed to lists in
  `useCallback`, and only do it when it matters. Don't memoize by reflex.
- Long lists use `FlatList` (or FlashList if profiling shows a need), never `.map` in a `ScrollView`.
- Every interactive element needs an `accessibilityLabel` and a touch target of
  at least 44×44.
- Every screen defines its **loading, empty and error states**, not just the
  happy path.

## 8. Fastify specifics

- Follow the layer rules in `architecture/backend-api.md`. Most review comments
  will be about those.
- Every route has a response schema.
- Handlers take plain inputs and return plain outputs. Keep `request` and
  `reply` handling in the route and handler signature.
- Use `request.log`, never `console.log`.

## 9. Solidity specifics

See `architecture/smart-contracts.md` → conventions. In short: NatSpec, custom
errors, past-tense events, checks-effects-interactions, units in names, and no
magic numbers.

## 10. Formatting and tooling

- Biome formats and lints all TypeScript: no arguing about style, and no
  disabling rules inline without a comment saying why.
- `forge fmt` for Solidity.
- A change is ready only when `bun run typecheck`, `bun run lint` and
  `bun run test` pass (plus `forge test` when contracts changed).
