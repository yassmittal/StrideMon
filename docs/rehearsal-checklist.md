# Phase 8.5 Rehearsal Checklist

Everything needed to check Phase 8.5 on the phone, in order, in one file. Part A is the required
check: one full rehearsal of [`demo-script.md`](demo-script.md) by hand on the development build.
Part B (Maestro) is optional and comes after it.

Tick each box as you go. If a step doesn't match, stop there, note the step number, and send:
what you expected, what you saw, and a screenshot (plus the Metro and API terminal output if
there's an error).

**State on 2026-10-04 (read from testnet):**

| | Address | Sneaker | STRIDE |
|---|---|---|---|
| Wallet A (MetaMask Account 1) | `0xdfAb550B4D28cD040Cf79Bf350Ac3017923C1465` | #2: level 1, efficiency 10, durability 99, energy 10 | 60 |
| Wallet B (MetaMask Account 2) | `0xe4ae33003C3fF8afd68fa65Fafa97F6206c3356f` | #1: level 2, efficiency 12, durability 94 | 12 |

`SneakerGame` (`0x846cd7B8D213Bf516020f22343A69168B81fDE52`) is unpaused, with energy regenerating
at the launch pace (one point every 30 minutes).

> **Stale since 2026-10-06:** the D-038 redeploy (STRIDE) started every wallet over, so the table
> above no longer holds. Wallets A and B have no Sneaker and no STRIDE until they sign in again.
> Each gets a new starter at level 1, numbered by who signs in first. Read the new state from
> testnet before a rehearsal, and expect the Sneaker numbers below to differ.

Time needed: about 30 minutes for Part A, plus a 3-minute walk with GPS signal (outdoors, or by a
window).

---

## Part A — The rehearsal by hand

### A1. The phone, once

- [ ] **At least 2 GB free** (Settings → About phone → Storage). The phone had about 500 MB, and
      a screen recording needs the space.
- [ ] **Charged above 50%**, or plugged in.
- [ ] MetaMask has **Account 1 (A)** and **Account 2 (B)**, both with **Monad Testnet (10143)**
      enabled. Without that network, connecting fails with `setDefaultChain` (see A9).
- [ ] **B's address is in a note** on the phone, ready to paste:
      `0xe4ae33003C3fF8afd68fa65Fafa97F6206c3356f`
- [ ] The StrideMon development build is installed (it is). 8.5 needs no new build.

### A2. The laptop: start everything

Run each in its own terminal, from the repo root (`monad/`). Leave them running.

```bash
# Terminal 1: database
bun run db:start

# Terminal 2: API
bun run dev:api
```

```bash
# Terminal 3: Metro. First check the Mac's Wi-Fi IP:
ipconfig getifaddr en1
# It must equal the IP in apps/mobile/.env (EXPO_PUBLIC_API_BASE_URL=http://<that IP>:3000).
# If it changed, edit the .env first, then:
cd apps/mobile && bunx expo start --clear
```

- [ ] Phone and Mac are on the **same Wi-Fi**.
- [ ] `curl http://localhost:3000/health` prints a healthy status.

### A3. Prepare the wallets and the energy config

From the repo root:

```bash
bun run demo:prepare-wallets --dry-run
```

- [ ] It prints wallet A and wallet B with their Sneakers, STRIDE and MON. A has 60 STRIDE, which
      covers the upgrade (50) plus a repair, so it plans **no transactions** and doesn't print
      "SIMULATION COMPLETE". If it does print that line, it planned a mint, so A's STRIDE dropped
      since 2026-10-04. Then run `bun run demo:prepare-wallets` (no `--dry-run`) to mint the gap.

```bash
bun run demo:energy apply
```

- [ ] It ends with `ONCHAIN EXECUTION COMPLETE & SUCCESSFUL` and logs
      `Setting energyRegenerationSeconds to 60`. Energy now regenerates **one point a minute**.

Check the game isn't paused:

```bash
cast call 0x846cd7B8D213Bf516020f22343A69168B81fDE52 "paused()(bool)" \
  --rpc-url https://testnet-rpc.monad.xyz
```

- [X] It prints `false`.

### A4. Open the app

- [ ] **Unlock MetaMask** and switch it to **Account 1**.
- [ ] Open StrideMon. If it shows the development launcher, tap the Metro server listed there
      (`http://<IP>:8081`). Wait for the bundle to load (a blank screen for a few seconds is normal).
- [ ] If the app was already open before A3, reload it (shake the phone → **Reload**). The app
      keeps the game config for 10 minutes, and a stale one shows a 30-minute countdown.
- [ ] Start a **screen recording** now (Control Centre → Screen recorder) and keep it running
      through A5. The walk in it becomes the no-GPS fallback for the real demo.

### A5. The rehearsal (demo-script.md steps 1 to 7)

**Step 1: connect wallet**

- [ ] Profile → **Sign out**. The app returns to the welcome screen.
- [ ] **Connect wallet** → **Connect wallet** → pick **MetaMask** → in MetaMask, **Connect**
      (Account 1, Monad Testnet listed).
- [ ] Back in StrideMon: **Sign to verify it's you** → MetaMask **Confirm**.
- [ ] Home appears with **#0002**. No "Minting your Sneaker…" (A already has one).

**Step 2: show the Sneaker**

- [ ] Home's dark card: `#0002`, `LEVEL 01 / 30`, `DURABILITY 099 / 100`, efficiency **10**,
      energy **10 / 10**. Balance **60 STRIDE**.
- [ ] **Explorer ↗** opens MonadVision on Sneaker #2: the same picture, and the owner is
      `0xdfAb…1465`.

**Step 3: start an activity**

- [ ] **START**. The first time, the location explainer asks for permission: **Continue** →
      allow "While using the app".
- [ ] The dark active-run screen shows **Time**, **Distance**, **Speed**, energy left and the
      estimated reward.
- [ ] Walk at a normal pace for **3 to 4 minutes** (only whole minutes at 1–20 km/h count). Distance
      and the estimated reward go up. The numbers below assume 3 rewarded minutes; add 5 STRIDE per
      extra minute.

**Step 4: finish**

- [ ] **STOP**. The summary shows "Settling on Monad…", then within a few seconds **+15 STRIDE**,
      **3 rewarded min** and **Durability −1** (3 minutes × 5 STRIDE; durability loss rounds up from
      0.9). A shorter walk pays 5 STRIDE a minute.
- [ ] **View transaction** opens MonadVision with a `SessionSettled` event.
- [ ] **Done**. Home: **75 STRIDE**, durability **98**, energy **7 / 10** with "Next energy point
      in" **under 1:00**. One minute later energy shows 8 (the demo config working).

**Step 5: repair and upgrade** (Sneaker tab)

- [ ] **Repair to 100** shows durability 98 → 100 and costs **1.4 STRIDE** (2 points × 0.7). Tap it →
      **Confirm in wallet** → MetaMask **Confirm** → "Sneaker repaired" → **Done**.
- [ ] **Upgrade to level 2** shows level 1 → 2 and efficiency 10 → 12 for **50 STRIDE**. Tap it →
      **Confirm in wallet** → MetaMask **Confirm** → "Level 2 reached" → **Done**.
- [ ] Balance is now **23.6 STRIDE**, and it matches MetaMask's STRIDE balance.

**Step 6: show the NFT again**

- [ ] Home: `LEVEL 02 / 30` (two lime ticks), `DURABILITY 100 / 100`, efficiency **12**.
- [ ] Refresh the MonadVision page. The picture follows (its indexer can lag a few minutes; the
      app reads the chain directly).

**Step 7: transfer to B**

- [ ] Sneaker tab → **Send Sneaker #2** → paste B's address → it shows checksummed under
      "Sending to".
- [ ] **Review transfer** → "You will no longer own this Sneaker" → **Confirm in wallet** →
      MetaMask **Confirm** → **"Sneaker #2 sent"**.
- [ ] **See the new owner on the explorer**: B owns #2, still at level 2.
- [ ] **Done**. Home says **"No Sneakers in this wallet"**.
- [ ] Stop the screen recording and keep it.

### A6. Reset after the rehearsal

- [ ] **Sign in as B:** Profile → **Sign out**, switch MetaMask to **Account 2**, sign in again.
      Home shows a picker with **#1 and #2**. Pick #2: level 2, efficiency 12, durability 100.
- [ ] **Send #2 back to A:** Sneaker tab (with #2 picked) → **Send Sneaker #2** → A's address
      `0xdfAb550B4D28cD040Cf79Bf350Ac3017923C1465` → confirm. B's Home then shows only #1.
- [ ] **Sign back in as A** (sign out, MetaMask Account 1, sign in). Home shows #2.
- [ ] **Put the energy pace back**, from the repo root:

  ```bash
  bun run demo:energy revert
  ```

  It logs `Setting energyRegenerationSeconds to 1800`. Energy may show lower right afterwards. That's
  expected (D-033).

**Part A is done.** Send me the ticked list, or the first step that didn't match.

### A7. Fallbacks to try once (optional, 5 minutes)

- [ ] **No GPS:** play the screen recording from A4 from the gallery. It should be watchable as
      the step-3 fallback.
- [ ] **Wallet stuck:** if any MetaMask request fails with `Invalid Id`, Profile → Sign out, then
      sign in again (A5 step 1) and repeat the request.

---

## Part B — Maestro (optional, after Part A)

The flow `apps/mobile/.maestro/demo-without-gps.yaml` signs in only if signed out, then opens the
Sneaker tab, repairs if needed, upgrades and sends the Sneaker to B. Its StrideMon screens were
checked on the phone (2026-10-04). **The MetaMask taps (Connect / Confirm) haven't been run yet,**
so this is their first run.

It sends real transactions from A: a repair (if worn), an upgrade, and the transfer to B.

### B1. Setup

- [ ] Part A's reset is done: A owns #2 and is signed in.
- [ ] A needs STRIDE for **level 2 → 3**: 100, plus 10 for a repair. After Part A it has about
      23.6. From the repo root, `bun run demo:prepare-wallets --dry-run` shows the gap. Then run
      `bun run demo:prepare-wallets` (3 testnet transactions from the deployer, about 0.05 MON). Or
      skip Part B.
- [ ] Phone plugged in by USB, **USB tethering off**, USB mode **File transfer**.
- [ ] Developer options: **USB debugging**, **Install via USB** and **USB debugging (Security
      settings)** are all on.
- [ ] Still at least **1 GB free** (Maestro installs a small driver app on each run).
- [ ] MetaMask **unlocked** on Account 1. StrideMon open on **Home**.

### B2. Run it

```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@17 PATH="$PATH:$HOME/.maestro/bin"
adb devices          # shows 164691230c20  device
cd apps/mobile
maestro test -e WALLET_B_ADDRESS=0xe4ae33003C3fF8afd68fa65Fafa97F6206c3356f \
  .maestro/demo-without-gps.yaml
```

- [ ] Keep the phone unlocked and don't touch it. The first time, MIUI may ask to install the
      driver app: tap **Install**.
- [ ] Every line ends in **COMPLETED** (sign-in lines are skipped when already signed in, and
      repair is skipped when durability is 100).
- [ ] If a line says **FAILED**, send me that line and the debug folder path it prints
      (`~/.maestro/tests/<date>`). It holds the screenshot and the screen layout at the failure.

### B3. Reset again

- [ ] As in A6: sign in as B, send #2 back to A, sign in as A.
- [ ] `bun run demo:energy revert` if you applied it again.

---

## A9. When something goes wrong

| What you see | Fix |
|---|---|
| Blank screen or "Unable to load script" | Metro isn't running or the phone can't reach it: same Wi-Fi, then open the server from the development launcher again |
| "Network request failed" / API offline on the welcome screen | `ipconfig getifaddr en1` changed: update `apps/mobile/.env`, restart Metro with `--clear` |
| `Cannot read property 'setDefaultChain' of undefined` on connect | Monad Testnet isn't enabled in MetaMask for that account. Enable it, clear StrideMon's storage (Settings → Apps → StrideMon → Storage → Clear data), sign in again |
| MetaMask `Invalid Id`, or a request never arrives | Profile → Sign out, sign in again. Don't kill the app while a wallet request is open |
| "Settling…" for more than a minute | Is the game paused (A3's `cast call`)? Is the API terminal showing an outbox error? Send me its output |
| Energy countdown still says ~30 minutes after `apply` | Reload the app (shake → Reload) |
| Repair or Upgrade disabled | Not enough STRIDE, or nothing to repair: the caption under the button says which |
| `adb devices` lists nothing | USB tethering off, mode File transfer, data cable, accept "Allow USB debugging?" |
| Maestro `INSTALL_FAILED_USER_RESTRICTED` | Developer options → **Install via USB** on |
| Maestro `INJECT_EVENTS permission` | Developer options → **USB debugging (Security settings)** on, then replug |
| Maestro `INSTALL_FAILED_INSUFFICIENT_STORAGE` | Free at least 1 GB on the phone |
