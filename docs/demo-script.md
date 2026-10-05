# Demo Script

The live demo for the judges, following `MVP.md` §21. It takes about five minutes on one Android
phone, with wallet A (MetaMask Account 1) playing and wallet B (Account 2) receiving the Sneaker
at the end. Each step has a fallback, so no single failure stops the demo.

Until Phase 8.6 the app runs on the development build against the laptop API. After 8.6 it runs on
the demo build against the hosted API, and the laptop steps below fall away.

## The day before

- **Wallet A can afford the upgrade.** A earns SOLE by walking. Check what's missing:

  ```bash
  bun run demo:prepare-wallets --dry-run
  ```

  It prints both wallets and simulates any top-up: SOLE for A up to its next upgrade plus 10 for a
  repair, and MON for either wallet below 0.5. If A is still short, run it without `--dry-run`
  (D-033). It needs `DEMO_WALLET_A_ADDRESS` and `DEMO_WALLET_B_ADDRESS` in
  `packages/contracts/.env`.
- **Record the fallback walk.** Screen-record one full run on the phone: START, a few minutes of
  walking, STOP, the summary with its reward. Keep it in the phone's gallery.
- **Keep B's address handy.** Copy it into a note on the phone, to paste at step 7.

## 30 minutes before

1. Speed up energy, so the walk at step 3 has energy and it visibly refills:

   ```bash
   bun run demo:energy apply      # 1 energy point a minute
   ```

2. Check the game isn't paused: `cast call <SneakerGame> "paused()(bool)" --rpc-url
   https://testnet-rpc.monad.xyz` prints `false`.
3. Until 8.6: `bun run db:start`, `bun run dev:api`, and `cd apps/mobile && bunx expo start
   --clear`. Phone and laptop are on the same Wi-Fi.
4. MetaMask is unlocked on Account 1, with Monad Testnet enabled.
5. StrideMon is open on Home, signed in as A. Open it (or reload it) after step 1: the app keeps
   the game config for 10 minutes, so an app opened before would show the old energy countdown.
6. On the laptop, open A's Sneaker page on MonadVision (Home → **Explorer**).

## The script

### 1. Connect wallet

- **Say:** "Your wallet is your account. No email, no password."
- **Do:** Profile → **Sign out**, then **Connect wallet** → MetaMask → **Connect** → **Sign to verify
  it's you** → **Confirm** in MetaMask.
- **Show:** Home, with A's Sneaker.
- **Fallback:** if MetaMask hangs or says `Invalid Id`, skip the live sign-in: stay signed in and
  show Profile's wallet address. Fix later with Profile → Sign out, then sign in again.

### 2. Show the Sneaker NFT

- **Say:** "This Sneaker is an NFT on Monad. Its level, efficiency and durability live on-chain."
- **Show:** Home's dark card (the picture comes from the contract), then **Explorer**: the same
  picture and owner on MonadVision.
- **Fallback:** if MonadVision is slow, use the laptop tab opened earlier, or MetaMask → NFTs.

### 3. Start activity

- **Say:** "Energy limits how much you can earn. One point is one rewarded minute."
- **Do:** **START**, then walk at a steady pace for 2 to 3 minutes (1 to 20 km/h counts).
- **Show:** the active run: distance, time, speed, energy and the estimated reward.
- **Fallback (no GPS indoors):** STOP straight away and play the recorded walk from the
  gallery. Then open **History** and tap a settled run, so the next steps have a real one to show.

### 4. Finish activity

- **Do:** **STOP**.
- **Show:** "Settling on Monad…", then the reward and the durability lost. Tap **View transaction**
  to show the `SessionSettled` event. A 2-minute walk at efficiency 10 pays 10 SOLE. `MVP.md`'s
  +50 is a 10-minute walk.
- **Fallback:** settlement normally takes seconds. If it's slow, say the run is saved and settles
  by itself, go on to step 5, and come back to History later. If the API is down, show History's
  earlier runs.

### 5. Upgrade

- **Say:** "Rewards are spent on the Sneaker itself."
- **Do:** Sneaker tab → **Upgrade to level 2** → **Confirm in wallet** → **Confirm** in MetaMask.
  If the walk wore it down, **Repair** first the same way.
- **Show:** level 1 → 2, efficiency 10 → 12, and the SOLE that was burned.
- **Fallback:** if A can't afford it, the dry run the day before was skipped: move on to step 6
  and show the upgrade cost instead. If MetaMask fails, see step 1.

### 6. Show the NFT again

- **Show:** Home's card now draws `LEVEL 02`. Refresh the MonadVision tab: the picture and traits
  follow.
- **Fallback:** the explorer's indexer can lag a few minutes. The app reads the chain directly, so
  its card is already right.

### 7. Transfer

- **Say:** "It's a real asset: send it, and its stats go with it."
- **Do:** Sneaker tab → **Send Sneaker #N** → paste B's address → **Review transfer** →
  **Confirm in wallet** → **Confirm** in MetaMask.
- **Show:** "Sneaker #N sent", then **See the new owner on the explorer**: B owns it, at level 2.
  Home now says A has no Sneakers.
- **Fallback:** if MetaMask fails, show the explorer page of a Sneaker that was transferred during a
  rehearsal.

## After the demo

1. Sign in as B and send the Sneaker back to A (Sneaker tab → Send). Or leave it until the next
   rehearsal.
2. Put energy back to the launch pace:

   ```bash
   bun run demo:energy revert     # 1 point every 30 minutes
   ```

   Sneakers can show less energy right after the revert, until they regenerate (D-033).

## Automated rehearsal of the non-GPS steps

`apps/mobile/.maestro/demo-without-gps.yaml` taps through steps 1, 2, 5 and 7 on the phone,
MetaMask included: sign-in, Home, repair, upgrade and the transfer to B. How to run it is in
`device-testing.md` §10. It leaves the Sneaker with B, so send it back before the demo.
