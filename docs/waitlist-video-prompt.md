# Waitlist Video Prompt

The brief for the **Founding Pass waitlist film**: a short, motion-designed video that goes with
the @stridemon post `social/posts/2026-10-15-waitlist-mints-first.md`. It's a second composition
in the launch film's Remotion project (`launch-video/`), not a new project. Paste everything below
the line into a fresh Claude Code session started in the repo root (`monad/`).

## Why it's shaped this way (2026-10-13)

- **One job:** get a stranger to leave their email on `stridemon.xyz/pass#waitlist`. Everything in
  the film serves the one reason to do it: **the waitlist mints 48 hours before everyone else.**
- **About 20 s.** It rides under a post, so it has to land in the feed, muted, before the thumb
  moves. The launch film (45 s) already explains the game, so this one doesn't.
- **The art carries it.** 1,000 real one-of-one designs, drawn by the contract, are the thing
  people stop for. The film shows the real SVGs and never redraws them.
- **Same project, same language.** `launch-video/` already has the theme, fonts, easings,
  components and the render and loudness pipeline. Reusing them keeps the two films one brand
  and saves days.
- **No dates on screen.** The mint times are only final when Part 10 sets them. Without a date,
  the film stays true if the dates move.

---

## The prompt

You are a senior motion designer and creative technologist: someone who has cut launch reels
for Linear, Arc and Apple-style product drops, and who builds every frame in code. You're making
the **Founding Pass waitlist film for StrideMon** in **Remotion**. Your bar: a motion designer
can't tell it wasn't made in After Effects, and a crypto-native viewer can't find one claim that
isn't true.

Work in **gates**. At each **STOP**, show me the result and wait for my go-ahead. Never skip one.

### 0. Read first

- `CLAUDE.md` (repo rules). **Never run any git command.** Leave everything in the working tree.
- `launch-video/README.md`, `HANDOFF.md`, `SCRIPT.md`, `FACTS.md`, `CREDITS.md`, then the code in
  `launch-video/src/` (`Root.tsx`, `LaunchFilm.tsx`, `beats.ts`, `layouts.ts`, `theme.ts`,
  `fonts.ts`, `content.ts`, `components/`, `scenes/`) and `scripts/render.sh`. This is the
  project you build in. **Reuse its components** (`MaskedRise`, `LabelRoll`, `ClipRise`, `Drift`,
  `RollingDigits`, `SneakerArt`, `MotionBlur`, `Soundtrack`, …) before you write a new one.
- `docs/launch-video-prompt.md` **§4 (Motion language) and §5 (Sound)**. Both apply here in full,
  word for word: three easings only, nothing bounces, hard cuts and black/off-white flips, masked
  rises and label rolls, never a dead frame, lime only on dark, blue at most once, no glow, no
  gradients, the type sizes and reading times, the banned defaults, the 120 BPM grid idea and the
  −14 LUFS / −1 dBTP mix.
- Remotion's skills in `launch-video/.agents/skills` (start with `remotion-best-practices`).
- `docs/architecture/design-system.md` and `apps/mobile/src/theme/`: the only colours and type.
- `social/voice.md`: the vocabulary, the **Never say** list and the image rules. They apply to
  every word on screen.
- `social/posts/2026-10-15-waitlist-mints-first.md`: the post this film goes with. The film and
  the post must say the same thing.
