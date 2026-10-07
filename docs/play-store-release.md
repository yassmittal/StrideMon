# Play Store release

Everything needed to put StrideMon on Google Play, from the developer account to the production
rollout, in order. Written 2026-10-07 against the current app (`apps/mobile`, Expo SDK 57,
React Native 0.86, `com.stridemon.app`) and Play's policies as of that date.

**Part B's code is built (D-039, 2026-10-07):** the privacy and delete-account pages, `DELETE /v1/me`
and the app's Delete account, the `production` EAS profiles, the testnet line and the app icon.
They go live when the website and the hosted API are redeployed. Parts A, C and D wait until Yash
decides to ship.

> **Timeline reality.** A personal developer account can't publish to production until a closed
> test has run with **at least 12 testers, opted in for 14 days in a row** (step 7). Add account
> verification and review, and the earliest production date is about **3 weeks** after step 1.
> It can't happen before the Metropolis deadline (2026-10-14). Keep the demo on the EAS APK for that.

---

## Overview

| # | Step | Who | Time |
|---|------|-----|------|
| 1 | Google Play developer account | Yash | 1–3 days (verification) |
| 2 | Code and config changes (privacy, deletion, build profile) | Claude + Yash | 1–2 days |
| 3 | Infrastructure checks (game-server funding, Reown, API) | Yash | ½ day |
| 4 | Store listing assets | Yash (+ Claude for copy) | ½ day |
| 5 | App content declarations in Play Console | Yash | ½ day |
| 6 | First production build and upload (internal testing) | Yash | ½ day |
| 7 | Closed test: 12 testers × 14 days | Yash + testers | 14+ days |
| 8 | Apply for production access, then review | Google | ~1–7 days |
| 9 | Production rollout | Yash | 1 day |
| 10 | Updates after launch | Yash | ongoing |

---

## Part A: Account

### 1. Google Play developer account

1. Go to <https://play.google.com/console/signup> with the Google account that will own the app.
2. Choose **Personal** (an **Organization** account skips the 12-tester rule in step 7, but needs a
   registered business and a D-U-N-S number, which is free but takes days to weeks).
3. Pay the **one-time US$25** registration fee. This is the only unavoidable cost in this guide.
4. Complete **identity verification** (government ID, and for personal accounts, a verified phone
   number and address). Google can take a few days.
5. Your developer name is shown publicly on the listing. "Yash Mittal" or "StrideMon" both work;
   the contact email is public too, so consider a dedicated one (e.g. `support@stridemon.com` or a
   Gmail alias).
6. Install the **Google Play Console** app on the Android phone. Play requires the developer to
   verify that they have access to a real Android device.

- [ ] Account shows as verified in Play Console.

#### Option: publish from an existing account (e.g. a mentor's)

Instead of steps 1.1–1.6, the owner of an existing Play Console account invites you:
Play Console → **Users and permissions** → **Invite new users** → your Google email. They can give
permissions for **this app only** (create and edit the app, manage testing tracks, release to
production, manage store presence, app content), so you never see their other apps or payments.

What changes:

- **The listing shows their developer name and contact details**, not yours.
- **They are legally responsible** for the app. A policy strike against StrideMon counts against
  their whole account, and repeated strikes can terminate it along with all their other apps.
  Crypto apps get extra review, so they should know what they're agreeing to.
- **The 12-tester rule (step 7) may not apply.** It only applies to personal accounts created after
  2023-11-13. If their account is older, or an organization account, you can skip step 7. Their
  Play Console **Dashboard** shows whether production access is unlocked for a new app.
- **The service account for `eas submit`** (step 6.4) is created in a Google Cloud project and
  invited by them; or they invite yours with this app's permissions only.
- **Moving the app later** to your own account is possible with Play's **app transfer** (the
  package name `com.stridemon.app`, its installs and reviews move together). The new account must
  exist and be verified first.

---

## Part B: Make the app store-ready

### 2. Code and config changes

These are the gaps between the demo build and a store build. Each needs a doc update first, then
code, following `docs/conventions/coding-standards.md`.

