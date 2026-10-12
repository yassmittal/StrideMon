---
status: draft
account: yash_mittal_dev
slot: 2026-10-14 16:00 UTC   # proposed: the day after 1 of 3 (the GPS checks)
format: thread
pillar: build-story
media:
  - post: 1
    path: social/media/2026-10-14-sent-once.png   # bash social/posters/render-poster.sh social/posters/2026-10-14-sent-once.html
    alt: "A pale poster. Small caps: STRIDEMON • BUILD NOTES, 02 / 03. Headline: Sent once. Even after a crash. Below: How the server sends your run to Monad testnet. A dark panel compares two orders. THE USUAL WAY: 1 Send, then a red cross for a crash, then 2 Save. Caption: Crash in between, and the server wakes up thinking it never sent anything. So it sends it again. WHAT STRIDEMON DOES, in lime: 1 Sign, 2 Save, 3 Send. Caption: Crash anywhere, and it resends the exact transaction it saved. The chain only accepts it once. Footer: MONAD TESTNET, STRIDEMON.XYZ."
link_reply: https://github.com/yassmittal/StrideMon/blob/main/docs/decisions.md
sources:
  - social/posts/2026-10-08-launch-quote-yash.md (the promise)
  - docs/decisions.md D-012 (every game-server transaction goes through the outbox; the run's id is checked on-chain as a second guard)
  - docs/decisions.md D-019 (sign, save, then broadcast; after a crash, re-broadcast the saved bytes; the contract guards the mint and the settlement but not the gas drip)
approved: ""
x_url: ""
results: {}
---

<!-- 2 of 3. Casual builder's voice. It names STRIDE but shows no amount, so no disclaimer.

     This covers the same ground as the @stridemon outbox deep-dive in ideas.md. If both go out,
     @stridemon's should quote this one rather than repeat it (README: the accounts never post
     the same text). -->

## Post 1

Hard part 2 of building @stridemon: sending transactions.

When you finish a run, my server sends a transaction on Monad testnet to record it and send your STRIDE. If the server crashes halfway, I don't want that run paid twice. Or not at all.

## Post 2

The normal way is: send it, then save that you sent it.

But if the server dies right between those two steps, it wakes up thinking it never sent anything. So it sends it again.

## Post 3

So I flipped it. The server signs the transaction first, saves it, and only then sends it.

If it crashes, it resends that exact saved transaction. The chain will only ever accept it once.

## Post 4

The contract also refuses to settle the same run twice, as a backup.

But the bit of gas I send new players has no backup like that. That's where the order really matters.

## Post 5 (last)

Last one next: the Sneaker's picture, which a contract draws.

The longer write-up, if you like this stuff (D-012 and D-019): https://github.com/yassmittal/StrideMon/blob/main/docs/decisions.md
