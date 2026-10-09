# Part 8: Help chatbot (optional)

**Goal:** a small assistant on the website answers questions in plain words, using only Part 7's
help content, and never leaves someone worse off than the help page would.

## Ask Yash first

This is the one part that can cost money every month, and the project prefers free options.
Offer two choices with a recommendation:

| Option | How it works | Cost |
|---|---|---|
| **Guided help** | A chat-style widget with the top questions as buttons, plus search over the help content. No AI. | Free |
| **AI assistant** | A model answers from the help content only, through the API, with a hard monthly cap | The model's usage, up to the cap |

Get his choice, the monthly cap if it's the AI option, and his ok on the provider before building.
Skip this part entirely if he says so.

## Build (AI option)

1. **`POST /v1/help/chat`** in `apps/api`:
   - The **help content is its only knowledge**. Answers are short, in plain words, and link to the
     matching help section.
   - **Safety:** it never asks for, accepts or repeats a seed phrase or private key, and it tells
     anyone who offers one to keep it secret. It never talks about prices, value, airdrops or
     investing (STRIDE has no monetary value). Off-topic questions get a polite redirect.
   - **Limits:** a per-IP rate limit, the monthly cap (past it, reply with a link to the help
     page), CORS for the site only, and no personal data kept.
   - **The model:** check the provider's current models and docs before choosing, and pick the
     smallest one that answers the test list well.
2. **The widget** on `/pass` and `/help`, loaded only when someone opens it, so Lighthouse is
   untouched. Calm, in the site's look.

For the **guided help option**, build only the widget, over the help content, with no API route.

## Test

Write a list of 20 real questions:
- the help page's troubleshooting cases
- "is this an airdrop?"
- "is it worth money?"
- "what do you need my seed phrase for?"
- one off-topic question

Each needs an expected answer. Every answer must be correct and safe.

## Done when

- The test list passes.
- The cap works.
- Lighthouse is unaffected.
- Yash has tried it.

Mark Part 8 **Done** (or **Skipped**), then stop.

## As built (D-048)

- **Yash's choice (2026-10-09):** the AI option, on Amazon Bedrock with his API key in `us-east-1`,
  a **$5 monthly cap**, and a pick from five models he named. The test list chose DeepSeek V3.2.
- **API:** `POST /v1/help/chat` (`handlers/help-chat/`, `lib/help-chat/`,
  `services/help-chat-model.ts`, `repositories/help-chat-usage-repository.ts`). Settings:
  `BEDROCK_API_KEY` and `HELP_CHAT_MONTHLY_CAP_USD` (`deployment.md` §13).
- **The help text:** `bun run help:export-knowledge` after every change to `website/src/content/help.ts`,
  then redeploy the API. `bun run help:export-knowledge --check` says whether it's current.
- **The test list:** `apps/api/src/cli/help-chat-test-list.ts`, 20 questions with the answer each
  needs. `cd apps/api && bun run help:check-answers` asks the live model each one (about 6 cents a
  run) and checks it. Add `--model <id>` to try another model.
- **Widget:** `website/src/components/help-chat/`, its words in `website/src/content/help-chat.ts`.
