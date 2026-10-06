# Metropolis submission: final TODO

StrideMon's submission to Monad's **Metropolis** hackathon. This file covers the track choice,
what is already fine, and everything left before the deadline. It was checked against the
Terms & Conditions (v3.0, 2026-09-03) and the dashboard's Tracks & Bounties page on 2026-10-06.

**Deadline: 2026-10-13, 11:59 PM ET = 2026-10-14, 09:29 IST.** The version recorded at the
deadline is the one judged. A submission can be edited until then, so submit early
(2026-10-11 or 10-12) and keep editing.

## Track: Consumer Products & Payments

One track only (§2.5, §3.3). This is the best fit, and track fit is 20% of the score (§5.2).

- **Who it's for:** someone who walks or runs, not a trader. The track's user is "a consumer who
  may not identify as a crypto user."
- **The core value:** a financial experience. The player walks, earns STRIDE, and spends it on
  repair and upgrades, all settled on Monad. It isn't a trading or market-making product.
- **Already fits the non-crypto angle:** the free starter Sneaker and the gas drip mean a new
  player never has to buy MON.
- **Why not Social, Attention & Culture:** StrideMon has no social features yet (no friends,
  leaderboards or community), so that track would be a weak fit.
- **What to be honest about:** players still connect MetaMask, and STRIDE has no monetary value on
  testnet. Describe it as an earn-and-spend economy settled on-chain, never "earn money."

**Sponsor bounties: none.** None fit what's built. Mera, Privy or Dynamic would strengthen the
consumer story by removing MetaMask, but each means replacing the wallet layer a week before the
deadline.

## What's already fine

- The GitHub repo (`github.com/yassmittal/StrideMon`) is public, with 43 commits from 2026-09-28
  to 2026-10-06, all inside the build window (§4.1.4).
- The four contracts are deployed and verified on Monad testnet (chain 10143). Addresses are in
  `packages/contracts/README.md`.
- The hosted API answers `GET /health` with `ok` and Mongo connected.
- The live site (`https://stridemon.yashmittal.xyz`) shows the new STRIDE contract addresses.
- No secrets in the repo. The only private keys are Anvil's public test keys, and `private.md`
  and the `.env` files are gitignored.

## 1. Blockers

The submission is incomplete without these.

- [ ] **Add a `LICENSE` file (MIT).** The repo has none, and GitHub shows `license: null`. The rules
  require an OSI-approved licence (§4.1.1, §7.2).
- [ ] **Rebuild the `demo` APK on the new contracts.** The demo build was made on 2026-10-05, but the
  contracts were redeployed for STRIDE on 2026-10-06 (D-038). The addresses are compiled into the
  app from `@stridemon/chain`, so the current APK most likely still points at the old contracts.
- [ ] **Check that the hosted API runs the post-rename code.** `social-plan.md` §12 still lists this
  as open. If the server wasn't updated, it mints and settles on the old contracts.
- [ ] **Record a fresh run on the new contracts and save its transaction hashes:** starter mint,
  settlement, repair, upgrade and transfer. The rules ask for contract addresses or transaction
  hashes (§9.2), and every hash we have now is from abandoned deployments.
- [ ] **Make the demo video (3 minutes or less) and upload it publicly** to YouTube, Loom or Vimeo
  (§4.1.2, §9.4). The current videos don't meet the rules:
  - The 45 s launch film (`launch-video/out/`) is mostly motion graphics, and its run screen is a
    vector rebuild, which reads as a mockup.
  - The 56 s site demo (`website/public/videos/stridemon-demo.mp4`) is real but silent.

  The new one should be about 2:30 of real phone footage with a voiceover or captions. Show:
  1. Sign-in with MetaMask on Monad testnet.
  2. The starter mint, and its transaction on MonadVision.
  3. A walk, then STOP and settle, and the settlement transaction on MonadVision.
  4. A repair or upgrade signed in MetaMask.
  5. A transfer to a second wallet, with the stats intact.
  6. The on-chain SVG art.

  Say or show "Monad testnet. STRIDE has no monetary value."
- [ ] **Rewrite `README.md` to cover what the rules require** (§4.1.1, §4.1.3–5, §9.1–9.2). Today
  it only has setup steps. It needs:
  - **Problem and intended user:** a short project description.
  - **How it uses Monad, and why Monad:** fast, cheap settlement makes one transaction per run
    practical, and the gas drip lets new players start without buying MON. Contract address
    links and the new transaction hashes.
  - **Architecture overview:** a short summary plus a link to
    `docs/architecture/system-overview.md`.
  - **Tech stack.**
  - **A "Try it" section:** the APK link, enabling Monad Testnet in MetaMask before connecting (the
    `setDefaultChain` gotcha in `CLAUDE.md`), and a note that the gas drip covers gas.
  - **A "Run your own stack" path:** an outsider can't settle runs on our contracts because they
    don't hold `GAME_SERVER_ROLE`. They deploy their own contracts with `DeployGame.s.sol`, run
    `bun run chain:export-abis`, fill in their `.env` files, then run the API and the app. §9.1
    requires "code a third party can run by following the README."
  - **AI disclosure:** built with Claude Code. `CLAUDE.md` is already public in the repo.
  - **Pre-existing code:** none; the project started on 2026-09-28.
  - **Attribution:**
    - Libraries and tools: OpenZeppelin, Foundry/Soldeer, Expo, Reown AppKit, wagmi/viem,
      Fastify, MongoDB.
    - Fonts: Satoshi (Fontshare FFL) and IBM Plex Mono (OFL).
    - Design language: taken from lusion.co (`docs/architecture/design-system.md`).
    - Launch film audio: music from Pixabay and sound effects from Kenney (CC0), per
      `launch-video/CREDITS.md`.
  - **Token note:** testnet only, no monetary value, not issued or endorsed by the Monad
    Foundation or any sponsor (§9.3).
  - **Links:** the demo video and the live site.

## 2. Dashboard

- [ ] Select **Consumer Products & Payments**.
- [ ] Fix the tagline. It still says "earn SOLE".
- [ ] Write the description, reusing the README's problem, user and "why Monad" text.
- [ ] Post at least one progress update (it unlocks mentor support).
- [ ] Add the repo URL, the video link, the contract addresses and the APK link.
- [ ] Submit by 2026-10-12, then keep editing until the deadline if needed.

## 3. Keep it working through judging (2026-10-14 to 10-27)

- [ ] Keep the EC2 API and PM2 running, and keep the Atlas cluster awake.
- [ ] Keep the game-server key funded. Each new player costs about 0.13 MON, so fund it for
  around 30–50 judges.
- [ ] Don't pause `SneakerGame`, and keep the demo energy setting reverted
  (`bun run demo:energy revert`).
- [ ] Keep the APK link alive (check how long EAS keeps internal-distribution builds).

## 4. Nice to have

- [ ] Commit the current working-tree changes (`website/public/videos/stridemon-demo.mp4`,
  `website/scripts/cut-demo-video.sh`). Yash does the commits.
- [ ] Add a description and topics in the GitHub repo's About section (it's empty).
- [ ] Update the status tables in `docs/README.md` and `CLAUDE.md` (8.8 done, plus a submission
  line).
- [ ] Draft the "Submitted to Metropolis" post in `social/` (it's already in the calendar in
  `social-plan.md`).

## Not needed for submission

iOS (8.7, deferred by D-035), Phase 4's outdoor and car checks, and the Maestro flow's MetaMask
taps. Dropped, in line with the lean hackathon scope.
