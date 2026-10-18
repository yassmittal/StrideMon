# LinkedIn

StrideMon on Yash's own LinkedIn (`docs/waitlist-growth-plan.md` §4.6). Until 2026-10-18 he had
never mentioned it there. The rules in `../voice.md` apply, with the LinkedIn differences below.
Claude drafts here and never posts or logs in. Yash edits and posts.

## 1. Why LinkedIn, and what to expect

His network is developers, students, recruiters and founders, many of them in India. They don't
follow crypto Twitter, but they do read "one developer built and shipped a whole product". That
story is true here, so tell it, and keep the token talk low.

- Expect a smaller crowd than X, but closer: people he actually knows. Many sign-ups will come from
  personal messages after a post, not from the post itself.
- **An external link in the post costs reach.** In a 1.3M-post study, one link in the body cut
  median reach by about 19% [1]. The goal here is sign-ups, not reach. So the waitlist link goes
  at the **end** of posts that ask for it, and posts that only tell the story carry none.
- **What does well** (vendor sources, so roughly): comments, people reading the whole post,
  native video, and PDF "document" carousels [1].

## 2. The profile, before the first post

- **Headline:**

  > Building StrideMon (stridemon.xyz), a walking game on Monad · Full-stack and Web3 developer

- **About** (the first lines):

  > I'm building StrideMon on my own: a walking game on Monad testnet. You own a Sneaker NFT, walk
  > or run to earn STRIDE, and spend it to repair and level the Sneaker up. I built the Android
  > app, the API, the smart contracts and the website, and the code is public:
  > github.com/yassmittal/StrideMon. Monad testnet. STRIDE has no monetary value.

- **Experience:** Founder and developer, StrideMon, Sep 2026 – Present.
  - An Android app (Expo, React Native) that tracks walks and runs with GPS.
  - An API (Fastify, MongoDB) that checks every run and settles it on Monad testnet.
  - Six verified smart contracts (Solidity, Foundry), and 1,000 Founding Pass designs drawn by a
    contract.
- **Featured:**
  - the waitlist (`https://stridemon.xyz/waitlist?source=linkedin`);
  - the GitHub repo;
  - post #1, once it's up.
- **Banner** (1584 × 396). The left side stays empty for the profile photo:

  ```bash
  rsvg-convert -w 300 -h 300 website/public/sneaker-art/sneaker-0002-level-02.svg -o /tmp/art300.png
  ffmpeg -y -f lavfi -i color=c=black:s=1584x396 -i /tmp/art300.png -filter_complex \
    "[0][1]overlay=1224:48,\
  drawtext=fontfile=apps/mobile/assets/fonts/Satoshi-Regular.ttf:text='Building StrideMon':fontcolor=white:fontsize=64:x=520:y=120,\
  drawtext=fontfile=apps/mobile/assets/fonts/Satoshi-Regular.ttf:text='A walking game on Monad testnet':fontcolor=0xCCCCCC:fontsize=30:x=524:y=206,\
  drawtext=fontfile=apps/mobile/assets/fonts/Satoshi-Medium.ttf:text='STRIDEMON.XYZ':fontcolor=0x999999:fontsize=22:x=524:y=262" \
    -frames:v 1 social/media/linkedin-banner-1584x396.png
  ```

- Keep his own photo. It's his profile, not the product's. A StrideMon company page can wait:
  pages get little reach on their own.

## 3. The rhythm

- **Two posts a week**, Tuesday and Friday, around 08:30–09:30 IST. Stay for the first hour and
  answer every comment.
- **15 minutes a day of real comments** on other people's posts: Indian developers, Monad builders,
  people shipping side projects.
- **After each post, message 5–10 people one by one** who'd care, with the post's link. This is
  where sign-ups come from.

**What differs from X:**
- Posts can be longer (aim for 120–250 words).
- At most 3 hashtags, and none is fine.
- Tag Monad's page only on the Metropolis posts.
- Same banned words, and the same "Monad testnet. STRIDE has no monetary value." line whenever STRIDE
  comes up.

## 4. Posts

Each post gets `?source=linkedin` on any site link. Facts come from `CLAUDE.md`,
`launch-video/FACTS.md` and the decisions. Check any number against them before posting.

### #1 The first mention (Tue 10-20). Attach the 30-second demo video, the version with licensed music

