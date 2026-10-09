# Part 7: Help

**Goal:** someone who has never used a crypto wallet can go from "what is this?" to running in
their Founder Sneaker without asking anyone, and every error on the website and in the app points
to an answer.

## Read first

- [`README.md`](README.md) in this folder (the "nobody gets stuck" rule)
- Every error code and blocked state from Parts 3, 5 and 6
- `website/src/content/faq.ts` (the landing page's FAQ), `docs/architecture/design-system.md`

## Build

1. **A help page on the website** (`/help`, linked from `/pass`, the landing page and the app),
   in plain words and short sentences:
   - **How it works:** the five steps (preview, waitlist window, open mint, the app, open to all)
     in one short list
   - **Before you start:** a phone, MetaMask, Monad Testnet added (a one-tap button on desktop),
     and the app
   - **Guides with screenshots:** install MetaMask; add Monad Testnet; "Get ready" (email and
     wallet); mint; get the app; sign in with the same wallet; your first run
   - **Plain answers:** what's free (everything, with no gas to pay), what "can't be sent or sold"
     means, why there's an email step, that STRIDE has no monetary value, and what happens after
     all 1,000 are minted
   - **When something goes wrong:** one answer per error code and blocked state, each with its
     own anchor
   - **Lost your wallet?** Support can move your pass and Founder Sneaker to a new wallet after
     an email check (D-041). Say what to send and how long it takes.
   - **Contact:** the support email, and what to include
2. **One source for the help text:** typed content in `website/src/content/`, like the rest of the
   site, written so Part 8's chatbot can use the same text.
3. **Links from every error:** each message on the website and in the app links to its answer.
   The app opens the web help (Profile → Help, and the gate screen).
4. **The landing page FAQ:** add the Founding Pass questions.
5. **A plain-words pass** over all copy from Parts 4 to 6: no jargon, one idea per sentence, and
   the words from this folder's rules.

## Done when

- Every error code and blocked state links to a help answer.
- Yash has read the help page and finds it clear.
- If possible, someone new to crypto has followed the guide from nothing to a minted pass and
  noted where they hesitated, and those spots are fixed.

Lighthouse holds. Mark Part 7 **Done**, then stop.

## As built (D-047)

- `/help` is one static page from `website/src/content/help.ts` (plain strings, a stable `id` per
  guide and answer). Every answer is open on the page, so a deep link lands on text.
- The website's mint problems link through `mintProblemHelpTopicIds`; the app builds its links
  with `buildHelpUrl` in `apps/mobile/src/config/website-urls.ts`. Profile has Help.
- "Add Monad Testnet" is one tap where the browser has a wallet, and the details are shown either
  way.
- The guides use Part 5's phone screenshots and the app's own. MetaMask's screens are described in
  words: retake crisper shots, and add MetaMask's, if a first-time tester hesitates there.
- The support reply time ("up to two days") is a promise Yash makes: change it in `help.ts` if it's
  wrong.
