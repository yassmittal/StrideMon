# Facts sheet

**Rule:** no word, number, address or hash goes on screen unless it is in this file with a source.
`src/content.ts` mirrors it. §9 maps every on-screen line of the script (`SCRIPT.md`, STOP 2) to its
source here.

Status: **✓** verified · **⚠** true only with the wording or condition given · **✗** don't use.

Sources: `game-rules.md` is `docs/architecture/game-rules.md`. "Chain" means a read-only
`cast call` against `https://testnet-rpc.monad.xyz` on 2026-10-05. `v1`/`v2` are the
recordings, with times from `FOOTAGE.md`. `01`–`09` are `website/public/screenshots/*.png`.

## 1. Names and words

| On screen | Source | Status |
|---|---|---|
| `StrideMon` (wordmark, one word, capital S and M) | `02` header, `CLAUDE.md` | ✓ |
| `SOLE` (the ERC-20, always in capitals) | Chain: `symbol()` = `"SOLE"`, 18 decimals | ✗ on screen since 2026-10-06: the film calls the token STRIDE (next row) |
| `STRIDE` (the reward token's name, always in capitals) | Yash's decision, 2026-10-06: the token is renamed from SOLE to STRIDE everywhere. **The app, website and code say STRIDE since D-038; the deployed `SoleToken` still returns `symbol()` = `"SOLE"`** until the contracts are redeployed | ✓ by decision. Every SOLE amount in §2–§10 is shown as the same amount of STRIDE |
| `Sneaker` (capital S, the NFT) | `coding-standards.md` vocabulary, every app screen | ✓ |
| `Walk. Earn. Upgrade.` | `01` (welcome headline), `design-system.md` §9 | ✓ |
| `Monad testnet` / `MONAD TESTNET` (text only, no logo, no purple) | `02` header, chain id 10143 | ✓ |
| `Android` | `landing-page-prompt.md` §1, status line: "on Android (an internal demo build)" | ⚠ The app works on Android but isn't publicly downloadable. Don't imply a store listing (see §9) |
| `STRIDE is a testnet token with no monetary value.` | `landing-page-prompt.md` §1 (as SOLE), renamed | ✓ **Required in the end card** |
| `A move-to-earn game on Monad.` | `MVP.md` §1 ("a simplified move-to-earn game … built around the Monad ecosystem"), website hero meta `Move to earn` | ✓ The end card says `MONAD TESTNET` |
| "Your Sneaker is an NFT. The first one is free." | `website/src/content/how-it-works.ts` ("get a free starter Sneaker NFT"), `phase-03-starter-sneaker-and-home.md` (the game server mints it and pays the gas) | ✓ On testnet, in the Android demo |
| "The app tracks your time and distance as you go." | `how-it-works.ts` ("Time, distance, speed and your estimated reward are live on screen."), screenshot `03` | ✓ |
| "Stop the run, and STRIDE lands in your wallet." | `how-it-works.ts` Earn step; §4 token transfer to the player's wallet | ✓ |
| "Spend STRIDE to repair and upgrade it. Each level earns more." | `how-it-works.ts` Upgrade step; §5 | ✓ |
| "It’s really yours." · "It lives in your wallet. Send it to any wallet, and its stats go with it." | `how-it-works.ts` ("Own it, really"), `MVP.md` §4, §6 | ✓ |
| `stridemon.yashmittal.xyz` | `landing-page-prompt.md` §2. Checked live 2026-10-05: HTTP 200, title "StrideMon: walk, earn and upgrade a Sneaker NFT on Monad" | ✓ |

## 2. Game rules

All of these are **live on-chain values**. `SneakerGame.getGameConfig()` returned
`(30, 10, 100, 10, 2, 3000, 1800, 5e17, 7e17, 1e17, 5e19)` on 2026-10-05, which matches `game-rules.md`.

| On screen | Value | Source | Enforced by | Status |
|---|---|---|---|---|
| Max energy | `10` | `game-rules.md:28`, config `maxEnergy` | contract | ✓ |
| 1 energy point = 1 rewarded minute | `1 POINT = 1 MINUTE` | `game-rules.md:27`, `:69` (`rewardedMinutes = min(activeMinutes, currentEnergy)`) | contract | ✓ |
| Energy regenerates | `1 point every 30 min` | `game-rules.md:30`, config `energyRegenerationSeconds` = 1800 | contract | ✓ |
| Reward | `0.5 SOLE × efficiency per rewarded minute` | `game-rules.md:75–76`, config `5e17` wei | contract | ✓ |
| Speed band | `1–20 km/h` counts, idle and vehicle-speed minutes don't | `game-rules.md:62–63` | **API only** (`game-rules.md:130`) | ⚠ True, but **not on-chain**. Never put it under an "on-chain" or "the contract enforces" heading |
| Max level | `30` | `game-rules.md:20`, config `maxLevel` | contract | ✓ |
| Efficiency per level | `+2` (starts at `10`) | `game-rules.md:21`, `:115` | contract | ✓ |
| Upgrade cost | `50 SOLE × level` | `game-rules.md:114` | contract | ✓ |
| Durability loss | `0.3 per rewarded minute`, rounded up | `game-rules.md:89` | contract | ✓ |
| Repair cost | `(100 − durability) × (0.7 + 0.1 × (level − 1)) SOLE` | `game-rules.md:104` | contract | ✓ |
| Rules can be retuned | Admin `setGameConfig`, emits `GameConfigUpdated` | `game-rules.md:3–5` | | Context: say "today's rules", never "fixed forever" |

## 3. The recorded run (v2, Sun 4 Oct 2026)

| On screen | Value | Source | Status |
|---|---|---|---|
| Run meta | `RUN IN PROGRESS • SNEAKER #2` | `03`, v2 M2 | ✓ |
| Timer, scene 1 | `1:53 → 1:56` | v2 184.25–188.0 s (1:53 from 184.25, 1:54 from 185.25, 1:55 from 186.25, 1:56 from 187.25) | ✓ |
| Live readout at `1:53`–`1:56` | `64 m` · `SPEED • 4.0 KM/H` · `9 / 10` · `+5 SOLE` · "19 GPS points recorded. 1 waiting to upload." | v2 184.0–188.0 s, 0.25 s frames | ✓ as the **live** readout |
| Walk callouts, scene 2 | distance `64 → 70 → 77 → 82 → 87 → 93 m`, speed `4.0 → 3.2 → 3.9 → 4.1 → 3.7 → 3.2 KM/H`, energy `9 → 8 / 10`, estimate `+5 → +10 SOLE` | v2 187.75–212.0 s; change times in `liveRunReadouts` (`src/content.ts`), from 0.25–0.5 s frames | ✓ They change on the frame the phone beside them does |
| Live readout at `2:52` | `132 m`, `3.6 KM/H`, `8 / 10`, `+10 SOLE` | `03`, v2 04:02 | Used only for the rebuild's overlay check, not on screen |
| Live energy during M2 | `9 / 10 → 8 / 10` (estimated) | v2 02:06–03:12 | ✓ |
| Energy after settlement | `8 / 10` (10 − 2 rewarded minutes) | v2 04:52 Home | ✓ |
| Estimated reward during M2 | `+5 → +10 SOLE` | v2 03:12 | ✓ (it reads `+15` from 04:11.0, so cut before that) |
| Run length | `3:05` | `04`, v2 M6 | ✓ |
| Active (rewarded) minutes | `2` | `04`, v2 M7, the chain event | ✓ |
| Distance counted | `78 m` | `04`, the chain event (`distanceMeters` = 78) | ✓. **Not the same number as the live `132–143 m`**: the summary counts active minutes only. Never put both on screen without saying so |
| Average speed counted | `2.3 km/h` | `04` | ✓ |
| Reward | `+10 SOLE` | `04`, v2 M7, the chain event (`10e18` wei) | ✓ |
| Reward meta | `YOU EARNED • RUN SETTLED` | `04`, v2 M7 | ✓ |
| Durability lost | `−1` | `04`, the chain event (`durabilityLoss` = 1) | ✓ |
| Settling screen | `Settling on Monad…` | v2 M6 | ✓ |
| Finish dialog | "GPS stops, and the server checks how much of it counted." | v2 04:13.73 | ✓ |
| The walk | "a **2-minute walk** paid +10 SOLE" (as in the brief) | | ⚠ The walk lasted `3:05`. Say "2 rewarded minutes" or "a 3-minute walk", not "a 2-minute walk" |

## 4. The settle transaction

| On screen | Value | Source | Status |
|---|---|---|---|
| Tx hash (full) | `0x4c614ce4b86203d066da45dda51b8a4632d71326b9e79db4f5ac2d529a233a1b` | Chain: `cast logs` on block 68183542; v2 M8 shows `0x4c61…3a1b` | ✓ |
| Block | `68183542` | Chain, v2 M8 | ✓ |
| Block time | `2026-10-04 18:11:51 UTC` (23:41:51 IST) | Chain `timestamp` 1791137511, v2 M8 | ✓ |
| Status, method | `Success`, `SettleSession` | v2 M8, chain receipt `status` = true | ✓ |
| From | `0xa7a04224FEBE644C7d4d99Cfc8dd694270C7Cf1F` (the game server) | Chain, `deployments/10143.json` `gameServer` | ✓ |
| To | `0x36cf91880F0fb41Eeda9fe79e7C5c2BE953f45B9` (SneakerGame) | Chain | ✓ |
| Event | `SessionSettled` (topic `0xef0d4466…571a`, matches the signature in `SneakerGame.sol:42–50`) | Chain log index 10 | ✓ |
| Event fields | `tokenId 2` · `player 0xdfAb…1465` · `rewardedMinutes 2` · `distanceMeters 78` · `rewardAmountWei 10000000000000000000` · `durabilityLoss 1` | Chain, decoded from the log data | ✓ Decoded from the real log, not mocked. The footage never opens the explorer's Logs tab, so as a picture it's text set from these values |
| Token transfer | `0x0000…0000 → 0xdfAb…1465 for 10 SOLE` | v2 M8b | ✓ |

## 5. Repair and upgrade (v2)

| On screen | Value | Source | Status |
|---|---|---|---|
| Repair | durability `98 → 100`, `Spent 1.4 SOLE` | v2 M10 | ✓ |
| Repair as in the brief | `96 → 100` | Phase 6 on the **old** contracts (`CLAUDE.md`). `05` shows `96 → 100` only as a quote | ⚠ Not a recorded repair on the current contracts. Use `98 → 100` if a real repair is quoted |
| Upgrade | `Level 2 reached`, `Spent 50 SOLE`, level `1 → 2`, efficiency `10 → 12` | v2 M11 | ✓ |
| MetaMask sheet | `Transaction request`, `Monad Testnet`, fee `0.0126 MON`, `Confirm` | v2 M9 | ✓ |
| Signed by the player's own wallet | repair and upgrade are sent from the player's wallet | `CLAUDE.md` Phase 6, v2 M9 | ✓ |
| Next run at efficiency 12 | `6 SOLE per rewarded minute` | Formula (`12 × 0.5`). `08` shows `+12 SOLE` for a later run (= 2 minutes) | ✓ as arithmetic. It isn't in the footage |
| "Each level pays more." | +2 efficiency per level, and reward ∝ efficiency | `game-rules.md:75`, `:115` | ✓ |

## 6. Ownership and transfer (v1, Mon 5 Oct 2026)

| On screen | Value | Source | Status |
|---|---|---|---|
| Wallet A | `0xdfAb550B4D28cD040Cf79Bf350Ac3017923C1465` (short `0xdfAb…1465`) | v1 01:56, chain `ownerOf(2)` today | ✓ |
| Wallet B | `0xe4ae33003C3fF8afd68fa65Fafa97F6206c3356f` (short `0xe4ae…356f`) | `07`, v1 00:10, chain `ownerOf(1)` today | ✓ |
| Transfer | `#2` A → B, then B → A | v1 M12–M14 (A → B), v1 05:44 (B → A) | ✓ |
| Stats that travel | `LEVEL 02 • EFFICIENCY 12 • DURABILITY 100` | v1 00:04–00:12 ("LEVEL 2 • EFFICIENCY 12 • DURABILITY 100/100"), M14 art `02 / 30`, `100 / 100` | ✓ |
| "These stats live on the Sneaker and go with it." | `07`, v1 00:04 | | ✓ |
| Explorer NFT page | `StrideMon Sneaker #2`, `ERC721`, contract `0xC116…Fa80`, owner `0xe4ae…356f` | v1 M14, `09` | ✓ |
| Today's state of #2 | level 2, efficiency 12, durability 94, owner A | Chain `getAttributes(2)`, `tokenURI(2)` | Context only |

## 7. Contracts

Verified on Sourcify (`sourcify-api-monad.blockvision.org/v2/contract/10143/<address>`), all four
`match: exact_match`, checked 2026-10-05. `SneakerGame` has a runtime `exact_match` and no
creation match.

| Contract | Address | Status |
|---|---|---|
| `SneakerNft` | `0xC116917b06BD9079C87334ED5499054b1B54Fa80` | ✓ verified |
| `SoleToken` | `0xe52DC9df236a6A4F8653432cE6Fd94Dd41e76CC0` | ✓ verified |
| `SneakerGame` | `0x36cf91880F0fb41Eeda9fe79e7C5c2BE953f45B9` | ✓ verified |
| `SneakerArtRenderer` | `0x7e01732461C1879915C35E56e73Fd8569B289ADa` | ✓ verified |

Source of the addresses: `packages/contracts/deployments/10143.json` and `packages/contracts/README.md`.

| On screen | Source | Status |
|---|---|---|
| `VERIFIED • MONAD TESTNET` | The Sourcify check above | ✓ |
| `four verified contracts` | Same | ✓ |
| The art is on-chain | `tokenURI(2)` returns `data:application/json;base64,…` with `image: data:image/svg+xml;base64,…`. No IPFS, no server | ✓ |
| "Drawn by a contract." | `SneakerArtRenderer.renderImageSvg` (pure), called by `SneakerNft.tokenURI`/`imageSvg` | ✓ |
| "The same picture everywhere." | Seen in the app (`02`, v1, v2) and on MonadVision (`09`, v1 M14, v2 M15) only. MetaMask never shows it in the footage | ⚠ Say "in the app and on the explorer", or record MetaMask showing it first |

## 8. Sneaker art states (scene 4)

All from `SneakerArtRenderer.renderImageSvg(2, (level, efficiency, durability, 10, 0))`, read-only
`eth_call`, saved in `public/sneaker/sneaker-0002-level-LL-durability-DDD.svg` (48 files: level 1 at
durability 60–100, levels 2–5 at 100, level 2 at 60, 96 and 98). Level 2 at durability 96 is byte-for-byte
the website's `sneaker-art/sneaker-0002-level-02.svg` (apart from a trailing newline).

| On screen | What the renderer does | Status |
|---|---|---|
| One lime speed line per level, up to five | `buildSpeedLines` (`SneakerArtRenderer.sol:92–118`) | ✓ |
| One lime tick per level, out of 30 | `buildLevelTicks` | ✓ |
| Lime fades as durability drops | opacity `0.40 + 0.60 × durability / 100` (`:209–216`): `0.76` at 60, `1` at 100 | ✓ |
| Durability bar | width `320 × durability / 100`: `192` at 60 | ✓ |
| `060 → 100` repair animation | Real renderer output at each value, but **no Sneaker was repaired from 60** | ⚠ Shows how the art works. Don't caption it as a repair that happened, or use the real `098 → 100` |
| Levels `01 → 05`, efficiency `10 → 18` | Real renderer output, and the formula (10 + 2 × 4 = 18). **No Sneaker has reached level 5** (#2 is level 2). Getting there costs 50 + 100 + 150 + 200 = 500 SOLE | ⚠ Fine as "how levels work". Never imply a player is at level 5 |

## 9. The script, line by line

The simplified film (2026-10-06, after STOP 4). Every line in `SCRIPT.md`, in order.

| Scene | On screen | Source | Status |
|---|---|---|---|
| 1 | "Meet StrideMon." · "A move-to-earn game on Monad." | §1 | ✓ |
| 2 | `STEP 1 OF 4` · "Get a Sneaker." · "Your Sneaker is an NFT. The first one is free." | §1 | ✓ |
| 2 | Art: `LEVEL 01 / 30`, `DURABILITY 100 / 100` (the starter's stats) | §8, renderer output; `MVP.md` §4 (level 1, efficiency 10, durability 100) | ✓ |
| 3 | `STEP 2 OF 4` · "Walk or run." · "The app tracks your time and distance as you go." | §1 | ✓ |
| 3 | Rebuilt run screen, ramped 1× → 6× → 1×: timer `1:53 → 2:17`, distance `64 → 87 m`, speed, energy `9 → 8 / 10`, estimate `+5 → +10 STRIDE` | §3 (v2 184.25–209.0 s; the timer is the run's clock, 1:53 at 184.25 s) | ✓ Each value changes when the phone's did |
| 3 | Callouts `DISTANCE` and `ESTIMATED REWARD` (same values) | §3 | ✓ |
| 4 | `STEP 3 OF 4` · footage: the STOP tap | FOOTAGE M4 | ✓ The crop shows no token name and no `+15` estimate |
| 4 | `YOU EARNED • RUN SETTLED` · `+10 STRIDE` · `A 3-MINUTE WALK • SETTLED ON MONAD TESTNET` | §3, §4 | ✓ |
| 4 | "Earn STRIDE." · "Stop the run, and STRIDE lands in your wallet." | §1 | ✓ |
| 5 | `STEP 4 OF 4` · art `DURABILITY 060 → 100`, levels `01 → 05` | §8 | ⚠ How repair and levels work; no caption calls it a recorded repair or a player at level 5 |
| 5 | `STRIDE / MIN 5 → 9` | §2: 0.5 × efficiency per rewarded minute (10 → 5, 18 → 9) | ✓ |
| 5 | "Level it up." · "Spend STRIDE to repair and upgrade it. Each level earns more." | §1, §5 | ✓ |
| 6 | Art (level 02, durability 100) · `OWNER 0xdfAb…1465 → 0xe4ae…356f` | §6 | ✓ |
| 6 | "It’s really yours." · "It lives in your wallet. Send it to any wallet, and its stats go with it." | §1, §6 | ✓ |
| 7 | `Walk.` `Earn.` `Upgrade.` · `StrideMon` · `MONAD TESTNET • ANDROID DEMO` · `stridemon.yashmittal.xyz →` | §1 | ✓ |
| 7 | "STRIDE is a testnet token with no monetary value." | §1 | ✓ Required |

No transaction hash, contract address, rule table or settlement time is on screen any more.
The footage that shows the old name (the walk recording's `+5/+10 SOLE`, "Minting your SOLE" on
the settling screen) is out of the film; the run screen is the vector rebuild, set in STRIDE.

## 10. Settlement speed (measured in v2)

| From | To | Time |
|---|---|---|
| STOP tap (04:13.31, the pill steps darker) | `+10 SOLE` on screen (04:19.01) | **5.7 s** (includes about 1.3 s on the "Finish this run?" dialog) |
| FINISH tap (about 04:14.55) | `+10 SOLE` (04:19.01) | **about 4.5 s** |
| "Settling on Monad…" appears (04:16.52) | `+10 SOLE` (04:19.01) | **2.5 s** |

Only these numbers may appear, and only with what they measure. No Monad TPS, block-time or
benchmark claims.

## 11. Voice

Plain and confident. No "revolutionary", "next-gen", "unleash", no exclamation marks, no price,
earnings or "passive income" claims.
