# Footage log

Two screen recordings of the Android demo build, in `website/media-source/` (gitignored).

| File | Recorded | Length | Size | Frame rate | Audio |
|---|---|---|---|---|---|
| `video1.mp4` | Mon 5 Oct 2026 (the date on the home screen at 05:42) | 7:06.8 | 586 × 1280 | variable, about 24 fps average | track present but silent (−91 dB) |
| `video2.mp4` | Sun 4 Oct 2026, 23:35–23:45 IST (status bar clock) | 7:44.6 | 586 × 1280 | variable, about 24 fps average | track present but silent (−91 dB) |

How it was read: contact sheets at one frame every 2 s, then one frame every 0.25–0.5 s around
each key moment. Exact cut points come from ffmpeg scene detection and per-frame brightness of the
button that was tapped. Times are `mm:ss.ss` in the source file.

**Everywhere:** the status bar (clock, alarm, dual SIM, VoWiFi, battery at 18% in orange) must be
painted over in every intermediate. So must the **Expo dev-client gear**, the round floating
button at the top right (grey, and blue while pressed). It belongs to the development build, not
the app (no gear in `apps/mobile/src` or `app/`), and it also shows in screenshots `03` and `04`.

## Money moments

| # | Moment | File | In | Out | Notes |
|---|---|---|---|---|---|
| M1 | START tap | v2 | 01:09.50 | 01:14.00 | The START A RUN pill is tapped at **01:10.00**, the spinner shows 01:10.25–01:13.00, and the dark run screen appears at 01:13.25 (timer `0:03` at 01:14.0) |
| M2 | Walking: the run screen counting | v2 | 03:04.00 | 04:10.70 | Timer `1:53 → 3:00`, distance `64 → 138 m`, speed 3.0–4.1 km/h, energy `9 → 8 / 10` (at 03:12), estimate `+5 → +10 SOLE` (at 03:12). **Stop before 04:10.75**, where the estimate turns `7 / 10` and `+15 SOLE`. Skip 03:39.5–03:40.5, where the distance digits are caught mid-roll and read `198 m` |
| M2b | Earlier walking (spare) | v2 | 02:14.00 | 02:52.00 | `1:03 → 1:42`, `12 → 52 m`, energy `9 / 10`, `+5 SOLE`. Blue dev gear at 02:20–02:22 |
| M3 | Timer `2:49 → 2:52` (scene 1) | v2 | about 03:59.0 | about 04:02.5 | 132 m, 3.6 km/h, `8 / 10`, `+10 SOLE`. This is the moment in screenshot `03`. No cut or overlay between 03:56 and 04:06. Scene 1 uses a vector rebuild for the macro anyway |
| M4 | STOP tap | v2 | 04:12.80 | 04:14.90 | The pill presses at **04:13.31**. The "Finish this run?" dialog shows 04:13.73–04:14.60 and FINISH is tapped about 04:14.55. The on-screen estimate here is `+15 SOLE` and `7 / 10`, so crop to the button or cover the estimate (see FACTS §8) |
| M5 | Upload spinner | v2 | 04:14.93 | 04:16.48 | The STOP pill turns white with a spinner |
| M6 | "Settling on Monad…" | v2 | 04:16.52 | 04:19.00 | `RUN FINISHED • SETTLING`, with "Minting your SOLE and updating your Sneaker. This takes a few seconds." YOUR RUN: `3:05`, `2` active minutes, `78 m`, `2.3 km/h` |
| M7 | **+10 SOLE appears** | v2 | 04:19.01 | 04:37.90 | `YOU EARNED • RUN SETTLED`, `+10 SOLE`, REWARDED MINUTES `2`, DURABILITY LOST `−1`, VIEW TRANSACTION. Same screen as screenshot `04` |
| M8 | Explorer: settle tx | v2 | 04:42.00 | 04:43.50 | MonadVision Transaction Details: `0x4c61…3a1b`, block `#68183542`, `Success`, method `SettleSession`, `24 secs ago (Oct-04-2026 23:41:51 PM)`. Crop below the purple MonadVision header |
| M8b | Explorer: 10 SOLE minted | v2 | 04:48.00 | 04:48.50 | ERC20 Tokens Transferred: `0x0000…0000 → 0xdfAb…1465 for 10 SOLE`. Only 0.5 s still, so hold it as a freeze frame |
| M9 | MetaMask confirm (upgrade), **preferred** | v2 | 06:37.50 | 06:43.40 | "Transaction request", Account 1, Network `Monad Testnet`, fee `0.0126 MON`, Speed `Market < 1 sec`, Cancel and Confirm. **Confirm is tapped at about 06:43.4** (the button greys at 06:43.5) |
| M9b | MetaMask confirm (repair), spare | v2 | 05:53.00 | 05:55.30 | Same sheet, fee `0.013 MON`, Confirm tapped at about 05:55.3 |
| M10 | Repair result | v2 | 06:00.60 | 06:02.70 | `CONFIRMED ON MONAD`, lime check, "Sneaker repaired", "Spent 1.4 SOLE", Durability `98 → 100` |
| M11 | **Level-up result** | v2 | 06:52.25 | 06:58.00 | `CONFIRMED ON MONAD`, lime check, "Level 2 reached", "Spent 50 SOLE", Level `1 → 2`, Efficiency `10 → 12`. "Confirming on Monad…" runs 06:50.62–06:52.20 |
| M12 | Transfer: MetaMask "Sending" sheet | v1 | 01:31.00 | 01:36.20 | From Account 1, To Account 2, `Monad Testnet`, fee `0.0149 MON`. Confirm is tapped at about 01:36.2 |
| M13 | **Transfer result** | v1 | 01:39.46 | 01:54.00 | "Sneaker #2 sent", "Now owned by 0xe4ae…356f". "Confirming on Monad…" runs 01:38.27–01:39.40 |
| M14 | Explorer: NFT after the transfer | v1 | 03:58.51 | 04:07.30 | MonadVision NFT page: the Sneaker art (#0002, level 02, durability 100), Owner `0xe4ae…356f`, Contract `0xC116…Fa80`, Collection `StrideMon Sneaker`, Token ID `2`. Purple header above, crop it |
| M15 | Explorer: NFT at level 02 (wallet A) | v2 | 07:18.52 | 07:24.00 | The same page after the upgrade. Owner `0xdfAb…1465` |
| M16 | Explorer: NFT at level 01 | v2 | 00:49.65 | 00:56.00 | Before the run: level 01, durability 099 |

MetaMask never shows the Sneaker itself (its NFT tab is never opened), so the "MetaMask frame" in
scene 5 has no footage.

## video1.mp4: the transfer, A → B and back

| Start–end | On screen | Usable? | Notes |
|---|---|---|---|
| 00:00–00:02 | Home, wallet A: `#0002`, level 02, durability 100, efficiency 12, energy `10 / 10`, balance `18.6` | yes | |
| 00:02–00:04 | Sneaker tab: Repair `0 SOLE` (already full), Upgrade `100 SOLE`, `2 → 3`, efficiency `12 → 14` | yes | |
| 00:04–00:10 | Send Sneaker #2: the address field is filled, then the lime `SENDING TO 0xe4ae33003C3fF8afd68fa65Fafa97F6206c3356f` | yes, 00:10–00:12 | The keyboard (with a clipboard chip) shows 00:08–00:10 |
| 00:12–00:14 | Review "Send Sneaker #2?", red "You will no longer own this Sneaker." | yes | |
| 00:14–00:16 | `STEP 1 OF 2 • AWAITING SIGNATURE`, "Approve in your wallet" | yes | |
| 00:16–00:40 | MetaMask "Addresses / Account 2": the wallet's addresses on 11 chains | **no** | Privacy, see below |
| 00:42 | Android recent apps | **no** | Privacy |
| 00:44–00:46 | "NOT SENT: That didn't go through" and an error toast | no | A failed attempt |
| 00:48–00:58 | MetaMask addresses, then recent apps again | **no** | Privacy |
| 01:00–01:06 | MetaMask account details ("Private keys: Unlock to reveal", "Secret Recovery Phrase" rows, never opened), accounts list, MetaMask home | **no** | Privacy |
| 01:08–01:10 | Recent apps | **no** | Privacy |
| 01:12–01:22 | "NOT SENT: You cancelled in your wallet" | no | |
| 01:24–01:28 | "Approve in your wallet", then MetaMask home with the "Fund your wallet" art and a "HYPE up or down market" promo card | no | Third-party promo |
| 01:28.5–01:31 | MetaMask send sheet while the fee loads | partial | |
| 01:31.00–01:36.20 | MetaMask "Sending" sheet | **yes (M12)** | |
| 01:36.5–01:38.2 | Spinner, then "Transaction submitted" over MetaMask home | partial | Promo card is visible |
| 01:38.27–01:39.40 | `STEP 2 OF 2 • CONFIRMING`, "Confirming on Monad…" | yes | |
| 01:39.46–01:54 | "Sneaker #2 sent" | **yes (M13)** | |
| 01:56 | Home, A: "No Sneakers in this wallet", with A's address `0xdfAb550B4D28cD040Cf79Bf350Ac3017923C1465` | yes | The empty state after the send |
| 01:58–02:00 | Welcome: "Walk. Earn. Upgrade." | yes | |
| 02:00–02:36 | Sign in as B: Connect wallet, MetaMask connect, "Prove it's yours" (`0xe4ae…356f`), sign-in request | partial | MetaMask screens and promo card |
| 02:38–02:58 | Home, B: the picker `#1` / `#2`. `#0002` level 02, durability 100. `#0001` level 02, durability 094 | yes | B also owns its own starter `#1` |
| 03:00–03:04 | Sneaker tab, B | yes | |
| 03:06–03:50 | Browser, blank dark page while loading | no | |
| 03:38 | Notification shade | **no** | Privacy |
| 03:52–03:58 | MonadVision NFT page with a placeholder image | no | |
| 03:58.51–04:07.30 | MonadVision NFT page, owner B | **yes (M14)** | |
| 04:08–04:12 | Sneaker tab, then Send Sneaker #2 from B | partial | Keyboard |
| 04:14 | Recent apps | **no** | Privacy |
| 04:16–04:34 | MetaMask fox splash, home, "Start earning rewards", accounts | no | |
| 04:36–05:10 | MetaMask "Addresses / Account 1" | **no** | Privacy |
| 04:38 | Recent apps | **no** | Privacy |
| 04:40–04:44 | Send Sneaker #2 to `0xdfAb550B4D28cD040Cf79Bf350Ac3017923C1465`, review, awaiting signature | yes | |
| 05:12–05:14, 05:24 | Recent apps | **no** | Privacy |
| 05:26 | Awaiting signature | yes | |
| 05:28–05:36 | MetaMask addresses, account details, accounts | **no** | Privacy |
| 05:38–05:40 | MetaMask "Sending", From Account 2 → To Account 1, fee `0.0151 MON` | yes | Spare for M12 |
| 05:42 | Android home screen | **no** | Privacy |
| 05:44–05:50 | "Sneaker #2 sent", "Now owned by 0xdfAb…1465" | yes | Spare for M13 |
| 05:52–05:56 | MonadVision NFT page, owner `0xdfAb…1465` | yes | Purple header |
| 05:58–06:04 | Send sheet, Home B, Profile B (`0xe4ae…356f`, `2.1567 MON`) | partial | |
| 06:06–06:58 | Sign out, Welcome, connect as A, "Prove it's yours" (`0xdfAb…1465`), sign-in request | partial | MetaMask screens |
| 06:58–07:06 | Home and Sneaker tab, A: `#0002` level 02, durability 100, efficiency 12, `18.6` | yes | |

## video2.mp4: the run, settle, repair and upgrade

| Start–end | On screen | Usable? | Notes |
|---|---|---|---|
| 00:00–00:02 | Home, A: `#0002` level 01, durability 099, efficiency 10, energy `10 / 10`, balance `60` | yes | |
| 00:02 | Profile: `0xdfAb…1465`, `3.1435 MON`, SIGN OUT | partial | |
| 00:04–00:06 | Welcome, "Walk. Earn. Upgrade.", "CHECKING THE API…" | yes | |
| 00:08–00:28 | Connect wallet sheet (MetaMask, Trust Wallet, Binance Wallet, SafePal), MetaMask, "Prove it's yours" | partial | Other wallets' logos in the list |
| 00:30–00:42 | Home loading, then Home at level 01 | yes | |
| 00:43–00:49.6 | MonadVision NFT page loading | no | |
| 00:49.65–00:56 | MonadVision NFT, level 01 | yes (M16) | |
| 00:58–01:09 | Home, scrolled to `60` SOLE and START A RUN | yes | |
| 01:09.50–01:14.00 | START tap | **yes (M1)** | |
| 01:14–01:54 | Run screen: `0:03 → 0:44`, `0 → 2 m`, `10 / 10`, `+0 SOLE`, "Waiting for GPS…" at first | yes, slow | Standing still, nothing counts yet |
| 01:56 | Notification shade, including StrideMon's own "Run in progress" notification | **no** | Privacy |
| 01:58 | Run `0:47` | yes | |
| 02:00–02:04 | Expo dev menu over the run ("Runtime version: exposdk:57.0.0", Reload, Go home, tools) | no | Dev build UI, opened by the phone shaking while walking |
| 02:06–02:10 | Run `0:55 → 1:12`, `12 m`, `3.5 km/h`, energy `10 → 9` | yes | Blue dev gear 02:08–02:10 |
| 02:12, 02:16 | Dev menu | no | |
| 02:14–02:52 | Run `1:03 → 1:42` | **yes (M2b)** | |
| 02:54–03:02 | Dev menu | no | |
| 03:04.00–04:10.70 | Run `1:53 → 3:00` | **yes (M2)** | Contains M3 |
| 04:10.75–04:13.30 | Run `3:00 → 3:02`, `143 m`, `7 / 10`, estimate `+15 SOLE` | partial | The estimate isn't what settled |
| 04:12.80–04:16.48 | STOP, "Finish this run?", spinner | **yes (M4, M5)** | |
| 04:16.52–04:19.00 | "Settling on Monad…" | **yes (M6)** | |
| 04:19.01–04:37.90 | **+10 SOLE** | **yes (M7)** | |
| 04:38.0 | VIEW TRANSACTION tapped, browser opens | yes | |
| 04:38.5–04:41.5 | MonadVision tx page skeleton | no | |
| 04:42.00–04:43.50 | Transaction Details | **yes (M8)** | |
| 04:44–04:47.5 | Scrolling: From `0xa7a0…Cf1F` (game server), To `0x36cf…4589` (SneakerGame) | yes | |
| 04:48.00–04:48.50 | ERC-20 transfer, 10 SOLE | **yes (M8b)** | |
| 04:49–04:49.5 | Fee `0.017484636 MON`, gas `171,418`, `102 Gwei` | no | Detail no one needs |
| 04:50 | Back to the summary | yes | |
| 04:52–05:22 | Home: level 01, durability 098, energy `8 / 10`, "Next energy point in 3:34" counting down, balance `70` | yes | |
| 05:04 | WhatsApp notification banner | **no** | Privacy |
| 05:24–05:26 | Sneaker tab: Repair `1.4 SOLE`, durability `98 → 100`. Upgrade `50 SOLE`, level `1 → 2`, efficiency `10 → 12` | yes | |
| 05:28 | Review "Repair your Sneaker?", `98 → 100`, SOLE `70 → 68.6` | yes | |
| 05:30–05:49 | MetaMask fox splash and home | no | Promo card |
| 05:49.5–05:55.30 | MetaMask "Transaction request" for the repair | **yes (M9b)** | The fee loads at 05:53.0 |
| 05:56–05:59 | "Transaction submitted" | partial | |
| 06:00.60–06:02.70 | "Sneaker repaired" | **yes (M10)** | |
| 06:02–06:10 | Sneaker tab: Repair `0 SOLE`, UPGRADE TO LEVEL 2 | yes | |
| 06:12–06:16 | WhatsApp notification banner | **no** | Privacy |
| 06:18–06:22 | Home, `68.6` | yes | |
| 06:24 | Review "Upgrade to level 2?", `1 → 2`, efficiency `10 → 12`, SOLE `68.6 → 18.6` | yes | |
| 06:26–06:32 | MetaMask: "Transaction #5 complete" toast and home | no | |
| 06:34–06:37.4 | MetaMask request while the fee loads | partial | |
| 06:37.50–06:43.40 | MetaMask "Transaction request" for the upgrade | **yes (M9)** | |
| 06:46.65–06:50.6 | Spinner, then "Transaction submitted" | partial | |
| 06:50.62–06:52.20 | "Confirming on Monad…" | yes | |
| 06:52.25–06:58 | **"Level 2 reached"** | **yes (M11)** | |
| 07:00–07:16 | Home: level 02, durability 100, efficiency 12, energy `8 / 10`, `18.6` | yes | |
| 07:17.5–07:24 | MonadVision NFT, level 02 | **yes (M15)** | |
| 07:26–07:44 | Home | yes | |

## Privacy pass

Wallet addresses and testnet hashes are public and fine to show. Everything below stays out of the
film, and none of it is inside an M-range above.

| Where | What | Severity |
|---|---|---|
| v2 05:04 | **WhatsApp banner: a group name, a sender's full name and the start of their message** | High |
| v2 06:12–06:16 | **WhatsApp banner: the same group, another sender's name and their message** | High |
| v1 05:42 | **Android home screen: the wallpaper is a personal photo of two people**, plus the date and dock apps | High |
| v1 00:42, 00:54–00:56, 01:08–01:10, 04:14, 04:38, 05:12–05:14, 05:24, 05:44 (edge) | Recent-apps view: the same wallpaper photo blurred behind, and the apps in use (Bitwarden, WhatsApp, Chrome, PhonePe) | High |
| v1 03:38, v2 01:56 | Notification shade: clock and date, carrier name, mobile-data usage, the screen-recorder notification | Medium |
| v1 00:16–00:40, 00:48–00:58, 04:36–05:10, 05:16–05:22, 05:28–05:30 | MetaMask "Addresses" lists each account's address on 11 chains (Bitcoin, Solana, Tron, Stellar, …). Public data, but it ties this person's wallets together across chains, which the film doesn't need | Medium |
| v1 01:00, 05:32–05:34 | MetaMask account details with the "Private keys" and "Secret Recovery Phrase" rows (never opened, nothing revealed) | Low, but keep it out |
| Every frame | Status bar: clock, alarm, dual SIM and VoWiFi, battery at 18% | Paint over |
| Every frame | Expo dev-client gear (top right) | Paint over |
| v2 02:00–02:04, 02:12, 02:16, 02:54–03:02 | Expo dev menu, which shows it's a development build | Not private, unusable |
| Both files | The audio track is silent (−91 dB): no voices or room sound | None |

No seed phrase, password, contact list or other app's content is legible in any M-range.
