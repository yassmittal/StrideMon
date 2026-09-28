# Phase 4 — Activity Tracking & Validation

**Goal:** press START, walk outside with the phone in your pocket, and see live
time, distance, speed, energy and an estimated reward. Press STOP, and the API
validates the run and returns `activeMinutes` and `distanceMeters`. There is no
on-chain settlement yet (that's Phase 5). The session ends in status
`validating` → a stub `settling` state.

This is the most device-dependent phase, so leave time for real-world testing
on both platforms.

**Read first:** `architecture/mobile-app.md` → Location tracking, `architecture/security.md` → Activity validation, `architecture/data-model.md` → `activitySessions`, `locationSamples`, `architecture/game-rules.md` → Starting a session.

## Deliverables

### `packages/shared`
- `api-contracts/activity-sessions.ts`: start, upload samples (max 500 per request), finish, and the session response.
- `domain/activity-session.ts`: `ActivitySessionStatus`, `ActivitySessionRejectionReason`, `ActivityValidationWarning`.
- `game-rules/reward-estimate.ts` is already there from Phase 1; add `estimateLiveReward({ elapsedActiveSeconds, efficiency, currentEnergy })`.
- `units/`: `metersToKilometers`, `metersPerSecondToKilometersPerHour`.
- New error codes: `SNEAKER_NOT_OWNED`, `SNEAKER_OUT_OF_ENERGY`, `SNEAKER_NEEDS_REPAIR`, `ACTIVITY_SESSION_ALREADY_ACTIVE`, `ACTIVITY_SESSION_NOT_ACTIVE`, `MOCK_LOCATION_DETECTED`, `INSUFFICIENT_ACTIVITY_DATA`.

### `apps/api`
- Repositories: `activity-sessions-repository.ts`, `location-samples-repository.ts`, and the partial unique indexes for one active session per wallet and per Sneaker.
- `lib/activity-validation/`: `haversine-distance.ts`, `filter-plausible-samples.ts`, `bucket-samples-into-minutes.ts`, `speed-band.ts` and `validate-activity.ts` (composes the rest). **All pure.**
- Handlers: start (on-chain pre-checks via `sneaker-chain-reader`), upload samples (idempotent), finish (validate → store `validationResult` → status `settling`), get one session.
- `jobs/abandon-stale-activity-sessions.ts`: an active session with no samples for 30 minutes becomes `abandoned`.
- Tests: the synthetic-trace suite from `conventions/testing.md`, and route tests for every new error code.

### `apps/mobile`
- `features/activity-session/location-tracking/`:
  - `location-task.ts`: the TaskManager task, defined at module scope and registered at app entry.
  - `location-sample-buffer.ts`: MMKV-backed append, read-unsent and mark-sent.
  - `location-sample-uploader.ts`: batched upload loop.
  - `request-location-permissions.ts`: foreground, then background, with explainer screens before each OS prompt.
- `app.config.ts`: location permission strings, iOS `UIBackgroundModes: ["location"]`, and Android foreground-service permissions.
- Hooks: `useStartActivitySession`, `useActiveActivitySession` (live stats from the buffer), `useFinishActivitySession`.
- Screens: `run/active.tsx` (big time, distance, speed, energy left, *estimated* reward, STOP) and `run/summary/[activitySessionId].tsx` (validation result).
- Home START is enabled, and it's blocked with a clear reason when energy is 0 or durability is 0.
- Resume flow: reopening the app during an active session offers Resume or Finish.

## Out of scope
Minting rewards and changing durability (Phase 5). Maps or route drawing (nice to have; Phase 8 or later).

## Definition of done
- [ ] A 10-minute outdoor walk on **iOS and Android**, with the phone locked in a pocket, produces a sensible distance (within about 10% of a known route).
- [ ] Driving in a car produces 0 active minutes.
- [ ] Killing the app mid-walk and reopening it loses no samples.
- [ ] Starting a second session while one is active is refused (the DB index enforces it).
- [ ] The validation test suite covers every rule in `security.md`.

## Demo check
Walk around the block, press STOP, and see validated minutes and distance.
