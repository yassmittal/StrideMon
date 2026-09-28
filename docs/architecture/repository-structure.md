# Repository Structure

One Bun-workspaces monorepo. Install once from the root with `bun install`, and
add a dependency to one workspace with `bun add --cwd apps/api <package>`.

```text
monad/                         repo folder (the product is StrideMon)
├── MVP.md                     product brief (what)
├── CLAUDE.md                  day-to-day working guide
├── docs/                      architecture, conventions, phases (how)
├── package.json               workspaces + root scripts only, no app code
├── bunfig.toml                hoisted node_modules (React Native needs one copy of each native package)
├── biome.json                 lint + format for every TS workspace
├── tsconfig.base.json         strict compiler options every workspace extends
├── scripts/                   repo-level dev scripts (local mongod, ABI export)
│
├── apps/
│   ├── mobile/                Expo + React Native app            → mobile-app.md
│   └── api/                   Fastify game API                   → backend-api.md
│
└── packages/
    ├── shared/                domain types, zod API contracts, game-rule mirror
    ├── chain/                 ABIs, deployed addresses, chain definition
    └── contracts/             Foundry project (Solidity)         → smart-contracts.md
```

## What each package is for, and what it must not contain

### `packages/shared` — `@stridemon/shared`

Code that both the mobile app and the API need, with no runtime dependencies
beyond `zod`.

```text
packages/shared/src/
├── api-contracts/             zod schemas for every request and response body
│   ├── auth.ts                  e.g. requestAuthNonceBodySchema, authTokensResponseSchema
│   ├── activity-sessions.ts
│   └── index.ts
├── game-rules/                TypeScript mirror of SneakerGame formulas (estimates only)
│   ├── reward-estimate.ts
│   ├── energy.ts
│   └── game-rule-fixtures.json  shared test vectors (also read by Foundry tests)
├── domain/                    plain domain types: ActivitySessionStatus, ApiErrorCode, …
├── errors/                    getErrorMessage (turns a caught `unknown` into a message)
└── units/                     unit conversion helpers: metersToKilometers, formatTokenAmount
```

- **Must not** import React, React Native, Fastify, MongoDB or viem.
- **Must not** contain anything only one side uses. If only the API needs it,
  it lives in the API.
- Mobile and API both infer their TypeScript types from these zod schemas
  (`z.infer`), so a contract change breaks the build on both sides at once.
  That's what we want.

### `packages/chain` — `@stridemon/chain`

Everything needed to talk to our contracts from TypeScript.

```text
packages/chain/src/
├── monad-chains.ts            viem chain definitions (testnet now, mainnet later)
├── contract-addresses.ts      deployed addresses per chain id, written by the deploy script
├── abis/                      GENERATED from Foundry output, never hand-edited
│   ├── sneaker-nft-abi.ts
│   ├── sole-token-abi.ts
│   └── sneaker-game-abi.ts
└── index.ts
```

- ABIs are exported `as const` so viem/wagmi infer function names, argument
  types and return types. **A typo in a contract call is a compile error.**
- Regenerate with `bun run chain:export-abis` after every contract change.

### `packages/contracts`

A Foundry project. It is not a TypeScript workspace: it has no `package.json`,
so the root `workspaces` list names `packages/shared` and `packages/chain`
explicitly instead of `packages/*`. It has its own `foundry.toml`, and its
Soldeer dependencies are imported as `@openzeppelin/contracts/…` and
`forge-std/…` through `remappings.txt`.

### `apps/api` — `@stridemon/api`

See [`backend-api.md`](backend-api.md). It depends on `@stridemon/shared` and `@stridemon/chain`.

### `apps/mobile` — `@stridemon/mobile`

See [`mobile-app.md`](mobile-app.md). It depends on `@stridemon/shared` and `@stridemon/chain`.

## Dependency direction

```text
apps/mobile ──┐
              ├──→ packages/shared
apps/api ─────┤
              └──→ packages/chain ──(generated from)──→ packages/contracts
```

- Apps depend on packages. **Packages never depend on apps.**
- `apps/mobile` and `apps/api` never import each other. They share only through
  `packages/*`.
- `packages/shared` and `packages/chain` do not depend on each other.

## Root scripts

| Script | Does |
|--------|------|
| `bun run dev` | API + Expo dev server together |
| `bun run dev:api` / `bun run dev:mobile` | one at a time |
| `bun run db:start` / `db:stop` / `db:status` / `db:logs` | project-local `mongod` on port **27019** (27018 is taken by `meAsAgent`) |
| `bun run typecheck` | `tsc --noEmit` in every TS workspace |
| `bun run lint` / `bun run format` | Biome check / Biome check with safe fixes applied |
| `bun run test` | every workspace's tests |
| `bun run contracts:build` / `contracts:test` | `forge build` / `forge test` |
| `bun run chain:export-abis` | Foundry `out/` → `packages/chain/src/abis/` (added in Phase 1) |

## File and folder naming

| Kind | Style | Example |
|------|-------|---------|
| Folders | kebab-case | `activity-sessions/` |
| TS modules | kebab-case | `validate-activity.ts` |
| React components | PascalCase, one component per file | `SneakerCard.tsx` |
| React hooks | camelCase, `use` prefix | `useActiveSession.ts` |
| Expo Router routes | kebab-case (the URL) | `app/run/summary/[sessionId].tsx` |
| Solidity | PascalCase, one contract per file | `SneakerGame.sol` |
| Tests | the file under test + `.test` | `validate-activity.test.ts` |