- The Founding Pass, so you understand what you're selling:
  - `docs/founding-pass-brief.md` (what a pass is, rarity, the Founder Sneaker, Unlaced and Laced,
    §5.1 the 48-hour waitlist window, §5.3 free and gas-free)
  - `website/src/content/founding-pass.ts` (`passPromiseLine`, the phase copy) and
    `website/src/content/waitlist.ts` (the waitlist's exact words)
  - `website/src/content/founding-pass-designs.ts` (every design's number, name, template,
    family and rarity)
  - `website/public/pass-art/cards/` and `website/public/pass-art/laced/` (1,000 SVGs each: the
    contract renderer's own output) and `packages/contracts/art/founding-pass/previews/`
    (overview sheets, to choose from)
- Open `https://stridemon.xyz/pass` in the browser (Playwright) at 1080 × 1350 and look at the
  gallery, the pass sheet and the waitlist section. The film should feel like the same product.

### 1. What you may say (the only facts)

Every word and number on screen has a row in `launch-video/FACTS.md` with its source. Add a new
section for this film **before** a line goes on screen, and mirror it in the film's content file.
What's true and usable:

- StrideMon opens with **1,000 Founding Passes**. Each is a **one-of-one** Sneaker design, drawn
  by a contract on **Monad testnet**, and each can be minted once.
- A pass is **free to mint, and we pay the gas**. It **can't be sold or sent**. It **isn't a token
  and never turns into one** (`passPromiseLine`).
- It's your **early access to StrideMon**, and the app gives you a **Founder Sneaker in the same
  design**. That's the Sneaker you walk in.
- Rarity: **650 Common, 250 Uncommon, 90 Rare, 10 Legendary** (brief). Use real designs, with
  their real numbers and names, from the design table.
- **The waitlist mints 48 hours before everyone else.** Joining takes **an email, never a
  wallet**. The waitlist gets **one email, when the window opens, and nothing else**.
- The address: **stridemon.xyz/pass**.

Never on screen: a date or time, a price or any "mint price", worth, value, floor, airdrop,
whitelist or WL, "limited time", "don't miss out", a countdown to a real date, a user or sign-up
count, mainnet, App Store or Play Store, or a STRIDE amount. (If a STRIDE amount ever does appear,
`Monad testnet. STRIDE has no monetary value.` goes on screen with it.) No real email address on
screen: use `you@example.com`, the form's own placeholder.

**The 1,000 designs are frozen** (`DESIGNS_FROZEN_ON`). Use the generated SVGs as they are: you
may animate them (reveal, scale, move, line-draw their strokes, swap Unlaced → Laced), never edit
their paths or colours, and never invent a design that isn't in the table.

### 2. Shape (a starting point: improve it, then defend your version at STOP 1)

About 20 s, 4:5 (1080 × 1350) master, 60 fps, on a 120 BPM grid (one beat = 30 frames). Five
beats of story:

| # | ~Time | Idea | On screen (draft words) |
|---|---|---|---|
| 1 | 0:00–0:03 | **Hook.** One Sneaker line-draws itself on black (lime last), then fills. Frame 1 already moves: no logo sting, no fade from black. | `1,000 Founding Passes.` |
| 2 | 0:03–0:08 | **One of one.** A hard flip to off-white and the collection floods in: a grid of real cards that builds on the beat, then a single-cut punch-in to one card with its number and name in mono. A flip to black for one **Legendary**, its rarity in lime. | `Each design exists once.` |
| 3 | 0:08–0:12 | **What it is.** The pass card, then the Founder Sneaker in the same design, Unlaced → Laced (the laces draw in). | `Your way into StrideMon.` / `Your first Sneaker, in the same design.` |
| 4 | 0:12–0:15 | **The promise,** three short lines that label-roll on beats. | `Free. We pay the gas.` / `Can't be sold or sent.` / `Not a token.` |
| 5 | 0:15–0:20 | **The ask.** A vector rebuild of the site's waitlist form (not a screenshot): the field fills with `you@example.com`, `Join the waitlist` presses with the site's own press state, and it answers `You're on the list.` Then the end card. | `Join the waitlist. Mint 48 hours before everyone else.` → end card: `stridemon.xyz/pass` · `MONAD TESTNET` |

Rules for the shape:

- **It must work muted.** Read the whole film with the sound off: each beat lands on its words
  and pictures alone.
- **The end card holds at least 2.5 s** with the address big enough to read on a phone, and it's
  also the poster frame.
- **The first frame is a good thumbnail.** X autoplays muted, and the first second decides it.
- Leave the "48 hours" line up long enough to read twice. It's the whole point.

### 3. Sound

- Choose the music yourself from **Pixabay Music** (Pixabay Content License, free commercial use),
  using the launch film's criteria: minimal electronic, 116–124 BPM, no vocals, steady tempo, a
  clear hit near 0:03 (the flip into the collection) and a resolve under the end card. Prefer a
  track **without** "Content ID Registered". Confirm the licence on its page, measure its BPM and
  downbeats (ffmpeg onset analysis, or `librosa`), and fit the grid to it. Keep two runners-up as
  4:5 previews.
- SFX from the launch film's set or CC0 sources: a low thump on each flip, a soft tick as each
  grid row lands, the button press, and one clean tone on `You're on the list.` No whooshes on
  every move, no risers, no coin sounds.
- Record every file's source and licence in `launch-video/CREDITS.md`, and extend
  `scripts/fetch-audio.sh` so a fresh clone can rebuild them.

### 4. Build

- New compositions in `launch-video/src/Root.tsx`: `Waitlist4x5` (the master) and a
  `WaitlistScenes-4x5` folder with each scene on its own. Its own beats file and content file;
  shared components stay shared. **Don't change how the launch film looks or sounds:** if you
  touch a shared component, render the launch film's scenes again and check them.
- Load the pass SVGs from `website/public/pass-art/` without copying them by hand: a small script
  that copies the chosen numbers into `launch-video/public/pass-art/` (gitignored), run by
  `fetch-audio.sh`'s sibling or the README's install steps. Never edit anything in `website/`.
- Type and colours come from `theme.ts` and `fonts.ts`. No raw hex outside them.
- Extend `scripts/render.sh` to take the waitlist film (for example `render.sh waitlist-4x5`)
  with the same picture settings, loudness passes and BT.709 tags.

**STOP 1:** the script (every line on screen, in order, with its `FACTS.md` row), the storyboard
table as you'll build it (beats, frames, what moves), the designs you picked and why (numbers and
names), the music pick with the two runners-up, and **four styleframes** at 1080 × 1350 (the
hook, the grid, the Legendary, the end card).

**STOP 2:** the animatic: the full 4:5 film with real art and type, on the music, as an mp4
(`launch-video/out/animatic/`), plus a contact sheet (`scripts/contact-sheet.sh`, one frame every
0.5 s).

**STOP 3:** the finished 4:5 film after polish: timing, eases, the mix.

### 5. Deliver

- `launch-video/out/stridemon-waitlist-4x5.mp4`: H.264, yuv420p, BT.709, 60 fps, AAC 48 kHz,
  −14 LUFS integrated, −1 dBTP, `+faststart`. Plus `-4x5-poster.png` (the end card) and
  `-4x5-silent.mp4`.
- Check it the way X will play it: under 140 s, under 512 MB, plays muted, and the 4:5 crop holds
  in the composer.
- Update `social/posts/2026-10-15-waitlist-mints-first.md`: its `media` points at the mp4 (don't
  copy the video into `social/`), with alt text that says what the film shows and its words, and
  a "Media command" section with the render command. Leave `approved:` empty.
- Update `launch-video/README.md` (the new commands) and add the film's script to `SCRIPT.md`.
- **Done means:** `bunx tsc --noEmit` in `launch-video/` passes, `bun run lint` at the repo root
  passes, and the launch film still renders unchanged.

**Never:** run git, post or schedule anything on X, send a transaction, or touch `website/`.

### Stretch (only if I say yes at STOP 3)

- A 9:16 (1080 × 1920) cut for Stories and Reels, and a 16:9 (1920 × 1080) cut for YouTube.
