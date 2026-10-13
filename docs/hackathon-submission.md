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

*Rechecked 2026-10-13.*

- The GitHub repo (`github.com/yassmittal/StrideMon`) is public, and every commit is from
  2026-09-28 on, inside the build window (§4.1.4).
- The six contracts (the game's four plus `FoundingPass` and `FoundingPassArtRenderer`, D-042)
  are deployed and verified on Monad testnet (chain 10143). Addresses are in `README.md` and
  `packages/contracts/README.md`.
- The hosted API (`https://api.stridemon.xyz`) answers `GET /health` with `ok` and Mongo
  connected, and `SneakerGame.paused()` is `false`.
- The live site (`https://stridemon.xyz`) shows the live contract addresses, and `/pass`,
  `/help`, `/privacy` and `/delete-account` all load.
- The app link is the `demo` build `f62511df` (2026-10-12, from `e84ea96`, D-052), built after
  the D-042 deploy. `README.md` and the site link its expo.dev page, not the APK:
  `https://expo.dev/accounts/yashmittal/projects/stridemon/builds/f62511df-a727-40ca-aff1-d2aaa1096265`
- The hosted API and that build are on the live contracts: the README's transactions (2026-10-12
  and 10-13) were played on the Android phone against them.
- Typecheck, lint and every test pass (contracts 162, API 244, mobile 154, shared 44).
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
- [x] **Record one repair and one upgrade on the new contracts.** The new contracts have **no
  `SneakerRepaired` or `SneakerUpgraded` event yet** (checked 2026-10-07), so those two rows in
  `README.md` say "added after the next recorded run". Wallet A (`0xdfAb…1465`) owns Sneaker #2
  with 45 STRIDE, durability 98, level 1. One 3-minute walk (+15) brings it to 60, enough to
  repair (about 2.1) and then upgrade (50). Record this run for the demo video too, then paste
  both hashes into `README.md` (search `TODO(submission)`).
  *Update 2026-10-13:* those were the D-038 contracts. `README.md`'s table now lists the live
  (D-042) contracts' transactions instead: the test pass and Founder Sneaker, Sneaker #2's mint,
  four settlements, the **repair** (`0x48fb…55ac`) and the **upgrade** to level 2 (`0xd6e6…4642`,
  2026-10-13 14:02 IST, 50 STRIDE).
- [ ] **Make the demo video (3 minutes or less) and upload it publicly** to YouTube, Loom or Vimeo
  (§4.1.2, §9.4). The current videos don't meet the rules:
  - The 45 s launch film (`launch-video/out/`) is mostly motion graphics, and its run screen is a
    vector rebuild, which reads as a mockup.
  - The 56 s site demo (`website/public/videos/stridemon-demo.mp4`) is real, with music since D-052, but has no voiceover or captions.

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
  links. One gap is marked `TODO(submission)` in the file: the demo video's URL (the repair and
  upgrade hashes are in, 2026-10-13).
  *Updated 2026-10-13:* a Founding Pass section, all six contracts in the table and the diagram,
  and "Run your own stack" deploys `DeployFoundingPass.s.sol` before `DeployGame.s.sol` (which
  needs `FOUNDING_PASS_ADDRESS`, D-042).

## 2. Dashboard

- [ ] Select **Consumer Products & Payments**.
- [ ] Fix the tagline. It still says "earn SOLE". Paste the one under "Dashboard copy".
- [ ] Write the description. Paste the one under "Dashboard copy" (the README's problem, user and
  "why Monad" text, shortened).
- [ ] Post at least one progress update (it unlocks mentor support). A draft is below.
- [ ] Add the repo URL, the video link, the contract addresses and the app link (the expo.dev
  build page in `README.md`, not a bare APK).
- [ ] Submit now, then keep editing until the deadline (2026-10-14 09:29 IST) if needed.

### Dashboard copy (drafted 2026-10-07, updated 2026-10-13)

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
> Early access comes as 1,000 Founding Passes, each a one-of-one design drawn on-chain and minted
> free and gas-free on stridemon.xyz/pass. A pass's wallet gets a Founder Sneaker in the pass's
> design, and neither can be sent or sold, so early access can't be flipped.
>
> Why Monad: fast settlement makes one transaction per run practical, so the real reward shows
> seconds after STOP; cheap gas makes the drip affordable; and it's plain EVM, so standard
> ERC-721 and ERC-20 contracts work in MetaMask.
>
> Built on Android with Expo and React Native, a Fastify API on Bun with MongoDB, a Next.js site,
> and six verified Foundry contracts. Monad testnet. STRIDE has no monetary value.

**Progress update:**

> The full loop runs on an Android phone against six verified contracts on Monad testnet: sign
> in with MetaMask, a free starter Sneaker and gas drip, a walk that settles STRIDE on-chain,
> repair and upgrade signed in the player's wallet, and a Sneaker sent to a second wallet with its
> stats intact. New since the first update: the Founding Pass, 1,000 one-of-one designs drawn by a
> contract, with a gallery and a page for each at stridemon.xyz/pass, a free gas-free mint, and a
> Founder Sneaker in the app in the pass's design. The site also has a help center with a
> chatbot that answers from it. The API runs at api.stridemon.xyz. Next: the demo video.

## 3. Keep it working through judging (2026-10-14 to 10-27)

- [ ] Keep the EC2 API and PM2 running, and keep the Atlas cluster awake. (`/health` answered
  `ok` with Mongo connected on 2026-10-13.)
- [x] Keep the game-server key funded. Checked 2026-10-13: `0xa7a0…C7F1F` holds 23.06 MON, about
  170 new players at 0.13 MON each. The deployer holds 28.7 MON.
- [x] Don't pause `SneakerGame`, and keep the demo energy setting reverted. Checked again on the
  live (D-042) contracts on 2026-10-13: `paused()` is `false`, and `getGameConfig()` returns the
  launch values (energy regenerates every 1,800 s, max energy 10). Earlier, on 2026-10-07:
  `paused()` is `false`, and the only `GameConfigUpdated` event is the deploy's, so the launch
  energy setting (30 minutes) was never changed. Run `bun run demo:energy revert` after any demo
  that applies it.
- [x] Keep the app link alive. EAS keeps build artifacts for about 30 days on the free plan, so the
  2026-10-12 build (`f62511df`, D-052), the one linked, lasts until about 2026-11-11, past
  judging (10-27). Check the expiry
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
