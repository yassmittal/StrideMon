import { helpPath } from './site'

// One list feeds both the FAQ section and the FAQPage JSON-LD. The full answers live on /help
// (D-047).
export type FrequentlyAskedQuestion = {
  question: string
  answer: string
}

export const faqContent = {
  heading: 'Questions',
  helpLabel: 'Read the full help',
  helpPath,
} as const

/** The six a newcomer asks first (D-073). The rest are on /help. */
export const frequentlyAskedQuestions: readonly FrequentlyAskedQuestion[] = [
  {
    question: 'Can I play now?',
    answer: 'Yes, on Android, on Monad testnet. iOS comes later.',
  },
  {
    question: 'What is the Founding Pass?',
    answer:
      'Early access to StrideMon. 1,000 passes, each a different Sneaker design. Mint one free, and you walk in the same Sneaker in the app.',
  },
  {
    question: 'Is the Founding Pass free?',
    answer: 'Yes. Minting is free, with no gas to pay. It can’t be sent or sold.',
  },
  {
    question: 'Do I need crypto?',
    answer:
      'No money. You need a free wallet such as MetaMask, with Monad Testnet added. StrideMon gives new players a little test MON for gas.',
  },
  {
    question: 'Is STRIDE worth money?',
    answer: 'No. It’s a testnet token for the game.',
  },
  {
    question: 'Can I cheat by driving?',
    answer: 'No. Minutes above 20 km/h don’t count.',
  },
]
