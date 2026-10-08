# Part 5: Website, the mint

**Goal:** a visitor goes from "I want #0137" to holding it in about a minute, on a phone or a
laptop, and always knows what to do next.

## Read first

- The brief §5.3, §6, §8, §9 and §10.3, D-041, Part 3's error codes
- `website/README.md`, `website/AGENTS.md`, D-035 (speed targets)
- `CLAUDE.md`'s wallet notes. The app's MetaMask problems show up on the web too: Monad Testnet
  has to be enabled, and the wallet stack has pinned versions.

## Build

1. **The wallet**, on `/pass` only. Reown AppKit for web, wagmi and viem, with the existing Reown
   project id, loaded only when someone taps "Get ready" or "Mint", so the gallery stays fast.
   Sign in with the same SIWE flow as the app.
2. **The network step:** if the wallet isn't on Monad Testnet, add it or switch to it in one tap.
   If the wallet can't, explain how in plain words and link the help guide.
3. **"Get ready"** at the top of `/pass`: verify the email (Turnstile, then a 6-digit code) and
   connect the wallet ahead of time. Afterwards, one tap on a pass mints it.
4. **The mint:**
   - pick a design, pass Turnstile, mint
   - a calm pending state, then the **reveal**: the card turns, the founder number counts up,
     and the gold frame shows if it rolled
   - link the transaction on MonadVision
5. **The schedule:**
   - **Waitlist window:** someone whose email isn't on the waitlist sees when the open mint
     starts and can set a reminder or keep picking favourites. Never a dead "not allowed".
   - **Open mint:** anyone can mint.
   - **All minted:** the page says so and points to the app's opening.
6. **After the reveal:**
   - **"Post on X"**: the pass page with `?source=x-share`
   - **"Get the app"**: the APK link or the store
   - a line naming the wallet, for example "Sign in to the app with this same wallet:
     0x3f…a1", so nobody runs with the wrong account
7. **Already a founder:** if the email or wallet already has a pass, show that pass and the next
   step (get the app). Never just an error.
8. **The privacy page** (`website/src/content/legal/`): it names Brevo and Turnstile, and says
   the site now collects a wallet address for minting.

## Nobody gets stuck

Every Part 3 error code, plus every wallet and network failure, gets a plain message, a next step
and a help link. At least these:
- the code didn't arrive (resend after a minute, check spam)
- the wrong code, or too many tries
- the wallet refused to sign
- the wrong network
- the design was just taken (3 similar to mint with a tap)
- not on the waitlist during the window
- already has a pass
- rate limited
- the API is down or the mint is slow

## Test safely

Test against a local Anvil chain, with its own deployment that never touches
`deployments/10143.json`, and the local API. Or test against the hosted API once Yash has
deployed it. **Never** run the local API against testnet.

## Done when

- A full mint works on a phone browser (MetaMask's own browser, or WalletConnect) and on a laptop
  extension.
- A race for the same design is handled.
- Every error above has been seen once, and the stuck-point check is done.
- Lighthouse on `/pass` stays ≥ 90 on mobile.
- Screenshots are taken.

Mark Part 5 **Done**, then stop.
