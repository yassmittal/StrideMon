# StrideMon — Documentation

This folder is the source of truth for **how** we build the product described in
[`../MVP.md`](../MVP.md). `MVP.md` says *what* the game is; these docs say how the
system is shaped, how the code is written, and in which order it is built.

Every phase in [`roadmap.md`](roadmap.md) is built against
these documents, and when a decision changes, the doc changes first.

## Reading order

| # | Document | Read it when |
|---|----------|--------------|
| 1 | [`architecture/system-overview.md`](architecture/system-overview.md) | First. The whole system on one page: pieces, responsibilities, data flow. |
| 2 | [`decisions.md`](decisions.md) | You want to know *why* a technology or design was chosen. |
| 3 | [`roadmap.md`](roadmap.md) | You want the list of phases and what "done" means for each. |
| 4 | [`conventions/coding-standards.md`](conventions/coding-standards.md) | Before writing any code. Naming, readability, reuse. **Not optional.** |
| 5 | [`architecture/repository-structure.md`](architecture/repository-structure.md) | Deciding where a file goes. |
| 6 | [`architecture/smart-contracts.md`](architecture/smart-contracts.md) | Working in `packages/contracts`. |
| 7 | [`architecture/backend-api.md`](architecture/backend-api.md) | Working in `apps/api`. |
| 8 | [`architecture/mobile-app.md`](architecture/mobile-app.md) | Working in `apps/mobile`. |
| 9 | [`architecture/data-model.md`](architecture/data-model.md) | Touching MongoDB collections or on-chain state. |
| 10 | [`architecture/game-rules.md`](architecture/game-rules.md) | Touching energy, rewards, durability, repair or upgrade numbers. |
| 11 | [`architecture/security.md`](architecture/security.md) | Touching auth, keys, validation or contracts. |
| 12 | [`conventions/testing.md`](conventions/testing.md) | Writing tests (i.e. always). |
| 13 | [`architecture/design-system.md`](architecture/design-system.md) | Styling anything in `apps/mobile` (colors, type, spacing, motion, components). Applied in Phase 8. |
| 14 | [`device-testing.md`](device-testing.md) | Building, installing and debugging the app on a phone. |
| 15 | [`demo-script.md`](demo-script.md) | Preparing for, rehearsing or giving the live demo. |
| 16 | [`rehearsal-checklist.md`](rehearsal-checklist.md) | Running Phase 8.5's phone check: one full rehearsal, then Maestro. |
| 17 | [`deployment.md`](deployment.md) | Hosting the API and building the demo app (Phase 8.6). |
| 18 | [`landing-page-prompt.md`](landing-page-prompt.md) | Building the landing page in `website/` (Phase 8.8). |
| 19 | [`landing-page-video-prompt.md`](landing-page-video-prompt.md) | Cutting the screen recordings into the landing page's demo video. |
| 20 | [`waitlist-prompt.md`](waitlist-prompt.md) | The brief the landing page's waitlist was built from (D-037). |
| 21 | [`social-plan.md`](social-plan.md) | Posting on X: the research, the two accounts, the calendar. The posts themselves live in `../social/` (D-036). |
| 22 | [`hackathon-submission.md`](hackathon-submission.md) | Submitting to Metropolis: the track, and the final TODO before the 2026-10-14 09:29 IST deadline. |
| 23 | [`play-store-release.md`](play-store-release.md) | Publishing the Android app on Google Play, from the developer account to the production rollout. |
| 24 | [`founding-pass-brief.md`](founding-pass-brief.md) | The Founding Pass: 1,000 one-of-a-kind designs, minted gas-free as early access, each with a Founder Sneaker. The idea, flow, research and architecture; the decision is D-041. |
| 25 | [`founding-pass/`](founding-pass/README.md) | Building the Founding Pass: one file per part and one part per session, with the prompt to start each one. Read its `README.md` first, then the part you're on. |
| — | [`phases/`](phases/) | One detailed spec per phase. Build from these. |

