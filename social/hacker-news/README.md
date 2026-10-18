# Hacker News

StrideMon's one Show HN, end to end (`docs/waitlist-growth-plan.md` §4.6): the account, the weeks
before, the post, the hours after. Claude drafts here and never posts or logs in. Yash does every
step himself.

## 1. What it is, and what to expect

Hacker News (news.ycombinator.com) is Y Combinator's link board, read by developers and founders.
**Show HN** is its section for "something you've made that other people can play with" [1].

- **A good Show HN brings developers, not sign-ups.** Expect GitHub stars, people reading the code,
  sharp questions, and maybe a writer who covers it later. Few will join a waitlist.
- **HN is sceptical of crypto.** "Move-to-earn" invites "why does this need a blockchain?" That's
  fine: answer honestly and calmly (§5). The most HN-shaped thing here isn't the token, it's
  **1,000 one-of-one pictures drawn by a 68,166-byte contract**.
- **It's one shot, not a channel.** Post it once, do it well, and get back to the rest of the plan.

## 2. The account (today, 2026-10-18)

1. **Create the account:** news.ycombinator.com → login → Create Account. Use a plain username
   (for example `yashmittal`). Add an email in your profile so you can reset the password.
2. **Profile → about:** one line, "Building StrideMon, a walking game on Monad testnet.
   github.com/yassmittal". Links are optional.
3. **Read the rules once:** the guidelines (`/newsguidelines.html`) and the Show HN rules
   (`/showhn.html`).
4. **Take part before posting.** New accounts show their name in green [2]. **Show HNs from new
   accounts are temporarily restricted.** The moderator said "Just new ones for now", and HN's own
   advice is to "become a good contributor, and then it will be fine to post an occasional Show HN"
   [3]. So for the next 2–3 weeks:
   - Spend 10 minutes a day on `/newest` and `/show`.
   - Comment only when you know something real: React Native and Expo on Android, background GPS,
     Solidity and Foundry, Fastify, MongoDB, building alone. One good comment beats five quick ones.
   - Don't mention StrideMon in comments unless it's directly what someone asked about.

## 3. The post (target: Tue 11-10 or Wed 11-11)

**When:** after the Metropolis results (11-03) and 2–3 weeks of taking part, while DeltaV's
amplification runs. Post at 08:00–09:00 US Eastern, which is **18:30–19:30 IST** (US clocks go
back on 1 November). Clear the evening: the first 3–4 hours decide it.

**The link:** `https://stridemon.xyz/pass`, the gallery. Anyone can browse all 1,000 designs, take
the match quiz and open any pass's on-chain picture, with no sign-up. The repo goes in the first
comment.
- **Never link `/waitlist`.** The rules say "Don't post landing pages", and sign-up pages are off
  topic [1].
- No `?source=` on the HN link. Count the visits from Vercel Analytics' referrers instead.

**The title** (pick one; HN titles are plain, with no hype and no exclamation marks):

1. `Show HN: 1,000 one-of-one sneakers drawn by a 68 KB smart contract` (recommended)
2. `Show HN: StrideMon – a walking game where a smart contract draws the sneakers`
3. `Show HN: A walking game on a blockchain testnet, with nothing to buy`

**Submit:** news.ycombinator.com/submit, with the title and the URL. Leave the text box empty.
HN's FAQ says to submit the link and then add your words as a normal comment [2]. **Post the first
comment straight away:**

