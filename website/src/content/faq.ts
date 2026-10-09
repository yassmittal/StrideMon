import { helpPath } from './site'

// One list feeds both the FAQ section and the FAQPage JSON-LD. The full answers live on /help
// (D-047).
export type FrequentlyAskedQuestion = {
  question: string
  answer: string
}

export const faqContent = {
  metaLabels: ['FAQ'],
  heading: 'Questions',
  helpLabel: 'Read the full help',
  helpPath,
} as const

export const frequentlyAskedQuestions: readonly FrequentlyAskedQuestion[] = [
  {
    question: 'Is it live?',
    answer: 'Yes, on Monad testnet, on Android. iOS comes later.',
  },
  {
    question: 'Can I play now?',
    answer:
      'It’s an Android demo build on Monad testnet. Join the waitlist and we’ll email you once, when the Founding Pass waitlist window opens.',
  },
  {
    question: 'What is the Founding Pass?',
    answer:
      'Early access to StrideMon. 1,000 passes, each a different Sneaker design that exists once. Mint one free, and the app gives you a Founder Sneaker in the same design.',
  },
  {
    question: 'Is the Founding Pass free?',
    answer:
      'Yes. Minting is free, and there’s no gas to pay. It can’t be sent or sold, and it isn’t a token.',
  },
  {
    question: 'When can I mint?',
    answer:
      'People on the waitlist mint first, for 48 hours. Then anyone can mint what’s left, until all 1,000 are minted. The dates are on the Founding Pass page.',
  },
  {
    question: 'What if I don’t get a pass?',
    answer:
      'StrideMon opens to everyone when all 1,000 are minted, or on the last date in the schedule. Then anyone can play with a free Sneaker.',
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
  {
    question: 'What happens to my location data?',
    answer:
      'Only active minutes and distance reach the chain. Raw samples are deleted after 30 days.',
  },
  {
    question: 'Can I sell my Sneaker?',
    answer:
      'You can send a normal Sneaker to any wallet today, and a marketplace is planned. A Founder Sneaker stays with its founder: it can’t be sent or sold.',
  },
]
