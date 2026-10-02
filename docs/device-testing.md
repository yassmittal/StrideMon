# Device Testing

How to get the app onto a phone, run it against your laptop, and debug it there,
without anyone's help. Android is the test device for Phases 4–7 (D-022).

Every EAS and Expo command runs from **`apps/mobile`**, never the repo root. The
project's `eas.json` (with the Bun pin) and `app.config.ts` live there.

## 1. Do you need a new build?

A development build contains the app's **native** code. Its JavaScript comes from
Metro on your laptop, so most changes only need Metro.

| Change | New build? |
|--------|------------|
| TypeScript in `app/`, `src/`, `packages/shared`, `packages/chain` | No, Metro reloads it |
| A package added or removed (`bunx expo install …`) | **Yes**, if it has native code (most Expo and `react-native-*` packages) |
| `app.config.ts` (permissions, plugins, icons) | **Yes** |
| Expo SDK or React Native version | **Yes** |

Each phase spec says "Needs a new development build" when it does.

## 2. Build

```bash
cd apps/mobile
bunx eas-cli build --profile development --platform android
```

- It takes 10 to 80 minutes, depending on the EAS free-tier queue. You can close the
  terminal: the build keeps running on EAS.
- `eas.json` pins Bun (`"bun": "1.4.2"`). It must equal your `bun --version`, or the
  build can fail on the lockfile (D-015).
- First time on a new machine: `bunx eas-cli login` first.

## 3. Find the build's download link

Any of these three:

- **The build command's output.** When it finishes, it prints the link and a QR code.
  Scan the QR code with the phone.
- **The CLI, any time later:**
  ```bash
  cd apps/mobile
  bunx eas-cli build:list --platform android --limit 3
  ```
  The newest build is first. Its **Application Archive URL** is the APK link.
- **The website:** expo.dev → project **stridemon** → **Builds** → pick the build →
  **Install** (or its QR code).

Every build reports version `0.1.0`, so go by the **Finished at** time.

## 4. Install

1. **Uninstall the old StrideMon first** (long-press → App info → Uninstall). The
   builds all say 0.1.0, so otherwise you can't tell which one is on the phone. It also
   removes anything the old build left behind, such as a registered location task.
   You'll need to sign in again.
2. Open the APK link on the phone and install it. Allow installs from the browser if
   Android asks.

## 5. Run

```bash
bun run db:start                        # MongoDB. Once per laptop restart
bun run dev:api                         # terminal 1: the API on :3000
ipconfig getifaddr en1                  # this Mac's Wi-Fi IP (en0 prints nothing)
grep EXPO_PUBLIC_API_BASE_URL apps/mobile/.env   # must be http://<that IP>:3000
cd apps/mobile && bunx expo start --clear       # terminal 2: Metro
```

- Use `bunx expo start` from `apps/mobile`. `bun run dev:mobile` goes through
  `bun --filter`, which has no TTY, so it prints no QR code.
- If the IP changed (a new Wi-Fi network), edit `apps/mobile/.env` and restart Metro
  with `--clear`. `EXPO_PUBLIC_*` values are compiled in when Metro bundles.
- The phone and the laptop must be on the same Wi-Fi.

Open StrideMon on the phone. The dev launcher lists your laptop's Metro server; tap
it, or tap **Scan QR code** and scan the QR code in terminal 2.

## 6. When something goes wrong