> For the past few weeks I've been building something on my own, and I haven't posted about it
> here until now.
>
> It's called StrideMon: a walking game on Monad testnet. You own a Sneaker, you walk or run, and
> when you stop, your reward settles on-chain. You spend it to repair the Sneaker and level it up,
> and each level earns more.
>
> What I built, end to end:
> → an Android app (Expo, React Native) that tracks a walk with GPS
> → an API (Fastify, MongoDB) that checks every run, so a minute only counts at walking or running
> speed, not in a car
> → six smart contracts on Monad testnet, verified, that hold the rules
> → a game server that pays the gas, so a new player needs a wallet but no tokens to start
>
> On 14 October I submitted it to Monad's Metropolis hackathon.
>
> Next: on 28 November, 1,000 free Founding Passes open, each a one-of-one Sneaker design drawn by
> a smart contract. People on the waitlist mint first.
>
> The code is public: github.com/yassmittal/StrideMon
> The waitlist: https://stridemon.xyz/waitlist?source=linkedin
>
> Monad testnet. STRIDE has no monetary value.

(The arrows are the one exception to `voice.md`'s "no emoji" rule. Plain hyphens are fine too.)

### #2 How the art works (Fri 10-23). A 6-slide PDF carousel (Claude can render it), or one pass image

> Every Founding Pass in StrideMon is drawn by a smart contract. There's no image file anywhere.
> Ask the contract for pass #0137 and it writes the picture, an SVG, on the spot.
>
> Some numbers:
> → 1,000 designs, all different, and final
> → each design is 8 bytes in a table inside the contract
> → the whole renderer, the drawing code and the art data together, is 68,166 bytes
>
> That last one matters. Ethereum caps a contract at 24 KB, so the art would have to be split
> across several contracts. Monad allows 128 KB, so it fits in one.
>
> The passes are free, and they can't be sent or sold. They're early access to the game.
>
> Browse all 1,000: https://stridemon.xyz/pass?source=linkedin

### #3 What building alone taught me (Tue 10-27). No link

> Five things I learned shipping a whole product alone in a few weeks:
>
> 1. Test on a real phone from day one. GPS, background tracking and wallets behave differently on
> a device than in a simulator, and every phase here ended with a check on my Android phone.
> 2. Write the decision down before the code. Every choice in StrideMon has a numbered note with
> why and what it costs. When I forget why something works the way it does, the note remembers.
> 3. Treat every blockchain transaction as something that can stall. Each one goes into a queue
> that retries it and never sends the same one twice. Nothing gets lost when the network is slow.
> 4. Build in small parts, and finish each one. A half-built feature costs more than a missing one.
> 5. The boring parts take the longest: the privacy policy, account deletion, error messages that
> say what to do next.
>
> If you're building something on your own too, I'd like to see it.

### #4 Invites are live (when referral Part 3 ships). Drafted then, with the live numbers

Skeleton: the waitlist now has invite links, and 3 friends who confirm mean minting an hour early.
It's still free, there's still nothing to buy, and most of the 1,000 passes stay for the window.
Add the link, and one real number (sign-ups so far).

### #5 Metropolis results (11-03). Both versions are written before the day

**If it places:**

> StrideMon placed in Monad's Metropolis hackathon (<track and place>). Thank you to the judges and
> to everyone who walked with a test build. What's next: early access on 21 November, and the
> Founding Pass on 28 November. https://stridemon.xyz/pass?source=linkedin

**If it doesn't:**

> Metropolis results are out, and StrideMon didn't place. Congratulations to the winners: <one or
> two, by name, with what you liked>. Nothing changes on my side. Early access starts on 21
> November, and 1,000 free Founding Passes open on 28 November. https://stridemon.xyz/pass?source=linkedin

### #6 One week left (Sat 11-21, early access day)

Skeleton:
- what early access is (the game starts over, for founders);
- the window's date and time in IST;
- how to get ready (the waitlist email, a wallet);
- the link.

## 5. Never

- Turn it into a crypto pitch: no price, value, "early" money talk or token hype (`voice.md` §3).
- Ask for likes, or join engagement pods.
- Post the same text as X. Rewrite it for this crowd.
- Name a number that isn't checked. "N users" needs the real count from `social/reviews.md`.

## Sources

[1] [Agility PR: LinkedIn's link tax (Richard van der Blom's study of 1.3M posts)](https://www.agilitypr.com/pr-news/social-media-influencer-marketing/the-linkedin-link-tax-why-sharing-your-blog-is-costing-you-60-percent-of-your-audience/),
[Dataslayer: LinkedIn in 2026](https://dataslayer.ai/blog/linkedin-algorithm-february-2026-whats-working-now) (vendor). Read 2026-10-18.