> Hi HN, I'm Yash. I built StrideMon on my own over the past few weeks: a walking game on Monad
> testnet. You walk with a Sneaker NFT, the walk settles on-chain, and you spend the reward
> (STRIDE) to repair and level the Sneaker up. Nothing is for sale. STRIDE is a testnet token with
> no monetary value, and the 1,000 Founding Passes are free and can't be sent or sold.
>
> The link is the part I think is most interesting here: 1,000 one-of-one passes, and no image
> files. Each design is 8 bytes in a table, and a renderer contract turns those 8 bytes into an
> SVG whenever you ask for the token's picture.
>
> A TypeScript generator picked the 1,000 designs from the art data (templates, colourways, laces)
> and precomputed the geometry, so Solidity needs no trigonometry. The whole renderer, drawing code
> and art data together, is 68,166 bytes. That fits in one contract only because Monad allows
> 128 KB, where Ethereum's limit is 24 KB.
>
> The game: an Expo / React Native app tracks the walk with GPS. A Fastify + MongoDB API checks each
> run: a minute counts only at 1–20 km/h on average, and GPS jumps over 40 km/h are dropped. It then
> settles the run on Monad through a transaction queue, so the player never pays gas. Raw GPS
> never goes on-chain, and it's deleted after 30 days.
>
> Code (MIT): https://github.com/yassmittal/StrideMon. The renderer is
> packages/contracts/src/FoundingPassArtRenderer.sol.
>
> I'd like feedback on the renderer's approach, and on whether a walking game's loop holds up
> without money in it. The Android app is a demo build; there's no iOS yet.

## 4. The hours after

- **Answer every comment** in the first 3–4 hours. Keep it short and factual, thank people who find
  a problem, and say when you've fixed it. Never argue, and never edit the title.
- **Never ask anyone to upvote or comment,** in DMs, WhatsApp or Telegram groups, or on X. HN says
  "Please don't ask friends to upvote or comment" and penalises or bans posts and accounts that do
  [1][2]. Don't post the HN link anywhere asking for votes. Never use a second account.
- **If it sinks, that's normal.** Most Show HNs do.
  - Don't delete it and repost.
  - The FAQ allows "a small number of reposts" of a story that got no real attention [2]. Wait a
    week or two, then try once more with another title.
  - Or email hn@ycombinator.com once, politely, to ask whether it could get a second look [2].
- **Write it up** in `social/reviews.md`: points, comments, visits (Vercel Analytics referrers),
  GitHub stars, and anything people said that should change the product.

## 5. Answers to have ready

Short, true, in Yash's words. Change them if the facts change.

| Asked | Answer |
|---|---|
| Why does this need a blockchain? | A walking game doesn't need one to be fun. The chain adds two things. The Sneaker is yours: it lives in your wallet, any wallet can hold it, and its stats go with it. And the rules are in a contract anyone can read, where any change to them is a public event (`GameConfigUpdated`). |
| Isn't move-to-earn a Ponzi? | Money is what broke those games, so there's none here. STRIDE is a testnet token with no monetary value, nothing is for sale, and the passes are free and can't be sent or sold. I wanted to see whether the loop (walk, repair, upgrade) is fun without it. |
| What stops someone driving, or faking GPS? | The API checks every run before it settles: a minute counts only at 1–20 km/h on average, and GPS jumps over 40 km/h are dropped. It isn't cheat-proof. A spoofed walk at 5 km/h would pass. The rewards have no monetary value, so the stakes are low. |
| Can you change the art later? | The 1,000 designs are frozen. The pass contract's admin can point it at a new renderer, and that's a public event. I don't plan to: the point is that the picture is drawn by the chain. |
| Why Monad? | The game server pays every player's gas, so cheap transactions matter, and the 128 KB contract limit lets the whole renderer live in one contract. It's also Monad's Metropolis hackathon. |
| Why testnet? | It's a hackathon build. Nothing here should cost anyone money. |
| What's the stack? | Expo / React Native (Android), Fastify 5 on Bun with MongoDB, viem, Solidity with Foundry. Every chain transaction goes through a queue that retries it and never sends the same one twice. |
| iOS? | Android first. iOS needs a paid developer account and a borrowed iPhone, so later. |
| What do you store about me? | For a walk: your wallet address and the GPS points, which stay off-chain and are deleted after 30 days. For the waitlist: your email. The privacy page is stridemon.xyz/privacy. |
| Why is there a waitlist? | Minting opens on 28 November. The gallery is open now, and the waitlist just gets one email when minting opens. |

## Sources

Read 2026-10-18.
[1] [Show HN rules](https://news.ycombinator.com/showhn.html) ·
[2] [HN FAQ](https://news.ycombinator.com/newsfaq.html) ·
[3] [Ask HN: Please restrict new accounts from posting (dang's replies)](https://news.ycombinator.com/item?id=47300329), [HN: Show HN limits](https://news.ycombinator.com/showlim)
