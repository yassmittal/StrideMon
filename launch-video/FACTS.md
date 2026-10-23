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
| `stridemon.xyz` | D-040 (2026-10-07), replaces `stridemon.yashmittal.xyz` (`landing-page-prompt.md` §2, checked live 2026-10-05), which now redirects to it | ✓ |

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

These are the 8.3 contracts the footage was recorded on. They were replaced on 2026-10-06 when the
token became STRIDE (D-038); the live addresses are in `packages/contracts/README.md`. The film
shows no address, so nothing on screen changes.

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
| 7 | `Walk.` `Earn.` `Upgrade.` · `StrideMon` · `MONAD TESTNET • ANDROID DEMO` · `stridemon.xyz →` | §1 | ✓ |
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

## 12. The waitlist film (2026-10-13)

The Founding Pass waitlist film (`docs/waitlist-video-prompt.md`), for the post
`social/posts/2026-10-15-waitlist-mints-first.md`. `src/waitlist/content.ts` mirrors this section.
Sources: the brief is `docs/founding-pass-brief.md`; `founding-pass.ts`, `waitlist.ts` and
`founding-pass-designs.ts` are in `website/src/content/`. The art is the contract renderer's own
output: the gallery cards in `website/public/pass-art/cards/`, and the Founder Sneaker pictures in
`packages/contracts/art/founding-pass/previews/` (`SneakerArtRenderer`, D-042).

**Never on screen in this film:** a date or time, a price, worth, value, floor, airdrop,
whitelist, a countdown, a sign-up count, mainnet, a store, or a STRIDE amount. The mint times are
only final after Part 10, so the film gives none.

