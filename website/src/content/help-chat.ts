import { helpPath } from './site'

// The help chatbot on /pass and /help (Part 8, D-048). It answers from the help page's own words
// (help.ts), and every state ends in a next step (docs/founding-pass/README.md → Nobody gets
// stuck). Words: Founding Pass, founder, waitlist, open mint; never "airdrop" or "whitelist".

export const helpChatContent = {
  launcherLabel: 'Ask a question',
  metaLabels: ['Help', 'Ask a question'],
  title: 'Ask about StrideMon',
  closeLabel: 'Close',
  introLines: [
    'I answer from the help page, in plain words. I can get things wrong, so each answer links to the page.',
    'Never type your Secret Recovery Phrase or private key. Nobody at StrideMon will ever ask for it.',
    'We don’t keep what you type.',
  ],
  suggestionsLabel: 'Try one of these',
  suggestedQuestions: [
    'How do I mint a pass?',
    'Is it really free?',
    'The code didn’t arrive.',
    'The app says I have no pass.',
  ],
  visitorLabel: 'You',
  assistantLabel: 'StrideMon help',
  readMoreLabel: 'Read on the help page',
  thinkingText: 'Looking in the help page…',
  inputLabel: 'Your question',
  inputPlaceholder: 'Ask about the Founding Pass or the app',
  sendLabel: 'Ask',
  tooLongText: (maxLength: number) => `Keep it under ${maxLength} characters.`,
  helpPagePath: helpPath,
  helpPageLabel: 'Open the help page',
  tryAgainLabel: 'Try again',
  problems: {
    unavailable:
      'The assistant can’t answer right now. Try again in a minute, or find your answer on the help page.',
    unreachable:
      'We can’t reach StrideMon. Check your connection and try again, or open the help page.',
    tooManyQuestions:
      'That’s a lot of questions in a short time. Wait a few minutes, then ask again. Every answer is on the help page too.',
    monthlyCapReached:
      'The assistant has answered all it can this month. Every answer is on the help page, and we read every email.',
  },
} as const

export type HelpChatProblemKey = keyof typeof helpChatContent.problems
