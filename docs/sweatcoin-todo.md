# TODO: what we can learn from Sweatcoin

Sweatcoin (`sweatco.in`) is the largest walk-and-get-rewards app. It's free and passive: every
step counts without pressing anything, and coins are spent in a rewards catalog. Its scale is out
of our reach (1.8M Google Play ratings, 600+ partners such as the NHS and insurers), and we can't
compete on rewards: STRIDE has no monetary value.

**Our opening:** Sweatcoin is free but you own nothing. STEPN let you own your sneaker but cost
hundreds of dollars to start. StrideMon is in between: **free to start, and the Sneaker is yours.**

Written 2026-10-14. Nothing here is decided yet: each item that changes the product needs a
decision in `decisions.md` first, and building follows the phase rules in `roadmap.md`. Items
already in `phases/phase-10-beyond-hackathon.md` say so, so they aren't planned twice.

## Before early access (planned 2026-11-21)

- [ ] **Invite codes after the first walk.** Sweatcoin grew through friend invites. We already
      planned this as an honest perk (`founding-pass-brief.md` §7, STEPN's mechanic). Never pay
      tokens or money for an invite. Touches the API, the app and `/help`. Needs a decision.
- [ ] **Say the opening line on the landing page.** "Free to start. The Sneaker is yours."
      Keep it to what we do, not what others don't do. Copy lives in `website/src/content/`.
- [ ] **Answer the questions a Sweatcoin user would ask, in `/help`:** "Do I need to buy
      anything?", "Who owns my Sneaker?", "Can the rules change?" The last one must be honest: we
      hold the admin and pause roles, so the rules *can* change, but every change is a public
      transaction anyone can check. Run `bun run help:export-knowledge` afterwards.
- [ ] **Show how to check the rules yourself.** A short "check it on the explorer" note in the
      landing page's Under the hood → contracts tab, linking `SneakerGame` and its config changes.
- [ ] **Decide whether the X accounts may ever name other apps.** `social-plan.md` §5.3 says no
      today ("no claims about other apps"). Yash's call. If yes, change that doc first and keep to
      facts anyone can check.

## After early access

- [ ] **Steps without pressing START.** Sweatcoin's biggest advantage is that it needs no effort.
      Read the day's step count from Health Connect (Android, later HealthKit on iOS) and show it
      on Home. Decide first whether passive steps earn STRIDE (cheating risk) or only feed streaks
      and badges (safer). Needs a decision.
- [ ] **Streaks.** Days in a row with a walk. Cheap to build, and it brings people back.
- [ ] **Badges and achievements.** The Founder badge is already planned. Also in Phase 10
      (Product).
- [ ] **Weekly leaderboards and competitions.** Also in Phase 10 (Product).
- [ ] **Community challenges.** Everyone's distance together toward one goal (for example "walk
      to the Moon together"). Sweatcoin's charity challenges are popular. Start without money or
      a charity partner; add one only after a legal check.
- [ ] **Push notifications** ("Energy full", "Your Sneaker needs repair"). Also in Phase 10.
- [ ] **Sign in without a wallet app.** Sweatcoin's onboarding is one tap; ours needs MetaMask
      and Monad Testnet turned on. Email or social login to an embedded wallet removes our biggest
      drop-off. Also in Phase 10 (Product).
- [ ] **Search pages.** People search "Sweatcoin alternative" and "move to earn without buying
      NFT". Write neutral `/help` answers and landing sections that match those searches without
      naming anyone. Builds on the SEO work (D-051).
- [ ] **Reach their unhappy crypto users.** People who hold SWEAT or used to play STEPN already
      know wallets and NFTs. Reach them through Yash's X posts (`social/`) with the Founding Pass
      and the waitlist, never with earnings. Free channels only.

## Later (mainnet and beyond)

- [ ] **Indoor and treadmill walks.** Sweatcoin doesn't count indoor steps; neither do we (we
      need GPS). A pedometer-based indoor mode could be a real edge, but only after anti-cheat v2
      (pedometer and GPS correlation, Play Integrity: Phase 10). Don't claim it before it works.
- [ ] **More STRIDE sinks than repair and upgrade.** Cosmetics or Sneaker styles, instead of a
      rewards catalog. Part of the Phase 10 tokenomics review.
- [ ] **Partners.** Sweatcoin's real business is insurers, employers and governments paying for
      healthier people. For us: campus or company walking challenges. Only after mainnet and the
      legal review.
- [ ] **Look at Sweatcoin again every few months.** Note what they changed and whether this list
      still holds.

## Never

- Talk about STRIDE's price, yield or "earning" (`social-plan.md` §6).
- Repeat claims about Sweatcoin we haven't verified. Reports say SWEAT fell about 85% and that a
  scam promotion ran inside Sweat Wallet; neither is confirmed.
- Say "the rules can't change". Say "every change is public".
- Show ads, or airdrop anything to SWEAT holders.
- Claim indoor or passive steps count before they do.

## Sources

- [Sweatcoin homepage](https://sweatco.in/)
- [unstar.app: walking apps that pay, ranked (2026)](https://unstar.app/blog/sweatcoin-stepn-winwalk-rewardy-evidation-walking-apps-that-pay-ranked-2026)
- [Trustpilot: Sweatcoin reviews](https://nz.trustpilot.com/review/sweatco.in?page=4)
- [Leamington Courier: critics' warning](https://www.leamingtoncourier.co.uk/news/sweatcoin-app-promises-money-for-exercise-but-critics-fire-warning-713168)