| On screen | Source | Status |
|---|---|---|
| `1,000 Founding Passes.` | Brief §1, §3.1; `passPageContent` ("1,000 Founding Passes") | ✓ |
| `Each design exists once.` | Brief §3.1 ("Each of the 1,000 designs can be minted once"); every card says `1 OF 1` | ✓ |
| The grid: 25 real cards (numbers in `src/waitlist/pass-art.ts`) | `cards/NNNN.svg`, unchanged | ✓ Real designs with their own numbers and names |
| `#0137` · `Rose Hiker Night` · `COMMON · 1 OF 1` (printed on the card) | Design table row 137 (Rose, Hiker, Night; Common); `cards/0137.svg` | ✓ |
| `#0020` · `Earthshine` · `LEGENDARY · 1 OF 1` (printed on the card) | Design table row 20 (Prism, Runner: the Runner's Legendary name, brief §3.2); `cards/0020.svg` | ✓ |
| `LEGENDARY  •  10 OF 1,000` | Brief §3.2: 650 Common, 250 Uncommon, 90 Rare, 10 Legendary; the design table counts the same (checked 2026-10-13) | ✓ |
| `Your way into StrideMon.` | Brief §1 ("It's their early access to the app"); `passPageContent.intro` ("It's your early access to StrideMon") | ✓ |
| `Your Founder Sneaker, in the same design.` | Brief §7; `passPageContent.intro` ("the app gives you a Founder Sneaker in the same design"); FAQ "Is the pass my Sneaker?" | ✓ |
| Founder Sneaker picture, cropped to `FOUNDER SNEAKER  #0137`, the shoe, `Rose Hiker Night` and `LACED` | `previews/founder-sneaker-0137-minted.svg` and `-laced.svg`, drawn by `SneakerArtRenderer` for pass #0137 | ⚠ The crop leaves out the level and durability rows: the laced preview shows level 06 and durability 064, which a first walk doesn't give |
| Unlaced → Laced (the lace slats draw in, `LACED` appears) | Brief §3.2 ("Laced after the holder's first settled walk"), §2 | ✓ |
| `Free. We pay the gas.` | Brief §1 ("gas-free"), §2 ("the server pays the gas"), §5.3; FAQ "Is it free?" ("there's no gas to pay: StrideMon pays it") | ✓ |
| `Can't be sold or sent.` | `passPromiseLine` ("It can't be sent or sold"); brief §7 | ✓ |
| `It stays with you.` | Brief §7 (soulbound: it can't be sent or sold); the post's reply ("It's your way in, and it stays with you"). A lost wallet's pass moves to the founder's new wallet (brief §7), so it still stays with them | ✓ Replaces the brief's draft `Not a token.`: an ERC-721 pass is a token in the technical sense, and the film has no room to say "not a fungible token" |
| `Waitlist  •  Founding Pass` | `waitlistContent.metaLabels` | ✓ |
| `Join the waitlist.` · `Mint 48 hours before everyone else.` | `waitlistContent.heading` ("Join the waitlist to mint 48 hours before everyone else."); brief §5.1 | ✓ |
| The form: `EMAIL`, `you@example.com`, `JOIN THE WAITLIST`, `JOINING` | `waitlistContent` (`emailLabel`, `emailPlaceholder`, `submitLabel`, `submittingLabel`); the press steps `#2B2E3A → #000000` (`active:bg-ink`, `waitlist-form.tsx`) | ✓ A vector rebuild, not a screenshot. The optional phone choice is left out |
| `One email, when the waitlist window opens, and nothing else.` | `waitlistContent.promise` (its first sentence) | ✓ |
| `You're on the list.` · `We'll email you once, when the waitlist window opens.` | `waitlistContent.joinedMessage` | ✓ |
| `stridemon.xyz/pass` · `StrideMon` · `MONAD TESTNET` | D-040; §1 | ✓ |

## 13. The Sneaker drop film (2026-10-14)

The Sneaker drop film (`docs/sneaker-drop-video-prompt.md`): the Founder Sneaker designs cut to
music, with almost no words. `src/sneaker-drop/content.ts` mirrors this section. The art is the
contract renderers' own output, unchanged: the laced Sneakers in `website/public/pass-art/laced/`
(`FoundingPassArtRenderer`), and #0020's Founder Sneaker picture from
`packages/contracts/art/founding-pass/previews/8-founder-sneakers.svg` (`SneakerArtRenderer`,
D-042). Which designs, and why: `src/sneaker-drop/sneakers.ts`.

**Never on screen in this film:** a price, worth, value, floor, "mint", a drop date or any date,
airdrop, whitelist, "limited", "don't miss out", a STRIDE amount, mainnet, or a store badge. Nothing
about the Founding Pass beyond the Legendary's picture.

| On screen | Source | Status |
|---|---|---|
| The Sneakers: 49 designs one by one and in splits, and all 1,000 in the flood | `laced/NNNN.svg`, unchanged (numbers in `src/sneaker-drop/sneakers.ts`) | ✓ Real designs. On black each gets `SneakerArtRenderer`'s own light rim (the Founder Sneaker's, D-042); in the cold open the hero's own strokes draw in one colour |
| `#0137  ROSE HIKER NIGHT` | Design table row 137 (Rose, Hiker, Night; Common); §12 | ✓ |
| `#0020  EARTHSHINE` · `LEGENDARY` | Design table row 20 (Prism, Runner: the Runner's Legendary name, brief §3.2); §12 | ✓ |
| #0020's Founder Sneaker picture: `FOUNDER SNEAKER`, `#0020`, the shoe, `Earthshine`, `LEVEL 01 / 30`, `DURABILITY 100 / 100` | `previews/8-founder-sneakers.svg`, the cell captioned `#0020 · MINTED · LV 1`, drawn by `SneakerArtRenderer` for a stand-in pass (`PreviewFoundingPass`); a new Sneaker starts at level 1 of 30 and durability 100 (`game-rules.md`, Sneaker attributes) | ⚠ It shows what #0020's Founder Sneaker looks like when minted. #0020 isn't minted yet, and the film never says it is |
| `stridemon.xyz` · `StrideMon` · `MONAD TESTNET` | D-040; §1 | ✓ |

## 14. The Pass chat film (2026-10-16)

The Pass chat film (`docs/pass-chat-video-prompt.md`): a group chat on a lime phone picks a pass,
the phone spins into a card where #0627 floats in the same sky, ten other passes burst out, and it
ends on "This isn't a JPEG." `src/pass-chat/content.ts` mirrors this section. The art is the
gallery cards' own shoes (`website/public/pass-art/cards/NNNN.svg`, `FoundingPassArtRenderer`),
cropped to the shoe and unchanged, unlaced as `/pass` shows them. Which designs, and why:
`src/pass-chat/sneakers.ts`.

**Never on screen in this film:** a STRIDE amount or the STRIDE disclaimer (Yash, 2026-10-16: the
film shows no STRIDE amount), a price, worth, value, floor, "mint", airdrop, whitelist, "limited",
"don't miss out", any date, mainnet, a store badge, an Apple logo, "iMessage", emoji, or the
reference's own objects.

| On screen | Source | Status |
|---|---|---|
| "Founding Passes" | `founding-pass.ts` (`passPageContent`), brief §1 | ✓ |
| "the free ones" | Brief §1 ("gas-free"), FAQ "Is it free?"; §12 `Free. We pay the gas.` | ✓ |
| "on Monad" | Brief §1 (minted on Monad testnet) | ⚠ A friend's casual words in the chat. The end card no longer shows `MONAD TESTNET` (Yash, STOP 1, 2026-10-16), so the post's text and alt text say "Monad testnet" |
| "1,000 designs. all 1 of 1" | Brief §1, §3.1; §12 (`1,000 Founding Passes.`, `Each design exists once.`) | ✓ |
| "i'm taking #0627" | Design table row 627 (Lime, Runner, Day; Common). Picking a pass in the gallery before the mint is what `/pass` is for (D-044, D-050) | ⚠ #0627 must be unminted and not pending on `GET https://api.stridemon.xyz/v1/pass/collection`: checked 2026-10-16 and again on delivery (2026-10-16, after the sound change): only #0137 minted, none pending. If it's taken before the post goes out, the hero changes (ask Yash) |
| `Today 7:30 AM` | A made-up chat time | ✓ No date, nothing claimed |
| The compose bar's `Message` and its `+` and mic | A generic chat app's chrome | ✓ Never "iMessage", no Apple logo, no iPhone silhouette: a generic Android phone |
| #0627's shoe, unlaced | `cards/0627.svg`, cropped to the shoe, unchanged | ✓ As the gallery shows it |
| `#0627  LIME RUNNER DAY` | Design table row 627 | ✓ |
| The ten burst shoes | `cards/NNNN.svg`, cropped, unchanged; all ten unminted and not pending on 2026-10-16 (`scripts/pick-pass-chat-designs.ts` checks the collection), and again on delivery the same day | ✓ Real designs |
| The phone's back: the StrideMon mark in ink | `website/src/app/icon.svg`'s three strokes | ✓ Our own mark, never a logo we don't own |
| "This isn't a JPEG." | The pass art is SVG drawn on-chain by `FoundingPassArtRenderer` (D-041, D-042); the pass can't be sold or sent (brief §7) and is early access to the app (brief §1) | ⚠ The joke holds because it's literally true (it's an on-chain SVG) and the point is true (it's a way in, not a picture to trade). Say nothing about other NFTs |
| `It’s your way into StrideMon.` | §12 (`Your way into StrideMon.`, sourced there); brief §1 | ✓ |
| `stridemon.xyz/pass` (the end card's pill; no wordmark or network line under it, Yash, STOP 1) | D-040; §1, §12 | ✓ |

## 15. The App tour film (2026-10-17)

The App tour film (`docs/app-tour-video-prompt.md`): a 30 s, 9:16 tour of the app, one phone in the
middle, one colour and headline per step of the game loop. `src/app-tour/content.ts` mirrors this
section. The footage is `website/media-source/submission-reel.mp4` ("reel", recorded 2026-10-07 on
the D-038 contracts, with the STRIDE name), logged in `FOOTAGE.md` ("The App tour film"). The
rebuilt screens copy `apps/mobile`'s own strings and are checked against the reel by
`scripts/check-app-tour-rebuilds.py`.

**Never on screen in this film:** a price, worth, value, "earn money", airdrop, "mint" as a sale,
"download now", mainnet, a user count, STEPN, a store badge, an iPhone silhouette or Dynamic Island,
MetaMask's screens, the location-permission screen, a wallet address or transaction hash, the
reel's explorer pages, emoji, or anything of the reference's.

| On screen | Source | Status |
|---|---|---|
| `Meet StrideMon.` | The name (§1); an introduction, so it claims nothing | ✓ |
| `Walk or run.` | The welcome screen ("Walk or run with it to earn STRIDE", `01-welcome.png`); §1 | ✓ |
| `Earn STRIDE.` | §1, §2 | ✓ STRIDE amounts are on screen, so the posts' captions carry the disclaimer (below) |
| `Keep it running.` | The Repair panel: "Every run wears your Sneaker down. At zero durability it can't run until it's repaired." (reel 36.0 s, `RepairPanel.tsx`) | ✓ |
| `Level up.` | Upgrade: +1 level, +2 efficiency (§2, §5); §9's "Level it up." | ✓ |
| The icon, the splash | `apps/mobile/assets/icon.png`, `splash-icon.png` (the tile at 52% of a 200 dp image, `build-app-icons.sh`), `app.config.ts`; drawn from `website/src/app/icon.svg`'s strokes | ✓ |
| `Minting your Sneaker…`, Home with `#0003`, `LEVEL 01 / 30`, `DURABILITY 100 / 100`, `EFFICIENCY 10`, `ENERGY 10 / 10`, balance `0` | Reel 6.5–15.0 s (a new player's starter Sneaker, 2026-10-07) | ✓ |
| #0003's art at level 1 (durability 100) and level 2 (durability 100) | `SneakerArtRenderer.renderImageSvg(3, …)`, read-only `eth_call` (`scripts/fetch-app-tour-sneaker-art.sh`); level 1 matches the reel's card at 10.5 s within 2 px; the files equal #2's (§8) but for the id | ✓ Real renderer output, never redrawn |
| The run: `0:01 → 2:29`, `0 → 161 m`, `+0 → +5 → +10 STRIDE` estimated, energy `10 → 9 → 8 / 10` | Reel 16.5–25.1 s (the reel itself is already sped up; the film ramps it again) | ✓ The app's own screen. Never restated as a claim ("a 2-minute walk paid 10 STRIDE" is banned, `voice.md` §3) |
| `Settling on Monad…`, `+10 STRIDE`, `YOU EARNED • RUN SETTLED`, rewarded minutes `2`, durability lost `−1`, the summary's `2:34`, `2`, `134 m`, `4.0 km/h`, "Distance and speed count active minutes only." | Reel 28.4–34.5 s | ✓ The app shows the testnet line under the amount. `134 m` differs from the run screen's `161 m`; the summary's own caption says why |
| Repair: `0.7 STRIDE`, `Durability 99 → 100`, `REPAIR TO 100`, `You have 10 STRIDE.`, `Repair your Sneaker?`, `STRIDE balance 10 → 9.3`, `CONFIRM IN WALLET`, `Sneaker repaired`, `Spent 0.7 STRIDE` | Reel 35.6–42.6 s | ✓ |
| The repair's `STEP 2 OF 2 • CONFIRMING`, `Confirming on Monad…`, `Usually a couple of seconds.`, `VIEW TRANSACTION ↗` | Reel 40.37–40.57 s; rebuilt (`SneakerTransactionSheet.tsx`), because those frames still show the app switch | ✓ A rebuild of a real moment, matched within 3 px |
| After the repair: `Repair` `0 STRIDE`, `REPAIR` (disabled), `Already at full durability.` | `RepairPanel.tsx` and `describeSneakerActionBlockedReason` at full durability; the reel's backdrop at 40.4 s shows the `0 STRIDE` chip | ✓ |
| `ENERGY 8 / 10`, `Next energy point in 26:30 → …` (counting down) | Reel 35.9 s (`8 / 10`, `27:00`) and 40.5 s (`26:37`): the run used two energy points (§3); the clock is the app's live countdown | ✓ |
| `Send Sneaker #3` | `TransferPanel.tsx` (`Send Sneaker #${tokenId}`) for #3 | ✓ |
| Upgrade: `50 STRIDE`, `Level 1 → 2`, `Efficiency 10 → 12`, `UPGRADE TO LEVEL 2`, `STEP 2 OF 2 • CONFIRMING`, `Confirming on Monad…`, `CONFIRMED ON MONAD`, `Level 2 reached`, `Spent 50 STRIDE`, the card's `LEVEL 02 / 30` and `EFFICIENCY 12` | `UpgradePanel.tsx`, `SneakerTransactionSheet.tsx`; cost 50 × level and +2 efficiency (§2); a real 1 → 2 upgrade (§5, v2 M11) | ⚠ **A rebuild, not footage.** That real upgrade was Sneaker #2 when the token was SOLE, and the reel never upgrades #3. It shows how upgrading works, with the app's real words and rules. **No STRIDE balance anywhere in this beat**: the repair left 9.3, which can't pay 50, so the panel's "You have N STRIDE." and the sheet's balance row are left out |
| `Walk. Earn. Upgrade.` · `StrideMon` · `Ready to move?` · `stridemon.xyz` · `ANDROID DEMO` · `MONAD TESTNET` | §1, §9 (row 7: `MONAD TESTNET • ANDROID DEMO`); D-040; "Ready to move?" is a question and claims nothing | ✓ |
| `Monad testnet. STRIDE has no monetary value.` | `voice.md` §4 | ⚠ **Not on the end card** (Yash, 2026-10-17: "it's unnecessary"). STRIDE amounts are on screen, so every post of this film carries it in its caption, as `voice.md` §4 allows ("in the post or in its thread"). The app's own summary screen still shows it under `+10 STRIDE` |

## 17. The Crush film (2026-10-23)

`Crush9x16`, `docs/crush-video-prompt.md`. Everything else on screen is the reference's own footage
(its hook caption "He will look at the person he likes first ❤️" included) or #0137's art.

**Never on screen in this film:** a STRIDE amount, a price, "free", a date, a user count, a wallet,
an app screen, or anything of Naisnow's (its cup, logo, name or drink).

| On screen | Source | Status |
|---|---|---|
| #0137's laced Sneaker, built in four layers | `website/public/pass-art/laced/0137.svg`, the contract renderer's own art (DESIGNS_FROZEN_ON); the build only moves, clips and hides its paths, and ends on the art as minted | ✓ |
| `4-layers On-chain` | The four making shots (sole, colour, panels, laces); the art is drawn on-chain (D-030, D-041) | ✓ |
| `Love In Every Step` | A line, no claim | ✓ |
| `ROSE HIKER` / `NIGHT` | #0137's name (`src/showroom/sneakers.ts`, the design table) | ✓ |
| The pair on the bench | Two copies of #0137: a pair of the same shoe, not two passes | ✓ Each pass is one of one; the film never says or shows "two" |
| The mark, `StrideMon`, `stridemon.xyz/pass` | `website/src/app/icon.svg`'s strokes; D-040 | ✓ |