#### 2.1 Privacy policy (required)

The app collects precise location, a wallet address, and (on the website) emails. Play rejects
apps without a public privacy policy URL.

- Add `website/src/app/privacy/page.tsx` → `https://stridemon.xyz/privacy`.
- It must say, in plain words:
  - **What is collected:** precise location samples during an active run (stored up to 30 days,
    the `locationSamples` TTL), wallet address, activity sessions (time, distance, speed),
    auth sessions, device push/crash data if any is added later.
  - **What goes on-chain:** active minutes and distance settlements, Sneaker ownership and stats.
    **On-chain data is public and can't be deleted.** Routes are never on-chain.
  - **Why:** to measure runs and pay rewards; anti-cheat validation.
  - **Who it's shared with:** the Monad testnet (public), MongoDB Atlas (storage),
    WalletConnect/Reown (wallet connection), the hosting provider. No ads, no sale of data.
  - **Retention and deletion:** how to delete the account (2.2).
  - **Contact email.**
- Link it from the website footer and from the app's Profile screen.

#### 2.2 Account deletion (required)

Play requires that any app which lets users create an account also lets them **request deletion
both inside the app and from a web page** (without reinstalling the app). Signing in with a wallet
creates a player record, so this applies.

- **API:** `DELETE /v1/me` (authenticated) deletes the player's auth sessions, activity sessions
  and location samples for that wallet address, through `repositories/`. It can't touch the chain:
  Sneakers and STRIDE stay in the wallet, and the docs and copy must say so.
- **App:** Profile → "Delete account" → confirm sheet → call it → sign out.
- **Web:** `https://stridemon.xyz/delete-account`: explains what is deleted and what
  stays on-chain, and how to request it (in the app, or by email from the wallet owner with a
  signed message). A simple email-based process is accepted by Play as long as it's documented.

#### 2.3 Production build profile in `eas.json`

Add a `production` profile next to `demo`. Play needs an **Android App Bundle** (`.aab`), not an APK:

```json
"production": {
  "bun": "1.4.2",
  "autoIncrement": true,
  "android": { "buildType": "app-bundle" },
  "env": {
    "EXPO_PUBLIC_API_BASE_URL": "https://api.stridemon.xyz",
    "EXPO_PUBLIC_MONAD_CHAIN_ID": "10143",
    "EXPO_PUBLIC_MONAD_RPC_URL": "https://testnet-rpc.monad.xyz",
    "EXPO_PUBLIC_REOWN_PROJECT_ID": "ea460b58f93f44c50993ce1f67e6cee8"
  }
}
```

and a submit profile:

```json
"submit": {
  "production": {
    "android": { "serviceAccountKeyPath": "./google-play-service-account.json", "track": "internal" }
  }
}
```

- `appVersionSource` is already `remote`, so EAS owns `versionCode` and `autoIncrement` bumps it on
  every build. Play rejects an upload whose `versionCode` was used before.
- `version` in `app.config.ts` (`0.1.0`) is the user-visible version name. Bump it per release.
- Add `google-play-service-account.json` to `.gitignore` (step 6.4 creates it).

#### 2.4 Things already in place (check, don't change)

- **Target API:** React Native 0.86 targets **API 36** (Android 16), which is what Play requires
  for new apps and updates from 2026-08-31. Nothing to do.
- **16 KB memory pages:** Play requires native libraries aligned for 16 KB page sizes. RN 0.86 and
  Expo 57 are; after the first upload, check **App bundle explorer** in Play Console for warnings
  from any third-party native library.
- **Location:** foreground permission only, with a foreground service while a run is active
  (D-020). No `ACCESS_BACKGROUND_LOCATION`, which keeps the review much simpler. Keep it that way.
- **`expo-dev-client`** is only included in the `development` profile, so the store build has no
  dev menu.
- **Permission copy** in `app.config.ts` already explains the location use clearly.

#### 2.5 Small things worth doing

- **In-app "testnet" notice.** Every STRIDE amount in the app should sit near "Monad testnet.
  STRIDE has no monetary value." (the same rule as `social/voice.md`). It protects the Financial
  features declaration (5.4).