## Three rules that override everything else

1. **The chain is the source of truth for game state.** Sneaker stats, energy and
   reward balances live on Monad. MongoDB stores what the chain should never see
   (raw GPS, auth) and bookkeeping about what we sent to the chain.
2. **Readable over clever.** Every name says what the thing is, in full words,
   with units. If a reviewer has to ask "what is this?", the name is wrong.
3. **Write only what the current phase needs.** No speculative abstractions, no
   "we might need this later" code. Scalability comes from clean boundaries,
   not from extra code.

## Status

| Phase | State |
|-------|-------|
| 0 — Foundations | Done (verified on an Android phone via an EAS development build, 2026-09-29) |
| 1 — Smart contracts | Done (deployed and verified on Monad testnet, `cast` loop run on-chain, 2026-09-29) |
| 2 — Wallet & sign-in | Done (connect, sign-in, restore, sign-out and revoke verified on an Android phone with MetaMask, 2026-09-29) |
| 3 — Starter Sneaker & home | Done (starter mint + gas drip verified on an Android phone and live on Monad testnet in ~5 s; outbox crash recovery tested against Anvil, 2026-09-29) |
| 4 — Activity tracking | Done (runs verified on an Android phone, 2026-09-30). The outdoor walk, car and kill-and-reopen checks move to Phase 8 (D-025); iOS too (D-022) |
| 5 — Settlement & rewards | Done (a 5-minute walk settled +25 STRIDE, durability −2 on an Android phone, matching the chain and `tokenURI`, 2026-10-02) |
| 6 — Repair & upgrade | Done (repair 96 → 100 for 2.8 STRIDE, upgrade 1 → 2 for 50 STRIDE, wallet cancel, and the next run paying 6 STRIDE/min verified on an Android phone, 2026-10-03). The durability-below-50 penalty was skipped |
| 7 — Sneaker transfer (**MVP complete**) | Done (#4 sent A → B and back with level 2, efficiency 12 intact; picker, empty state and run block verified on an Android phone with two MetaMask accounts, 2026-10-03). **MVP complete** |
| 8 — Demo hardening | In progress (seven parts, deployment last, D-028). 8.1 design foundation: done (Home checked on the Android phone, 2026-10-03). 8.2 design across the app: done (every screen, sheets, transfer and tab icons checked on the Android phone, 2026-10-03). 8.3 Sneaker NFT image: done (on-chain SVG via `SneakerArtRenderer`, contracts redeployed and verified, flow checked end to end on the Android phone, 2026-10-03; quiet button presses, D-031). 8.4 states and data hygiene: done (airplane mode, a testnet pause and unpause, explorer links and the privacy note checked on the Android phone, 2026-10-04; D-032). 8.5 demo tooling: done (demo wallet and energy scripts, `demo-script.md`, Maestro flow; D-033; full rehearsal by hand on the Android phone, A → B and back, 2026-10-05). 8.6 deployment: done (API at `https://stridemon-api.yashmittal.xyz` under PM2 on the EC2 instance, Atlas `stridemon` database, `demo` EAS build; every `deployment.md` step passed on the Android phone, 2026-10-05; D-034). 8.7 iOS: deferred (D-035). 8.8 landing page: done (`website/` live at `https://stridemon.yashmittal.xyz` with the demo video and a waitlist, D-037; token renamed SOLE → STRIDE and contracts redeployed, D-038; 2026-10-06). Now: the Metropolis submission (`hackathon-submission.md`; `LICENSE` and the README rewrite done 2026-10-07). Domain: `stridemon.xyz` (D-040, 2026-10-07; rollout in `deployment.md` §11) |
| Founding Pass (`founding-pass/`, D-041) | In progress, one part per session. Parts 0 to 6 done (2026-10-08 to 09: the art, the contracts, the API, the website gallery and mint, the app). Next: Part 7, help |
| 9 — Marketplace (optional) | Not started |
| 10 — Beyond the hackathon | Not started |

Update this table as phases finish.
