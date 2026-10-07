# Phase 0 — Foundations

**Goal:** an empty but correctly shaped monorepo. Every package builds,
typechecks, lints and tests. The app runs on a real phone and talks to the API.
There is no game logic yet.

**Read first:** `architecture/repository-structure.md`, `conventions/coding-standards.md`, `decisions.md` (D-001, D-003, D-004, D-011, D-013).

## Deliverables

### Root
- `package.json` with Bun workspaces (`apps/*`, `packages/*`) and the root scripts from `repository-structure.md`.
- `tsconfig.base.json` with every strict flag from `coding-standards.md` §3.
- `biome.json`.
- `.gitignore` (node_modules, `.env*` except `.env.example`, `.mongo/`, Foundry `out/` and `cache/`, Expo `.expo/`, native build folders).
- `scripts/mongodb.sh` (start / stop / status / logs) for a project-local `mongod` on port 27019. Model it on `meAsAgent/scripts/mongodb.sh`.
- `README.md` that covers prerequisites, setup and running each piece.

### `packages/shared`
- Package skeleton with `zod` and the empty folders (`api-contracts/`, `domain/`, `game-rules/`, `units/`).
- `domain/api-error-code.ts`: the `ApiErrorCode` union, starting with `VALIDATION_FAILED | UNAUTHENTICATED | NOT_FOUND | RATE_LIMITED | INTERNAL_ERROR`.
- `api-contracts/health.ts`: `healthResponseSchema`.
- One real test to prove the runner works.

### `packages/chain`
- Package skeleton: `monad-chains.ts` with the testnet chain (use viem's built-in definition if one exists), and an empty `contract-addresses.ts`.

### `packages/contracts`
- `forge init`-equivalent layout, `foundry.toml` with a pinned solc version and a `monad_testnet` RPC alias, and OpenZeppelin v5 via Soldeer.
- One placeholder test, so `forge test` runs.

### `apps/api`
- `index.ts` and `build-server.ts`, and plugins `env`, `mongo`, `error-handler`, `api-docs`, `rate-limit` (global default).
- `GET /health` → `{ status: 'ok', mongo: 'connected' | 'unreachable' }`, validated by `healthResponseSchema`.
- `.env.example`.
- **Check early:** that the current `mongodb` driver works on Bun. If it doesn't, pin a version that does (as `meAsAgent` did) and note it in `CLAUDE.md`.
- Test: `fastify.inject` against `/health`.

### `apps/mobile`
- Expo app (TypeScript template), Expo Router, `app.config.ts` with display name **StrideMon**, slug `stridemon`, iOS bundle id and Android package `com.stridemon.app`.
- Folder skeleton from `mobile-app.md`, with `src/config/env.ts` (zod) and `src/lib/api-client/` (typed fetch wrapper + `ApiError` parsing).
- `src/theme/` tokens and `components/ui/Screen.tsx`, `Button.tsx`.
- `providers/AppProviders.tsx` with a React Query provider.
- One screen that calls `/health` through the API client and shows the result.
- A development build installed on a physical iPhone and/or Android device (EAS or a local build).
- Metro configured for the monorepo, so importing `@stridemon/shared` works.

## Out of scope
Auth, the wallet, contracts beyond the placeholder, and any game screen.

## Definition of done
- [ ] `bun install` from a clean clone works.
- [ ] `bun run typecheck`, `bun run lint` and `bun run test` pass across all workspaces.
- [ ] `forge build` and `forge test` pass.
- [ ] `bun run db:start` → `bun run dev:api` → `/health` reports Mongo connected.
- [ ] The dev build on a real phone shows "API: ok" through the LAN URL. (Since D-039 the
  welcome screen shows nothing when the API answers, and only explains a failure.)
- [ ] The API fails fast at boot with a clear message when an env var is missing.

## Demo check
Open the app on your phone and see the API's health status.