- **Crash reporting.** There is none today. Play Console's **Android vitals** shows crashes and
  ANRs for free, which is enough to start.
- **Reviewer path (5.1).** Make sure a fresh wallet can sign in, get a starter Sneaker and start a
  run with no other setup, because that's what the reviewer will do.

- [ ] Typecheck, lint and tests pass. The new screens are checked on the Android phone.

### 3. Infrastructure checks

Play users are real strangers, not demo wallets. Before step 7:

1. **Game-server MON budget.** Each new player costs about **0.13 MON** (starter mint + gas drip)
   from the game-server key. 12+ testers and Google's pre-launch robots will sign in. Top it up
   from the faucet, and decide what happens when it runs dry (the outbox should queue, not crash;
   the app should show a clear "try again later" state). Consider a cap on new players per day.
2. **Reown (WalletConnect) project.** In <https://cloud.reown.com>, open the project for
   `EXPO_PUBLIC_REOWN_PROJECT_ID` and add `com.stridemon.app` to its allowed mobile app IDs if the
   project uses an allowlist, so production connections aren't refused.
3. **Hosted API.** `https://api.stridemon.xyz` must stay up during review and testing:
   PM2 restart on reboot (`pm2 startup` + `pm2 save`), certbot auto-renewal, Atlas free tier limits.
4. **Testnet risk.** The whole app depends on Monad testnet. If the testnet resets or changes,
   the app breaks for everyone. Write down what you'd do (redeploy contracts, a forced update).

---

## Part C: Play Console setup

### 4. Store listing

Play Console → **Create app**:

