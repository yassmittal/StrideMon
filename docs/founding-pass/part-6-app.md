# Part 6: App

**Goal:** a founder signs in with the wallet they minted with, gets their Founder Sneaker, runs
in it, and sees their pass. Anyone else knows exactly how to get in.

## Read first

- The brief §7 and §10.4, D-041, Part 3's API
- `docs/architecture/mobile-app.md`, `docs/device-testing.md`, and `CLAUDE.md`'s app notes
  (typed routes need Metro started once, viem errors are matched by name, Monad Testnet must be
  enabled in MetaMask, fonts set a family and never a weight)

## Build

1. **`features/founding-pass/`:**
   - `useFoundingPass` reads the wallet's pass from the chain: its number, founder number, frame
     and laced state, and its image
   - `FoundingPassCard` draws it with `SvgXml`, like `SneakerCard`
2. **The gate screen**, while early access is on and the wallet has no pass and no Sneaker. It
   sits where the minting screen is today.
   - It says "Mint a Founding Pass to get in early", what phase the mint is in, and when the app
     opens to everyone.
   - It has a button to `stridemon.xyz/pass` and a help link.
   - It shows the address that's signed in, with "Minted with another wallet? Sign out and sign in
     with that one." This is the most likely place someone gets stuck.
3. **The Founder Sneaker:** a pass holder without one gets "Minting your Founder Sneaker…", using
   the existing minting screen, then Home shows it with its on-chain art.
4. **Profile** shows the pass: the card, the founder number, laced or not, and a link to its page
   on the website.
5. **Laced:** after the first settled walk, a quiet "Your shoe is laced" moment with a haptic,
   and both pictures update.
6. **Transfer:** a Founder Sneaker's transfer button is disabled, with a plain reason ("Founder
   Sneakers stay with their founder"). Normal Sneakers work as today.
7. **Opening day:** once the gate is off, the gate screen never shows again, and new players get
   a normal Sneaker as today.

## Nobody gets stuck

- A pass minted a moment ago and not seen yet: "Checking for your pass…", then a retry.
- The API can't be reached. The chain is slow.
- The wallet is on the wrong network, or its session is broken (see `CLAUDE.md`: sign out and back
  in).
- Every one of these has a next step and a help link (Part 7).

## Done when

These are checked on the Android phone:
- Mint on the website, sign in to the app with the same wallet, get the Founder Sneaker, walk,
  and see it laced (pass and Sneaker).
- A wallet without a pass sees the gate with a clear way in.
- The Founder Sneaker can't be sent.
- The stuck-point check is done.

Typecheck, lint and tests pass. Mark Part 6 **Done**, then stop.
