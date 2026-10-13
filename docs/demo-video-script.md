# Demo video script (Metropolis submission)

The ≤ 3-minute submission video (`hackathon-submission.md` §1), recorded in Recordly: one phone
reel plays in QuickTime on the left, Chrome on the right, and Yash's face in a webcam bubble at
the bottom right. Target length is about 2:35.

## The reel

`website/media-source/submission-reel.mp4` (gitignored): 1:14, silent, 720 × 1560, built by
`cd website && bash scripts/cut-submission-reel.sh`. The script has every cut point. It joins
the two raw recordings in story order, crops the status bar, plays the walk at 16×, and cuts
MetaMask's splash and promo screens. Each step ends on a held frame, which is where to pause.
Every step is a QuickTime chapter (View → Show Chapters, or the chapter menu in the playback
bar), so a retake can jump straight to its step.

| Reel | Chapter | Shows | Source |
|---|---|---|---|
| 0:00 | Sign in | Welcome, Connect wallet, "Prove it's yours", MetaMask "Sign-in request" on Monad Testnet | `recording.mp4` |
| 0:06 | Starter Sneaker | "Minting your Sneaker…", Sneaker #3 at energy 10 / 10, then Profile with **0.1 MON** (the gas drip). Pause on Profile | `recording.mp4` |
| 0:14 | Walk | START, the location screen, then a 2:34 walk at 16×: 0 → 168 m, +0 → +10 STRIDE | `recording.mp4` |
| 0:26 | STOP and settle | "Finish this run?" → "Settling on Monad…" → **+10 STRIDE**, RUN SETTLED. Pause on +10 | `recording.mp4` |
| 0:35 | Repair | Sneaker tab → "Repair your Sneaker?" 99 → 100 for 0.7 STRIDE → MetaMask "Transaction request" (Monad Testnet, 0.013 MON) → Confirm → "Sneaker repaired" | `recording.mp4` |
| 0:43 | Repair on MonadVision | The repair transaction: Success, Repair, 0.7 STRIDE burned | `recording.mp4` |
| 0:48 | Send to wallet B | "Send Sneaker #1" (level 1, efficiency 10, durability 99/100) → review → MetaMask "Sending", Account 1 → Account 2 → Confirm → "Sneaker #1 sent" | `video3.mp4` |
| 1:01 | Wallet B has it | B signs in; Home has `#2` and `#1`; #1 is still durability 99/100 | `video3.mp4` |
| 1:09 | On-chain art | MonadVision's NFT page drawing the Sneaker's SVG | `recording.mp4` |

Sneaker #3 runs through the whole story except the transfer, which is the only one recorded
(Sneaker #1, from the day before). Both recordings were made on the D-038 contracts, before the
D-042 redeploy. The browser tabs below are the live contracts' transactions from `README.md`, so
say "here's a settlement on the live contracts", never "here's the transaction from that run".

## Browser tabs (open in this order)

1. <https://stridemon.xyz>
2. Starter mint: <https://testnet.monadvision.com/tx/0x687d318166c71e8839c062bb574eb95b29bee1335c7ec0302ee019959573247e>
3. Settlement, 2-minute walk, +10 STRIDE: <https://testnet.monadvision.com/tx/0xd7123519bb9349e44bb443f157ff34382355bd4b6c121d5dbdf122beb8c8a6c8>
4. Upgrade to level 2: <https://testnet.monadvision.com/tx/0xd6e61081c0c6939e63770b03712d49334dda4a439a0f143468ce9ff7fe744642>
5. `SneakerNft`: <https://testnet.monadvision.com/address/0x6BE031Ff15F944c226832b6D0B99C03662b29337>
6. <https://github.com/yassmittal/StrideMon>

## Script

Speak in a normal voice, not a pitch voice. The lines are a guide; say them your way. Play the
reel and pause it at each step's held frame while you talk over it or switch tabs.

**0:00–0:12. On camera (make the bubble large, or full frame).** Tab 1 behind you.
> Hi, I'm Yash. This is StrideMon, a move-to-earn game on Monad. Your Sneaker is an NFT. You walk
> with it to earn STRIDE, then spend STRIDE to repair it and level it up. Everything here is on
> Monad testnet.

On-screen text: **Monad testnet. STRIDE has no monetary value.**

**0:12–0:25. Sign in.** Reel chapter 1.
> First, Connect Wallet and sign in. MetaMask on Monad testnet signs a message to prove the wallet is
> yours. It's free, and no transaction is sent.

**0:25–0:45. Starter Sneaker.** Reel chapter 2, pause on Profile. Then tab 2.

1. > New players don't buy anything. The game mints a free starter Sneaker and sends a little
> testnet MON for gas: that's the 0.1 MON here.

2. > This is a starter NFT. The NFT's level, durability and energy live in the contract, not in our database.

**0:45–1:05. Walk.** Reel chapter 3.
> Then you go for a walk. The app tracks GPS. 
> Each active minute uses one energy point and earns STRIDE.
> This Sneaker earns five STRIDEs a minute.

**1:05–1:25. STOP and settle.** Reel chapter 4, pause on +10. Then tab 3.

> When I stop, the server checks my GPS and settles the run to Monad.
> A few seconds later, I received my reward: 10 STRIDE.
> You can see it on the live contracts. STRIDE is added, and my Sneaker loses one durability point.

**1:25–1:55. Repair.** Reel chapters 5 and 6. Then tab 4.

> Every run reduces the Sneaker's durability, so I repair it.
> I also spent 50 STRIDE to upgrade my Sneaker to level 2. Now, it earns more STRIDE every minute.

**1:55–2:15. Transfer.** Reel chapters 7 and 8.

> The Sneaker is a normal ERC-721, so I can send it to another wallet.

> Wallet B now has it, with the same level and durability, because the stats live on-chain with the token.

**2:15–2:25. On-chain art.** Reel chapter 9. Then tab 5.
> Even the picture is on-chain. A contract draws the Sneaker as an SVG, so the explorer shows it
> with no image server.

**2:25–2:40. On camera.** Tab 1 or 6 behind you.
> Monad makes this possible. Each run is confirmed in seconds
> Thanks for watching!

## After recording

- Export at 1080p, upload to YouTube as Public, and fix the auto-captions (Monad, StrideMon,
  STRIDE).
- Paste the link into `README.md` (`TODO(submission)`) and the dashboard.
