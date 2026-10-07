// One list feeds both the FAQ section and the FAQPage JSON-LD.
export type FrequentlyAskedQuestion = {
  question: string
  answer: string
}

export const faqContent = {
  metaLabels: ['FAQ'],
  heading: 'Questions',
} as const

export const frequentlyAskedQuestions: readonly FrequentlyAskedQuestion[] = [
  {
    question: 'Is it live?',
    answer: 'Yes, on Monad testnet, on Android. iOS comes later.',
  },
  {
    question: 'Can I play now?',
    answer:
      'It’s an Android demo build on Monad testnet. Join the waitlist for a Founding Pass: we open the line in waves and email you when it’s your turn.',
  },
  {
    question: 'What is the Founding Pass?',
    answer:
      'A free, numbered NFT on Monad testnet for the first 1,000 players. It lets you into StrideMon early, and it changes once you finish your first walk.',
  },
  {
    question: 'Can I sell or send my Founding Pass?',
    answer:
      'No. It stays in the wallet it was minted to. It isn’t a token and never turns into one.',
  },
  {
    question: 'Is this an airdrop?',
    answer:
      'No. There’s no token sale and no airdrop. The pass is a place in the game, nothing more.',
  },
  {
    question: 'Do I need crypto?',
    answer:
      'A wallet such as MetaMask with Monad Testnet added. New players get a small amount of test MON for gas.',
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
    answer: 'You can send it to any wallet today. A marketplace is planned.',
  },
]
