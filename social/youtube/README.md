# YouTube

StrideMon's YouTube channel: Yash's existing channel, renamed (`docs/waitlist-growth-plan.md`
§4.4). The rules in `../voice.md` apply. Claude drafts here and never uploads, logs in or calls
YouTube's API. Yash does every step in YouTube himself.

## 1. The verdict (2026-10-18)

**Yes, make it StrideMon's channel**, with three changes to the idea.

**What the channel is today** (read from its public page on 2026-10-18):
- "Yash Mittal", 359 subscribers, 65 videos, described as "amazing facts by Yash".
- Most videos are personal clips from 2018–2023: family, jokes, facts.
- Two are StrideMon (the Metropolis demo and pitch, 10-14), with 17 and 26 views. Two are Yash's
  other builds (Me As Agent, Proof Of Agent).

**What renaming keeps:**
- the channel's age and its 359 subscribers (a channel page that says 359 looks better than 0);
- the two StrideMon videos already up;
- one place for every StrideMon video from now on.

**What it doesn't bring:** an audience. The subscribers came for old personal videos, and the
StrideMon videos show they aren't watching. YouTube ranks each video on how viewers respond to it,
not on how many subscribers a channel has [3]. So unengaged subscribers cost little, and they help
little.

**The three changes:**
1. **Private, not deleted.** Deleting a video loses its views and history for good, and private
   can be undone [2]. Nothing is gained by deleting. A few of the old titles shouldn't be public
   under a product's name, so hide them before anything else.
2. **Move it to a Brand Account first (recommended).**
   - StrideMon's channel then isn't tied to Yash's personal Google identity: his comments elsewhere
     on YouTube don't show up as "StrideMon".
   - He can add a manager or editor later.
   - It can be handed over if StrideMon ever becomes a company.
3. **Claim `@stridemon` now.** It was free on 2026-10-18. Handles are first come, first served.

**Why not a new channel instead?** It would start at 0 for the same audience (none). It would also
mean two channels to keep alive, for someone who is also posting on X, Instagram and LinkedIn every
day.

## 2. Set it up (Yash, about an hour, in this order)

1. **Hide the old videos.** YouTube Studio → Content:
   - Tick every personal video → Edit → Visibility → **Private** → Update. Check the Shorts and
     Live tabs too.
   - Set Me As Agent and Proof Of Agent to **Unlisted**. Their links keep working for a portfolio,
     but they're off the channel.
   - Delete or hide old playlists.
2. **Brand Account** (optional, recommended). Open `youtube.com/account_advanced`.
   - If it offers "Move channel to a Brand Account", the channel is on the personal Google account.
     Follow YouTube Help's "Move your channel to a Brand Account": menus move, so the help page has
     today's steps.
   - If it doesn't offer it, the channel is already on one.
   - If the move looks risky or confusing, skip it: it can be done later.
3. **Name and handle.**
   - Studio → Customisation → Basic info: name **StrideMon**, handle **`@stridemon`**.
   - A handle can change twice in 14 days, and the old one (`@yash_mittal_dev`) is held for 14 days
     in case you switch back, then released [1].
   - If you'll want `@yash_mittal_dev` for a personal channel later, claim it on a new channel when
     the 14 days end.
4. **Picture and banner.** From the repo root (the files land in the gitignored `social/media/`):

   ```bash
   rsvg-convert -w 800 -h 800 website/src/app/icon.svg -o social/media/youtube-avatar-800.png

   rsvg-convert -w 370 -h 370 website/public/sneaker-art/sneaker-0002-level-02.svg -o /tmp/art370.png
   ffmpeg -y -f lavfi -i color=c=black:s=2560x1440 -i /tmp/art370.png -filter_complex \
     "[0][1]overlay=1633:535,\
   drawtext=fontfile=apps/mobile/assets/fonts/Satoshi-Regular.ttf:text='Walk. Earn. Upgrade.':fontcolor=white:fontsize=104:x=560:y=628,\
   drawtext=fontfile=apps/mobile/assets/fonts/Satoshi-Medium.ttf:text='STRIDEMON  •  MONAD TESTNET  •  WAITLIST\: STRIDEMON.XYZ':fontcolor=0x999999:fontsize=30:x=566:y=778" \
     -frames:v 1 social/media/youtube-banner-2560x1440.png
   ```

   - The picture is the site's mark. The circle crop hides its rounded corners.
   - The banner is 2560 × 1440. Everything sits inside the centre 1546 × 423, the part every device
     shows.
   - Check both on a phone and on a laptop after uploading.