| On the phone | What it means | Fix |
|--------------|---------------|-----|
| Metro says `Starting project at …/monad` (not `…/monad/apps/mobile`), "Using Expo Go", or "A tsconfig.json has been auto-generated"; the app closes when it opens the QR code | Metro was started from the repo root, where there is no app, so the phone got the wrong bundle | Ctrl+C, then `cd apps/mobile && bunx expo start --clear`. Delete any `app.json`, `tsconfig.json` or `.expo/` it created at the root |
| `Cannot find native module 'X'` / "runtime not ready" | The installed build is older than the JS: a native package was added since it was built | Build again (§2), or install the newest build (§3–4). Uninstall first |
| `Unable to load script` … `loadJSBundleFromAssets` | The app's JS started without Metro. In a development build that happens when Android starts the app in the background, e.g. to deliver a GPS fix after the app was swiped away mid-run. The dev launcher only sets Metro's address when you open the app yourself | Start Metro and open the app from the dev launcher. If it keeps happening, finish the run from Home, or clear the app's storage (Settings → Apps → StrideMon → Storage) |
| "Can't reach the StrideMon API" / network errors | Wrong IP, API not running, or different Wi-Fi | Check §5: `ipconfig getifaddr en1` against `.env`, and that `dev:api` is running |
| `Cannot read property 'setDefaultChain' of undefined` when connecting | MetaMask connected without Monad Testnet (10143) | Enable Monad Testnet in MetaMask first, then clear StrideMon's storage and connect again (CLAUDE.md) |
| Crash at the first GPS fix: `requested job be persisted without holding RECEIVE_BOOT_COMPLETED permission` | expo-task-manager bug (expo/expo#48935): the app must declare that permission | Fixed in `app.config.ts` (D-023). Seen again means the phone has a build from before the fix: install a newer one |
| The app closes with no red error screen | A native (Java/Kotlin) crash | Read the crash log: §7 |

## 7. Native crash logs (adb)

The Mac has no Android SDK, so install only the platform tools once:

```bash
brew install --cask android-platform-tools
```

On the phone: **Settings → About phone → tap Build number 7 times** (developer options),
then **Developer options → USB debugging** on. Plug it in and accept the prompt.

```bash
adb devices                                   # the phone should be listed as "device"
adb logcat -c                                 # clear old logs
adb logcat '*:E' ReactNative:V ReactNativeJS:V   # errors, plus React Native's own logs
```

Reproduce the crash, then copy everything from the first `FATAL EXCEPTION` or
`AndroidRuntime` line down. To see only StrideMon while the app is running:
`adb logcat --pid=$(adb shell pidof -s com.stridemon.app)`.

## 8. What the development build can't test

A development build has no JavaScript inside it (see `Unable to load script` above).
Anything where Android restarts the app in the background fails in a dev build, and
works in a build with its JS bundled in:

- Phase 4's **kill-and-reopen** check (swipe the app away mid-walk and keep walking).
  Locking the phone is fine: the app keeps running.

A build with bundled JS needs the `EXPO_PUBLIC_*` values set on its `eas.json` profile,
because `.env` files are gitignored and never uploaded to EAS (Phase 8 → Hosting). It
isn't set up yet.

## 9. Per-phase device checks

Each phase's **Definition of done** in `docs/phases/` lists what to check on the phone.
Phase 4's, and how to run them:

- **Locked-phone walk:** press START, allow "While using the app", and check the "Run in
  progress" notification appears. Lock the phone in a pocket and walk about 10 minutes of
  laps in lane 1 of a 400 m track. Count the laps. Press STOP. The summary's distance
  should be within 10% of laps × 400 m.
- **Car:** as a passenger, run for at least 3 minutes. The summary shows 0 active minutes.
- **Kill and reopen:** needs a build with bundled JS (§8).
- Since Phase 5, every settled run spends energy (1 point per rewarded minute, refilling 1 point
  every 30 minutes), so leave a gap between repeat runs.

Phase 5's check, within Wi-Fi range:

- On Home, note the SOLE balance, energy and durability. Press START and walk steadily for
  3–4 minutes (a minute only counts as a whole minute at 1–20 km/h). Press STOP.
- The summary shows "Settling on Monad…", then **+N SOLE**, "N rewarded min" and "Durability −N".
  For N minutes at efficiency 10, the reward is 5 × N SOLE. Tap **View transaction** and check the
  `SessionSettled` event on MonadVision.
- Tap **Done**. Home shows the new SOLE balance and lower energy and durability. The balance
  matches MetaMask, and the Sneaker's explorer page (`tokenURI`) shows the same durability.
- The **History** tab lists the run at the top with its reward and a "Settled" badge. Tapping it
  opens the same summary.
