---
status: draft
account: stridemon
slot: 2026-10-23 15:00 UTC   # proposed: the day after the live check (referral Part 3). Move it to that day
format: thread           # two posts: @stridemon has no Premium, so 280 characters each (262 and 218)
pillar: proof
media:
  - path: ""             # optional: a phone screenshot of the live joined card (invite link and share row), taken after the live check
    alt: "The StrideMon waitlist's card after joining: You're on the list, the email, the window opening Sat 28 Nov, then Your invite link with Copy, and buttons for WhatsApp, Telegram, Post on X and More. Under them: Bring 3 friends who confirm their email, and your window opens Sat 28 Nov, 7:00 pm, an hour early. At most 250 passes go in that hour."
link_reply: https://stridemon.xyz/waitlist?source=x-stridemon
sources:
  - docs/decisions.md D-056 (invite links; a friend counts once they confirm their email; no ranking; the promise)
  - docs/decisions.md D-057 (Continue with Google)
  - docs/decisions.md D-058 (the early hour: Sat 2026-11-28, 19:00 to 20:00 IST, at most 250 passes; nobody's 48 hours change)
  - website/src/content/waitlist.ts (the card's words, /waitlist/invites)
approved: ""
x_url: ""
results: {}
---

<!-- Why this post: the invite loop is the plan's first engine (waitlist-growth-plan.md §4.1), and
     it only works if people know their link exists. One idea: bring 3 friends, mint an hour
     early. The numbers (3, 19:00, 250) are the whole pitch; no "don't miss out" (voice.md §3).

     Words: invite, confirmed friends, the early hour. Never whitelist, WL, allowlist, points or
     rank. No STRIDE amount, so no disclaimer.

     Before posting:
- [ ] The live check in deployment.md §14.2 passed (Google from Chrome, email from Instagram's browser, a code, 1 of 3)
- [ ] Open the link on a phone: it lands on the waitlist form
- [ ] If you add the screenshot, check the crop in the composer
- [ ] Stay for the first hour and answer every reply (answers below) -->

## Post 1

The StrideMon waitlist has invite links now.

Bring 3 friends who join through yours and confirm their email, and your waitlist window opens an hour early: Sat 28 Nov, 19:00 IST instead of 20:00.

At most 250 passes go in that hour. The rest wait for the window.

## Post 2 (reply to Post 1)

Nobody's 48 hours change, and there's no ranking. Just the early hour.

Your link shows after you join. Lost it? It's at stridemon.xyz/waitlist/invites.

Joining takes an email, or one tap with Google.

https://stridemon.xyz/waitlist?source=x-stridemon

## Replies to expect

| Asked | Answer |
|---|---|
| "My friend joined but doesn't count." | They count once they confirm their email: the code on the card after joining, or Google, or stridemon.xyz/waitlist/invites. |
| "Is it a whitelist?" | It's a waitlist. It gets the first 48 hours, and people with 3 confirmed friends get the hour before. There's still nothing to buy. |
| "Do I get a pass for sure?" | No. There are 1,000, first come, first served, and at most 250 in the early hour. |
| "Is there a prize for the most invites?" | No ranking and no prize. Just the early hour. |
| "Google doesn't work." | Inside Instagram's or another app's browser it can't. Use your email, or open the page in Chrome or Safari. |
| "Airdrop?" / "Wen token?" | No. STRIDE is a testnet game token with no monetary value, and there's no sale or airdrop. The game is the point. |