5. **Description** (Customisation → Basic info):

   > StrideMon is a walking game on Monad testnet. Own a Sneaker NFT, walk to earn STRIDE, and
   > spend it to repair and level the Sneaker up. Built by one developer, Yash Mittal, in the open.
   >
   > Here: how it's built, how the 1,000 Founding Passes are drawn by a smart contract, and how to
   > mint one free on 28 November.
   >
   > Monad testnet. STRIDE has no monetary value.

6. **Links** (Basic info → Links). The first one shows beside the description:
   - Join the waitlist: `https://stridemon.xyz/waitlist?source=yt-channel`
   - The 1,000 Founding Passes: `https://stridemon.xyz/pass?source=yt-channel`
   - X: `https://x.com/stridemon`
   - GitHub: `https://github.com/yassmittal/StrideMon`
7. **Upload defaults** (Studio → Settings → Upload defaults):
   - category Gaming;
   - language English;
   - a description that ends with the waitlist link and "Monad testnet. STRIDE has no monetary
     value."
8. **Channel trailer** for people who don't subscribe yet (Customisation → Layout): the Metropolis
   demo for now, and the build-story video from W2.
9. **Playlists:** "How it's built", "Founding Pass", "Shorts".

## 3. What to post, 10-19 to 11-28

**A Short every day: the same 9:16 cut as that day's Reel** (`docs/waitlist-growth-plan.md` §4.6).
- One idea in the first second, and captions on screen (most people watch muted).
- Under 60 seconds.
- Shorts can't carry a clickable link: their descriptions and comments stopped being clickable on
  2023-08-31 [4]. So say it out loud or on screen: "The waitlist link is on the channel page."
- In week 1, try three in Hinglish and three in English, and keep making whichever does better.
  Most of the audience is in India.

**One long video a week** (titles are drafts):

| Week | Video | Why |
|---|---|---|
| W2 (10-26) | "I built a walking game on Monad by myself: here's how it works" | The build story: the loop, the stack, the phone, what broke |
| W3 (11-02) | "A smart contract draws 1,000 one-of-one sneakers" | The art renderer, and how no two passes are the same |
| W4 (11-09) | "How to mint your free Founding Pass on 28 November" | Step by step: the waitlist email, the email check, the wallet, the mint. Pin it, and link it from the waitlist page's help |
| W5 (11-16) | "Early access starts: the game starts over" | 11-21, what founders get |
| W6 (11-28) | Live: mint night, 18:45–21:00 IST (optional) | The early hour at 19:00, the window at 20:00. Answer questions live |

**Every long video's description:**
- the first line says what it is;
- then the waitlist link with its own source (`?source=yt-build-story`, `yt-art`, `yt-how-to-mint`;
  at most 32 of `[a-z0-9-]`);
- then the GitHub link;
- then "Monad testnet. STRIDE has no monetary value." whenever STRIDE is shown.

Pin a comment with the waitlist link (long videos' comments can be clicked). Answer every comment
in the first hour.

## 4. Never

- Upload the app tour film with its current track: the music isn't licensed (`CLAUDE.md`). A
  copyright claim on the main channel isn't worth it. Use a Pixabay-licensed track
  (`launch-video/CREDITS.md`).
- Say earn money, worth, or anything from `voice.md` §3. "Walk. Earn. Upgrade." is the app's own
  headline, and fine.
- Buy views or subscribers, or swap them ("sub4sub").
- Show an old transaction or contract as live (`voice.md` §4).

## 5. Measuring it

- YouTube Studio → Analytics: views per Short and long video, and where viewers came from.
- Sign-ups: the count by source in `social/reviews.md`, for sources starting `yt-`. Write it in the
  Sunday review.

## Sources

Read 2026-10-18.
[1] [YouTube Help: handles](https://support.google.com/youtube/answer/2657964) ·
[2] [vidIQ: should you delete old videos](https://vidiq.com/blog/post/delete-old-youtube-videos/) ·
[3] [Opus: audience-content fit](https://www.opus.pro/blog/audience-content-fit-youtube-algorithm) (vendor), [Subscribr: pivoting a channel](https://subscribr.ai/youtube-strategy/pivot-youtube-niche-how-to) (vendor) ·
[4] [PhoneArena: Shorts links stop being clickable](https://www.phonearena.com/news/youtube-shorts-blocks-clickable-links_id149677), [u2l: YouTube links in 2026](https://u2l.ai/blog/youtube-channel-links)
