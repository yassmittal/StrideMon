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
- The live site (`https://stridemon.xyz`) shows the new STRIDE contract addresses.
- The `demo` APK is current: built 2026-10-06 from `d1fbcc3` (the STRIDE rename), with the new
  contract addresses. Link:
  `https://expo.dev/artifacts/eas/Aa0J7FXKPHyaKSGL-74nW66qSugLVcvhOMLyRrGL2iY.apk`
- The hosted API is on the new contracts: the 2026-10-06 recording shows a new Sneaker and a
  STRIDE reward, which the app reads from the new contracts.
- No secrets in the repo. The only private keys are Anvil's public test keys, and `private.md`
  and the `.env` files are gitignored.

## 1. Blockers

The submission is incomplete without these.

- [x] **Add a `LICENSE` file (MIT).** Done 2026-10-07: `LICENSE`, "Copyright (c) 2026 Yash
  Mittal". The rules require an OSI-approved licence (§4.1.1, §7.2). GitHub shows it after the push.
- [x] **Save the transaction hashes from the run recorded on 2026-10-06.** Done 2026-10-07, read
  from the contracts' event logs since the deploy block. They're in `README.md` → "Transactions
  from a real session": two starter mints, three settlements (+15 STRIDE each) and the two
  transfers (#1 A → B, #2 B → A).
- [ ] **Record one repair and one upgrade on the new contracts.** The new contracts have **no
  `SneakerRepaired` or `SneakerUpgraded` event yet** (checked 2026-10-07), so those two rows in
  `README.md` say "added after the next recorded run". Wallet A (`0xdfAb…1465`) owns Sneaker #2
  with 45 STRIDE, durability 98, level 1. One 3-minute walk (+15) brings it to 60, enough to
  repair (about 2.1) and then upgrade (50). Record this run for the demo video too, then paste
  both hashes into `README.md` (search `TODO(submission)`).
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
- [x] **Rewrite `README.md` to cover what the rules require** (§4.1.1, §4.1.3–5, §9.1–9.2). Done
  2026-10-07: problem and user, why Monad, contract links and the session's transactions,
  architecture, tech stack, "Try it" (APK, Monad Testnet first, the `setDefaultChain` fix, the
  gas drip), "Run your own stack" (own keys, `DeployGame.s.sol`, `chain:export-abis`, `.env`
  files, own EAS project), AI disclosure, pre-existing code, credits, the token note and the
  links. Two gaps are marked `TODO(submission)` in the file: the demo video's URL, and the repair
  and upgrade hashes from the next recorded run.

## 2. Dashboard

- [ ] Select **Consumer Products & Payments**.
- [ ] Fix the tagline. It still says "earn SOLE". Paste the one under "Dashboard copy".
- [ ] Write the description. Paste the one under "Dashboard copy" (the README's problem, user and
  "why Monad" text, shortened).
- [ ] Post at least one progress update (it unlocks mentor support). A draft is below.
- [ ] Add the repo URL, the video link, the contract addresses and the APK link.
- [ ] Submit by 2026-10-12, then keep editing until the deadline if needed.

### Dashboard copy (drafted 2026-10-07)

**Tagline:**

> Walk or run with a Sneaker NFT, earn STRIDE, and spend it to upgrade. Settled on Monad testnet.

**Description:**

> StrideMon is a move-to-earn game for people who walk or run, not traders. Your Sneaker is an
> NFT. Press START, walk outside, press STOP, and the run settles on Monad as its own
> transaction: the game contract caps the minutes by the Sneaker's energy, mints STRIDE and
> lowers its durability. Spend STRIDE to repair the Sneaker or level it up for more STRIDE per
> minute, or send it to another wallet with its stats intact.
>
> Nobody has to buy anything to start. The first Sneaker is free, and a one-time drip of testnet
> MON covers the player's own repair, upgrade and transfer transactions. The server checks every
> run before it pays (1–20 km/h per minute, GPS jumps dropped, mock locations rejected) and only
> minutes and distance go on-chain, never the route. The Sneaker's picture is an SVG drawn by a
> contract, so the app, MonadVision and MetaMask show the same image.
>
> Why Monad: fast settlement makes one transaction per run practical, so the real reward shows
> seconds after STOP; cheap gas makes the drip affordable; and it's plain EVM, so standard
> ERC-721 and ERC-20 contracts work in MetaMask.
>
> Built on Android with Expo and React Native, a Fastify API on Bun with MongoDB, and four
> verified Foundry contracts. Monad testnet. STRIDE has no monetary value.

**Progress update:**

> The full loop runs on an Android phone against four verified contracts on Monad testnet: sign
> in with MetaMask, a free starter Sneaker and gas drip, a walk that settles STRIDE on-chain,
> repair and upgrade signed in the player's wallet, and a Sneaker sent to a second wallet with its
> stats intact. The API is hosted, the landing page is live with a waitlist, and the token was
> renamed SOLE → STRIDE with a fresh deploy. Next: the demo video and the submission.

## 3. Keep it working through judging (2026-10-14 to 10-27)

- [ ] Keep the EC2 API and PM2 running, and keep the Atlas cluster awake. (`/health` answered
  `ok` with Mongo connected on 2026-10-07.)
- [x] Keep the game-server key funded. Checked 2026-10-07: `0xa7a0…C7F1F` holds 13.53 MON, about
  100 new players at 0.13 MON each. Check again on 10-14.
- [x] Don't pause `SneakerGame`, and keep the demo energy setting reverted. Checked 2026-10-07:
  `paused()` is `false`, and the only `GameConfigUpdated` event is the deploy's, so the launch
  energy setting (30 minutes) was never changed. Run `bun run demo:energy revert` after any demo
  that applies it.
- [x] Keep the APK link alive. EAS keeps build artifacts for about 30 days on the free plan, so the
  2026-10-06 `demo` build lasts until about 2026-11-05, past judging (10-27). Check the expiry
  shown on the build's expo.dev page. **A new `demo` build gets a new link:** if you rebuild,
  update `README.md` and the dashboard.

## 4. Nice to have

- [x] Commit the current working-tree changes. Already done: the tree was clean on 2026-10-07.
  Yash commits this round's changes too (`LICENSE`, `README.md`, the docs, the social draft).
- [ ] Add a description and topics in the GitHub repo's About section (it's empty). Paste these:
  - **Description:** `Move-to-earn on Monad: walk with a Sneaker NFT, earn STRIDE, repair and
    upgrade it. Expo app, Fastify API, Foundry contracts. Testnet only.`
  - **Website:** `https://stridemon.xyz`
  - **Topics:** `monad`, `move-to-earn`, `web3`, `nft`, `erc721`, `erc20`, `solidity`, `foundry`,
    `expo`, `react-native`, `fastify`, `bun`, `mongodb`, `viem`, `wagmi`, `hackathon`
- [x] Update the status tables in `docs/README.md` and `CLAUDE.md` (8.8 done, plus a submission
  line). Done 2026-10-07.
- [x] Draft the "Submitted to Metropolis" post in `social/`. Done 2026-10-07:
  `social/posts/2026-10-12-metropolis-submitted.md`, a draft waiting for Yash's `approved:`.
  Move its slot to the day you actually submit.

## Not needed for submission

iOS (8.7, deferred by D-035), Phase 4's outdoor and car checks, and the Maestro flow's MetaMask
taps. Dropped, in line with the lean hackathon scope.
