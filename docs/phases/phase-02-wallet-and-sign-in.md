# Phase 2 — Wallet Connection & Sign-In

**Goal:** a player connects a wallet app, proves ownership with one signature,
and the app remembers them across restarts.

**Read first:** `architecture/security.md` → Authentication, `architecture/backend-api.md` → Endpoints, `architecture/mobile-app.md` → Auth on the device, `decisions.md` D-008 and D-010.

## Deliverables

### `packages/shared`
- `api-contracts/auth.ts`: schemas for nonce request and response, verify request, `authTokensResponseSchema`, and refresh.
- `api-contracts/me.ts`: `currentUserResponseSchema`.
- New `ApiErrorCode`s: `INVALID_SIGNATURE`, `NONCE_EXPIRED`, `REFRESH_TOKEN_REVOKED`.

### `apps/api`
- Repositories: `users-repository.ts`, `auth-nonces-repository.ts`, `auth-sessions-repository.ts`, plus their indexes in `mongo-indexes.ts`.
- `lib/auth/`: `build-siwe-message.ts`, `hash-refresh-token.ts`, `generate-refresh-token.ts` (all pure or crypto-only).
- `plugins/authentication.ts`: verifies the JWT and decorates `request.authenticatedUser`; declared in `types/fastify.d.ts`.
- Routes and handlers: `auth/nonce`, `auth/verify`, `auth/refresh`, `auth/sign-out`, `me`.
- Strict rate limits on `/v1/auth/*`.
- Tests: the full sign-in flow with a viem test account, nonce reuse rejected, expired nonce rejected, refresh rotation, and refresh-token reuse revoking every auth session.

### `apps/mobile`
- `lib/chain/`: AppKit + wagmi config for Monad testnet. **Verify** that current AppKit supports Expo and the chain before building on it.
- `features/wallet/`: connect and disconnect, and show the connected address.
- `features/auth/`: `useSignIn` (connect → nonce → `signMessage` → verify → store tokens), `auth-token-storage.ts` (secure store), and refresh-on-401 inside `lib/api-client`.
- Screens: `(onboarding)/welcome`, `(onboarding)/connect-wallet`, and a minimal `(tabs)/profile` (address, MON balance via wagmi, sign out).
- Root `_layout.tsx` auth gate: signed in → tabs; otherwise → onboarding.

## Out of scope
The Sneaker, the gas drip and the starter mint (Phase 3).

## Definition of done
- [ ] Fresh install → connect wallet → sign → lands on tabs.
- [ ] Kill and reopen the app → still signed in, with no wallet prompt.
- [ ] Sign out → back to onboarding, and the refresh token is revoked server-side.
- [ ] Rejecting the signature in the wallet shows a clear, recoverable message.
- [ ] API tests cover every auth error code.

## Demo check
Connect a wallet on a real phone, sign once, and see your address and testnet MON balance.