| Field | Value |
|-------|-------|
| App name | `StrideMon` (≤ 30 characters) |
| Default language | English (United States) |
| App or game | **Game** (category: Sports or Casual) or **App** (category: Health & Fitness) |
| Free or paid | **Free** (can't be changed to paid later) |

Then **Grow → Store presence → Main store listing**:

| Asset | Spec | Source |
|-------|------|--------|
| Short description | ≤ 80 characters | e.g. "Walk or run with your Sneaker NFT on Monad testnet and earn STRIDE." |
| Full description | ≤ 4000 characters | Adapt from `README.md` / website copy. Must state testnet and no monetary value. No earning promises (5.4). |
| App icon | 512 × 512 PNG, 32-bit, ≤ 1 MB | Export from the icon source in `apps/mobile/assets/` |
| Feature graphic | 1024 × 500 PNG/JPEG | New: the Sneaker art on the brand background |
| Phone screenshots | 2–8, 16:9 or 9:16, 320–3840 px per side | `website/public/screenshots/` (retake on the new contracts if stale) |
| Video (optional) | YouTube URL | The demo video, once uploaded |
| Contact email | required | The public support email from step 1 |
| Website | optional | `https://stridemon.xyz` |
| Privacy policy | required | `https://stridemon.xyz/privacy` |

Avoid in the listing: "earn money", "passive income", prices, "invest", ranking claims, other
brands (STEPN, MetaMask logos) and the word "whitelist".

### 5. App content (Policy → App content)

Play blocks review until every section here is complete.

#### 5.1 App access

The app is behind a wallet sign-in, so reviewers need instructions. Choose
**"All or some functionality is restricted"** and add:

- Install MetaMask, enable **Monad Testnet (10143)** (exact steps from `docs/device-testing.md`).
- Either: create a new wallet (the game sends test MON automatically), **or** import a dedicated
  reviewer test wallet whose seed phrase you give here. Make it a fresh account used only for
  this, holding nothing but testnet tokens.
- Then: Connect wallet → sign → wait for the starter Sneaker → Start run.

Unclear access instructions are the most common rejection for wallet apps. Be literal.

#### 5.2 Ads

"No, my app does not contain ads."

#### 5.3 Content rating

Fill the IARC questionnaire honestly (no violence, no gambling; mention **user-to-user
transfer of digital items** if asked about digital purchases or exchange). Expect "Everyone" or
"Teen".

#### 5.4 Financial features

This is where the **Blockchain-based content** policy lands. Declare that the app **lets users
earn tokenized digital assets** (STRIDE, an ERC-20, and Sneaker NFTs). Rules that follow:

- Don't promote or glamorize earnings, anywhere in the app or the listing.
- No paid randomized rewards (loot boxes). StrideMon has none.
- The app is **not** a crypto wallet or exchange: it connects to an external wallet over
  WalletConnect and never holds keys, so the "software wallets" licensing rules don't apply.
- The app takes no money, so Google Play Billing isn't needed: repairs and upgrades are paid with
  STRIDE earned in the game, on-chain. **This changes if a marketplace (Phase 9) or any fiat
  purchase is added.** Re-read the Payments and Blockchain-based content policies then.

#### 5.5 Target audience and content

Select **18 and over** only. Crypto apps aimed at minors draw extra scrutiny, and it rules out the
Families policy.

#### 5.6 Data safety

Must match the privacy policy. Expected answers:

| Data type | Collected | Shared | Purpose | Optional? |
|-----------|-----------|--------|---------|-----------|
| Precise location | Yes | No | App functionality, fraud prevention | Required to run |
| User IDs (wallet address) | Yes | Yes (public blockchain) | App functionality, account management | Required |
| App activity (runs: time, distance) | Yes | Yes (settlement on public chain) | App functionality | Required |
| Crash logs / diagnostics | Only if a crash SDK is added | | | |

- Data is **encrypted in transit** (HTTPS): Yes.
- Users can **request deletion**: Yes, with the URL from 2.2.

#### 5.7 Health apps declaration

StrideMon measures walks and runs, so declare it as a **fitness / activity tracking** app. It does
not use Health Connect, so say no to that.

#### 5.8 Foreground service permissions

Because the run keeps tracking with the screen off (`isAndroidForegroundServiceEnabled`), the
manifest has a **location foreground service**. Play asks for:

- The use case: "User-started workout tracking. The service starts when the user taps START and
  stops when they tap STOP."
- A **short video** (YouTube unlisted or Drive link) showing: tap START → the persistent
  notification appears → the screen locks and tracking continues → STOP → the notification
  disappears.

#### 5.9 Other declarations

Government apps: No. News: No. COVID: No. Data deletion questions are covered by 5.6.

---

## Part D: Build, test, release

### 6. First production build and upload

1. Build:

   ```bash
   cd apps/mobile
   eas build --platform android --profile production
   ```

   On the first run, let EAS **generate a new upload keystore** and keep it on EAS servers.
   Back it up: `eas credentials` → Android → production → download the keystore, and store it
   somewhere safe outside the repo.
2. **Play App Signing** is on by default for new apps: Google holds the app signing key and the EAS
   keystore is only the upload key. If the upload key is ever lost, Google can reset it.
3. **The first upload must be manual** (the Play API refuses an app it has never seen): download
   the `.aab` from the EAS build page, then Play Console → **Testing → Internal testing → Create
   new release** → upload it → release notes → **Save and roll out**.
4. For later uploads, set up `eas submit`:
   1. Google Cloud Console → create a project → enable the **Google Play Android Developer API**.
   2. Create a **service account** → Keys → add a JSON key → save it as
      `apps/mobile/google-play-service-account.json` (gitignored).
   3. Play Console → **Users and permissions** → invite the service account's email with
      "Release apps to testing tracks" (and production later).
   4. `eas submit --platform android --profile production --latest`.
5. Add yourself as an internal tester, install from the Play link on the phone, and run the whole
   loop once: sign in, starter Sneaker, a run, settlement, repair, upgrade, transfer, delete account.
6. Read the **Pre-launch report** (Release → Testing → Pre-launch report). Google's robots can't
   sign in with a wallet, so expect them to stop at the welcome screen; look for crashes only.

### 7. Closed test (12 testers × 14 days)

Required for personal accounts created after 2023-11-13.

1. Testing → **Closed testing** → create a track (e.g. "Alpha") → promote the internal build to it.
2. Add testers with an **email list** (their Google account emails) or a Google Group.
3. Send each tester the **opt-in link**. They must: open it, tap "Become a tester", then install
   from the Play Store (not a sideloaded APK).
4. Rules that trip people up:
   - **12 testers must stay opted in for 14 days in a row.** If the count drops below 12, the
     clock resets. Recruit 15–20 for a margin.
   - Google checks that testers **actually use the app**, so ask each one to sign in and do a run
     every few days. Each needs MetaMask with Monad Testnet enabled (send them the reviewer
     instructions from 5.1).
   - Push at least one update during the test (fix whatever testers report). It shows active
     development.
5. Collect feedback (a form or a group chat). The production access application (step 8) asks
   what testers found and what you changed.

- [ ] Play Console → Dashboard shows "12 testers opted in for 14 days" as complete.

### 8. Apply for production access

Dashboard → **Apply for production**. Google asks about the closed test (how you recruited
testers, what feedback came in, what you changed) and whether the app is ready. Answer concretely.
Review takes up to about 7 days; a rejection explains what to fix, then you reapply.

### 9. Production release

1. Testing track → **Promote release → Production** (or upload a new build to Production).
2. **Countries:** start with the ones where you can support users. India alone is fine at first.
3. **Staged rollout:** start at 20%, watch **Android vitals** (crash rate, ANR rate) for a day or
   two, then go to 100%.
4. Submit for review. The first production review usually takes 1–3 days, sometimes longer.
5. When it's live, add the Play link to the website, `README.md` "Try it", and
   `docs/hackathon-submission.md` if it's still relevant.

### 10. After launch

- **Every update:** bump `version` in `app.config.ts`, `eas build --profile production`,
  `eas submit`, release notes, staged rollout. `versionCode` bumps itself.
- **JS-only fixes** can ship faster with EAS Update (OTA), if `expo-updates` is added later. Play
  allows OTA updates of JS as long as they don't change the app's purpose.
- **Target API deadline:** Play raises the required target API every August. Upgrading Expo SDK
  once a year keeps you ahead of it.
- **Policy emails:** Play sends warnings to the account email with a deadline. Read them.
- **Reviews:** reply from Play Console. Users will ask why STRIDE can't be sold; the answer is
  the same line: Monad testnet, no monetary value.
- **Mainnet (Phase 10)** is a different app risk-wise: real value means updating the Financial
  features declaration, the privacy policy, the listing copy, and possibly licensing depending on
  the countries. Redo Part C before switching.

---

## Checklist

- [ ] 1. Developer account paid and verified
- [ ] 2.1 Privacy policy page live (built, D-039; live after the website deploy)
- [ ] 2.2 Account deletion in the app and on the web (built, D-039; needs the API redeploy and a phone check)
- [x] 2.3 `production` build and submit profiles in `eas.json`
- [ ] 2.5 Testnet notice next to STRIDE amounts (done, D-039); reviewer path works from a fresh wallet
- [ ] 3. Game-server funded, Reown checked, API set to survive reboots
- [ ] 4. Store listing complete with icon, feature graphic and screenshots
- [ ] 5. Every App content section complete (including the foreground service video)
- [ ] 6. First `.aab` uploaded manually to Internal testing; full loop checked from the Play install
- [ ] 7. Closed test with 12+ testers for 14 consecutive days
- [ ] 8. Production access granted
- [ ] 9. Production rollout at 100%; Play link on the website and README

## References

- Target API requirements: <https://developer.android.com/google/play/requirements/target-sdk>
- Testing requirements for new personal accounts: <https://support.google.com/googleplay/android-developer/answer/14151465>
- Developer Program Policy (Blockchain-based content, Payments, Foreground services):
  <https://play.google.com/about/developer-content-policy/>
- Foreground service types: <https://developer.android.com/develop/background-work/services/fg-service-types>
- Account deletion requirement: <https://support.google.com/googleplay/android-developer/answer/13327111>
- Data safety form: <https://support.google.com/googleplay/android-developer/answer/10787469>
- Expo: submit to Google Play: <https://docs.expo.dev/submit/android/>
