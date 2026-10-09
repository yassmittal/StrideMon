import { plannedEarlyAccessStartDateText } from './founding-pass'
import { walletStepContent } from './founding-pass-mint'
import type { screenshots } from './screenshots'
import {
  appDownloadUrl,
  legalPagePaths,
  passGalleryPath,
  supportEmail,
  xAccountHandle,
  xAccountUrl,
} from './site'

// The help page at /help (Part 7, D-047): every word as plain strings, so Part 8's chatbot can read
// the same text. Each guide and answer has a stable `id`, which is its anchor (`/help#wrong-code`).
// The website's mint problems and the app's errors link to these ids: never rename one without
// changing `mintProblemHelpTopicIds` (founding-pass-mint.ts) and the app's `helpTopicIds`
// (apps/mobile/src/config/website-urls.ts). Words: Founding Pass, founder, waitlist, waitlist
// window, open mint, one of one, "all minted" (docs/founding-pass/README.md).

export type HelpTopicId =
  // Sections
  | 'how-it-works'
  | 'before-you-start'
  | 'guides'
  | 'answers'
  | 'something-went-wrong'
  | 'lost-wallet'
  | 'contact'
  // Guides
  | 'install-metamask'
  | 'add-monad-testnet'
  | 'get-ready'
  | 'mint'
  | 'get-the-app'
  | 'sign-in-app'
  | 'first-walk'
  // Plain answers
  | 'whats-free'
  | 'pass-or-sneaker'
  | 'two-numbers'
  | 'play-before-pass'
  | 'cant-be-sent-or-sold'
  | 'why-email'
  | 'which-wallet'
  | 'stride-value'
  | 'laced'
  | 'after-all-minted'
  // When something goes wrong: email
  | 'code-not-arriving'
  | 'wrong-code'
  | 'robot-check'
  | 'check-ran-out'
  // ...the wallet
  | 'no-wallet'
  | 'wallet-wont-load'
  | 'wallet-not-answering'
  | 'sign-in-failed'
  | 'wrong-network'
  // ...the mint
  | 'minting-not-open'
  | 'waitlist-only'
  | 'pass-taken'
  | 'mint-slow'
  | 'mint-failed'
  | 'already-a-founder'
  | 'all-minted'
  | 'too-many-tries'
  | 'cant-reach-stridemon'
  // ...the app
  | 'app-no-pass'
  | 'app-cant-connect'
  | 'app-wallet-stopped-answering'
  | 'app-sign-in-expired'
  | 'sneaker-not-arriving'
  | 'app-cant-read-monad'
  | 'founder-sneaker-cant-send'
  | 'game-paused'

export type HelpLink = {
  label: string
  /** A help id (`#wrong-code`), a site path, or a full URL. */
  href: string
}

export type HelpScreenshot =
  /** A website screenshot in `public/help/`, 378 × 770. */
  | { kind: 'website'; path: `/help/${string}.webp`; alt: string }
  /** One of the app's screenshots (`src/content/screenshots.ts`). */
  | { kind: 'app'; screenshotKey: keyof typeof screenshots }

export type HelpGuide = {
  id: HelpTopicId
  title: string
  intro?: string
  steps: readonly string[]
  /** A warning or tip after the steps. */
  note?: string
  links?: readonly HelpLink[]
  screenshots?: readonly HelpScreenshot[]
  /** The "Add Monad Testnet" button and the details to add by hand. */
  hasNetworkSetup?: boolean
}

export type HelpAnswer = {
  id: HelpTopicId
  question: string
  paragraphs: readonly string[]
  steps?: readonly string[]
  links?: readonly HelpLink[]
}

export type HelpAnswerGroup = {
  heading: string
  answers: readonly HelpAnswer[]
}

export function buildHelpPath(helpTopicId: HelpTopicId): `/help#${string}` {
  return `/help#${helpTopicId}`
}

const helpLinks = {
  addNetwork: { label: 'Add Monad Testnet', href: '#add-monad-testnet' },
  installMetaMask: { label: 'Install MetaMask', href: '#install-metamask' },
  signInApp: { label: 'Sign in with the same wallet', href: '#sign-in-app' },
  lostWallet: { label: 'Lost your wallet?', href: '#lost-wallet' },
  contact: { label: 'Write to us', href: '#contact' },
  gallery: { label: 'See the Founding Passes', href: passGalleryPath },
  getApp: { label: 'Download the app', href: appDownloadUrl },
} as const satisfies Record<string, HelpLink>

export const helpPageContent = {
  title: 'Help',
  metaTitle: 'Help: the Founding Pass and the StrideMon app',
  description:
    'Plain-words help for StrideMon: how the Founding Pass works, setting up MetaMask and Monad Testnet, minting, the app, and what to do when something goes wrong.',
  metaLabels: ['Help', 'Founding Pass', 'The app'],
  intro:
    'Everything from “what is this?” to your first walk, in plain words. Stuck on a message? Find it under “When something goes wrong”, or write to us.',
  contentsLabel: 'On this page',
} as const

/** The page's sections, in order, for the contents list. */
export const helpSections: readonly { id: HelpTopicId; title: string }[] = [
  { id: 'how-it-works', title: 'How it works' },
  { id: 'before-you-start', title: 'Before you start' },
  { id: 'guides', title: 'Guides' },
  { id: 'answers', title: 'Plain answers' },
  { id: 'something-went-wrong', title: 'When something goes wrong' },
  { id: 'lost-wallet', title: 'Lost your wallet?' },
  { id: 'contact', title: 'Contact' },
]

export const helpHowItWorks: readonly { title: string; text: string }[] = [
  {
    title: 'Preview',
    text: 'Browse all 1,000 Founding Passes, heart your favourites, and join the waitlist. Minting hasn’t started, and anyone can try the app with a free Sneaker.',
  },
  {
    title: 'Early access',
    text: `On ${plannedEarlyAccessStartDateText}, the game starts over for the Founding Pass. From then, only founders can play, and Sneakers and STRIDE from before don’t carry over.`,
  },
  {
    title: 'Waitlist window',
    text: 'For 48 hours, people who joined the waitlist before it opened mint first. One free pass each.',
  },
  {
    title: 'Open mint',
    text: 'Then anyone can mint what’s left, until all 1,000 are minted.',
  },
  {
    title: 'The app',
    text: 'Sign in to the StrideMon app with the wallet that holds your pass. You get a Founder Sneaker in your pass’s design, and your first walk laces both.',
  },
  {
    title: 'Open to all',
    text: 'When all 1,000 are minted, or on the last date in the schedule, anyone can play with a free Sneaker. No new passes, ever.',
  },
]

export const helpBeforeYouStart = {
  items: [
    'An Android phone. The app is Android only for now. iOS comes later.',
    'MetaMask, a free wallet app. Your wallet is your StrideMon account.',
    'Monad Testnet turned on in MetaMask. It’s free, and it takes one tap below on a laptop.',
    'An email address, to check it’s you when you mint.',
    'The StrideMon app, once you’ve minted.',
  ],
  noMoneyLine:
    'You don’t need any money. Minting is free, and there’s no gas to pay: StrideMon pays it.',
} as const

export const helpNetworkSetupContent = {
  addLabel: 'Add Monad Testnet',
  addingLabel: 'Check your wallet',
  addedText: 'Done. Monad Testnet is in your wallet.',
  refusedText: 'You said no in your wallet, so nothing changed. Tap the button to try again.',
  failedText: 'Your wallet couldn’t add it. Add it by hand with the details below.',
  noWalletText:
    'There’s no wallet in this browser. On a phone, open this page in MetaMask’s own browser, or add the network by hand with the details below.',
  detailsHeading: 'The details, to add by hand',
  details: walletStepContent.networkDetails,
} as const

export const helpGuides: readonly HelpGuide[] = [
  {
    id: 'install-metamask',
    title: 'Install MetaMask',
    intro:
      'MetaMask is a free wallet app. It holds your pass and your Sneaker, and it’s how you sign in.',
    steps: [
      'On your Android phone, open Google Play and install MetaMask (by Consensys). On a laptop, add the MetaMask extension to Chrome, Brave, Firefox or Edge.',
      'Open it and tap Create a new wallet. Choose a password.',
      'Write the Secret Recovery Phrase (12 words) on paper and keep it somewhere safe. It’s the only way back into your wallet if you lose your phone.',
    ],
    note: 'Never share your Secret Recovery Phrase. StrideMon will never ask for it, and nobody honest will.',
    links: [{ label: 'Get MetaMask', href: 'https://metamask.io/download/' }],
  },
  {
    id: 'add-monad-testnet',
    title: 'Add Monad Testnet',
    intro:
      'StrideMon runs on Monad Testnet, a test network. Adding it is free, and the app needs it.',
    steps: [
      'On a laptop with MetaMask, or in MetaMask’s own browser on your phone: tap Add Monad Testnet below, then approve in MetaMask.',
      'Or open MetaMask, tap the network menu at the top, then Add a custom network, and type the details below.',
      'Turn it on before you connect to StrideMon. A wallet only shares your account for networks it has turned on.',
    ],
    hasNetworkSetup: true,
  },
  {
    id: 'get-ready',
    title: 'Get ready: check your email and sign in',
    intro: 'Do this before you mint, so minting is one tap when the time comes.',
    steps: [
      'Open stridemon.xyz/pass. Get ready shows near the top from the day before minting opens.',
      'Type your email and tap Send code. If a robot check shows, let it finish.',
      'Type the 6-digit code from our email. It works for 10 minutes. Look in spam if it isn’t in your inbox.',
      'Tap Connect wallet and pick MetaMask. On a phone, MetaMask opens: approve, then come back.',
      'Tap Sign in and approve the message in MetaMask. It’s free and sends nothing.',
    ],
    note: 'Use the wallet you’ll use in the app. The email check lasts 6 hours, so do it on the day.',
    links: [{ label: 'Open Get ready', href: `${passGalleryPath}#get-ready` }],
    screenshots: [
      {
        kind: 'website',
        path: '/help/get-ready.webp',
        alt: 'Get ready on a phone: Step 1, Check your email, with an email box and a Send code button. Step 2, Sign in with your wallet, with a Connect wallet button.',
      },
      {
        kind: 'website',
        path: '/help/email-code.webp',
        alt: 'The email step after Send code: “We sent a code to phone.one@example.com. It works for 10 minutes.”, a 6-digit code box and a Check code button.',
      },
    ],
  },
  {
    id: 'mint',
    title: 'Mint your pass',
    steps: [
      'Pick a pass: browse the gallery, take the quiz, or tap Surprise me. Tap a pass to open it.',
      'Tap Mint. If you skipped Get ready, its two steps show first.',
      'Wait a few seconds while it mints on Monad. Keep the page open.',
      'Your pass turns over with your founder number. It’s yours.',
    ],
    note: 'Someone took it a moment before you? Nothing is minted for you, and you see three similar passes nobody has yet. One tap mints one.',
    screenshots: [
      {
        kind: 'website',
        path: '/help/detail-sheet.webp',
        alt: 'A pass open on a phone: Founding Pass #0200, Ocean Runner Storm, “The open mint is on: anyone can mint a pass nobody has taken.” and a Mint #0200 button.',
      },
      {
        kind: 'website',
        path: '/help/minting.webp',
        alt: 'Minting on Monad: a dark card with #0200 and “Minting”, and “This takes a few seconds. Keep this open to see your founder number.”',
      },
      {
        kind: 'website',
        path: '/help/reveal.webp',
        alt: 'The minted pass: Ocean Runner Storm, Founder 5 of 1,000, with a link to see the mint on MonadVision.',
      },
    ],
  },
  {
    id: 'get-the-app',
    title: 'Get the app',
    steps: [
      'On your Android phone, tap Get the app after your mint, or the link below. It downloads the StrideMon app.',
      'Open the downloaded file. If Android asks, allow installs from your browser.',
      'Open StrideMon.',
    ],
    note: 'Android may say the app isn’t from Google Play. That’s expected for this test build.',
    links: [helpLinks.getApp],
  },
  {
    id: 'sign-in-app',
    title: 'Sign in with the same wallet',
    intro: 'The app knows you’re a founder by the wallet that holds your pass.',
    steps: [
      'In the app, tap Connect wallet and pick MetaMask.',
      'In MetaMask, pick the account that holds your pass, with Monad Testnet turned on, and approve.',
      'Back in the app, tap Sign to verify it’s you, and approve the message. It’s free.',
      'The app finds your pass and mints your Founder Sneaker. It takes a few seconds.',
    ],
    note: 'The app shows the address you signed in with. If it says you have no pass, you’re probably on another account: sign out and sign in with the one you minted with.',
    screenshots: [{ kind: 'app', screenshotKey: 'welcome' }],
  },
  {
    id: 'first-walk',
    title: 'Your first walk',
    steps: [
      'On Home, tap Start a run. Allow location, so the app can count your minutes.',
      'Walk or run. Minutes faster than 20 km/h don’t count, so no driving.',
      'Tap Stop. Your STRIDE arrives on Monad a few seconds later.',
      'Your first walk laces your pass and your Founder Sneaker. Both pictures change.',
    ],
    screenshots: [
      { kind: 'app', screenshotKey: 'home' },
      { kind: 'app', screenshotKey: 'activeRun' },
    ],
  },
]

export const helpPlainAnswers: readonly HelpAnswer[] = [
  {
    id: 'whats-free',
    question: 'What’s free?',
    paragraphs: [
      'Everything. The pass, the Founder Sneaker and the app are free. StrideMon pays the gas, and gives new players a little test MON. You never pay anything.',
    ],
  },
  {
    id: 'pass-or-sneaker',
    question: 'Is the Founding Pass my Sneaker?',
    paragraphs: [
      'No, they’re two things. The pass is your membership card: you mint it on the website, and it shows you’re a founder. You don’t walk with it.',
      'The Founder Sneaker is the shoe you walk with. The app gives it to you, drawn in your pass’s design, when you sign in with the wallet that holds the pass. Neither can be sent or sold.',
    ],
    links: [helpLinks.signInApp],
  },
  {
    id: 'two-numbers',
    question: 'Why does my pass have two numbers?',
    paragraphs: [
      'The pass number, like #0137, is the design: which of the 1,000 you picked. Every design exists once.',
      'The founder number, like Founder 42, is the order you minted in: you were the 42nd founder to mint.',
    ],
  },
  {
    id: 'play-before-pass',
    question: 'Can I play the app before I have a pass?',
    paragraphs: [
      `Until early access starts on ${plannedEarlyAccessStartDateText}, yes: anyone can try it with a free Sneaker. That’s a test period.`,
      'When early access starts, the game starts over. Sneakers and STRIDE from the test period don’t carry over, and only founders can play. Nobody has a pass until the waitlist window opens, so the app waits until then.',
      'When all 1,000 are minted, or on the last date in the schedule, anyone can play again with a free Sneaker.',
    ],
    links: [helpLinks.gallery],
  },
  {
    id: 'cant-be-sent-or-sold',
    question: 'What does “can’t be sent or sold” mean?',
    paragraphs: [
      'Your pass and your Founder Sneaker stay in the wallet you minted with. Nobody can buy them, and you can’t move them to another wallet yourself.',
      'The pass isn’t a token and never turns into one. If you lose that wallet, support can move both for you.',
    ],
    links: [helpLinks.lostWallet],
  },
  {
    id: 'why-email',
    question: 'Why do you need my email?',
    paragraphs: [
      'To keep it to one pass per person, and so you can prove the pass is yours if you lose your wallet.',
      'We send a code when you check your email, and one email when the waitlist window opens. Nothing else.',
    ],
    links: [{ label: 'Privacy policy', href: legalPagePaths.privacyPolicy }],
  },
  {
    id: 'which-wallet',
    question: 'Which wallet should I use?',
    paragraphs: [
      'The one you’ll use in the app. The app knows you’re a founder by the wallet that holds your pass. MetaMask works on Android and as a laptop extension.',
    ],
    links: [helpLinks.installMetaMask],
  },
  {
    id: 'stride-value',
    question: 'Is STRIDE worth money?',
    paragraphs: [
      'No. STRIDE is a test token on Monad Testnet, and it has no monetary value. You earn it by walking and spend it on your Sneaker.',
    ],
  },
  {
    id: 'laced',
    question: 'What does “laced” mean?',
    paragraphs: [
      'Your first walk in the app laces your pass and your Founder Sneaker: the laces go in, and the card says LACED. It’s only for looks.',
    ],
  },
  {
    id: 'after-all-minted',
    question: 'What happens after all 1,000 are minted?',
    paragraphs: [
      'No new passes, ever. StrideMon opens to everyone with a free normal Sneaker. If they aren’t all minted, it opens on the last date in the schedule anyway. Founders keep their pass and Founder Sneaker.',
    ],
  },
]

export const helpTroubleshootingGroups: readonly HelpAnswerGroup[] = [
  {
    heading: 'Your email',
    answers: [
      {
        id: 'code-not-arriving',
        question: 'The code didn’t arrive.',
        paragraphs: [
          'Look in spam and promotions for an email from hello@stridemon.xyz. It can take a minute.',
          'Check your email for a typo. You can ask for a new code after a minute, and only the newest code works.',
        ],
        links: [helpLinks.contact],
      },
      {
        id: 'wrong-code',
        question: 'The code doesn’t work.',
        paragraphs: [
          'Use the code in the newest email: a new code stops the old one working.',
          'A code works for 10 minutes and 5 tries. After that, ask for a new one and type it carefully.',
        ],
      },
      {
        id: 'robot-check',
        question: 'The robot check fails or won’t load.',
        paragraphs: [
          'It’s Cloudflare Turnstile, and it keeps bots from using up the mint. Wait for it to reload, then try again.',
          'If it never shows, a content blocker may be stopping it. Allow stridemon.xyz or try another browser, then reload the page.',
        ],
      },
      {
        id: 'check-ran-out',
        question: '“Your email check ran out” or “Your sign-in ended”.',
        paragraphs: [
          'An email check lasts 6 hours. Check your email again: it takes a minute.',
          'A sign-in also ends after a while. Sign in with your wallet again. It’s free.',
        ],
      },
    ],
  },
  {
    heading: 'Your wallet',
    answers: [
      {
        id: 'no-wallet',
        question: 'I don’t have a wallet, or none is connected.',
        paragraphs: [
          'Install MetaMask first. It’s free and takes a few minutes. Then tap Connect wallet and pick it.',
          'When your wallet asks to add or switch to Monad Testnet, say yes. It’s free.',
        ],
        links: [helpLinks.installMetaMask, helpLinks.addNetwork],
      },
      {
        id: 'wallet-wont-load',
        question: 'The wallet part of the page doesn’t load.',
        paragraphs: [
          'Check your connection, then reload the page. Your favourites and email check stay.',
          'If it still doesn’t load, a content blocker may be stopping it. Allow stridemon.xyz or try another browser.',
        ],
      },
      {
        id: 'wallet-not-answering',
        question: 'My wallet doesn’t answer.',
        paragraphs: [
          'Open MetaMask and make sure it’s unlocked. On a phone, switch to MetaMask, look for the request, then come back.',
          'Still nothing? Tap Use another wallet and connect again.',
        ],
      },
      {
        id: 'sign-in-failed',
        question: 'Signing in didn’t work.',
        paragraphs: [
          'Maybe you said no in your wallet, the request ran out (it lasts 5 minutes), or the signature didn’t check out. Signing in again is free and sends nothing.',
          'If it keeps failing, disconnect your wallet and connect it again, or try MetaMask.',
        ],
      },
      {
        id: 'wrong-network',
        question: 'My wallet won’t switch to Monad Testnet.',
        paragraphs: [
          'Add Monad Testnet by hand, then switch to it. The guide has a one-tap button and the details.',
          'On the website you can sign in and mint without it. The app needs it.',
        ],
        links: [helpLinks.addNetwork],
      },
    ],
  },
  {
    heading: 'The mint',
    answers: [
      {
        id: 'minting-not-open',
        question: 'Minting hasn’t opened yet.',
        paragraphs: [
          'The schedule on the Founding Pass page shows when it opens. Meanwhile, heart the passes you like, and join the waitlist to mint 48 hours before everyone else.',
        ],
        links: [helpLinks.gallery],
      },
      {
        id: 'waitlist-only',
        question: '“Right now, only the waitlist can mint.”',
        paragraphs: [
          'For the first 48 hours, only emails that joined the waitlist before the window opened can mint. Joining now doesn’t get you in.',
          'Anyone can mint when the open mint starts. Add a reminder, and heart your favourites so they’re easy to find. Joined with another email? Check that one instead.',
        ],
        links: [helpLinks.gallery],
      },
      {
        id: 'pass-taken',
        question: 'Someone minted the pass I wanted.',
        paragraphs: [
          'Each pass exists once, and the first mint wins. Nothing was minted for you.',
          'You see three similar passes nobody has yet. One tap mints one.',
        ],
      },
      {
        id: 'mint-slow',
        question: 'My mint is slow, or the page lost touch.',
        paragraphs: [
          'Mints go one after another, and yours is held for you in the queue. Nothing is lost.',
          'Keep the page open, or come back later in the same browser: the page picks your mint up again. Check your connection if it says it lost touch.',
        ],
      },
      {
        id: 'mint-failed',
        question: 'The mint didn’t go through.',
        paragraphs: [
          'Nothing was minted and nothing was charged, so you can try again. If it keeps happening, write to us.',
        ],
        links: [helpLinks.contact],
      },
      {
        id: 'already-a-founder',
        question: 'It says I already have a pass.',
        paragraphs: [
          'It’s one pass per email and one per wallet. The page shows the pass you already hold.',
          'Your next step is the app: sign in with the wallet that holds it. Lost that wallet? Support can move your pass.',
        ],
        links: [helpLinks.signInApp, helpLinks.lostWallet],
      },
      {
        id: 'all-minted',
        question: 'All 1,000 are minted, or minting has closed.',
        paragraphs: [
          'No new passes, ever. StrideMon is open to everyone now: get the app and sign in for a free Sneaker.',
        ],
        links: [helpLinks.getApp],
      },
      {
        id: 'too-many-tries',
        question: '“Too many tries.”',
        paragraphs: [
          'Too many requests came from your connection in a short time. Wait a few minutes, then try again.',
        ],
      },
      {
        id: 'cant-reach-stridemon',
        question: '“We can’t reach StrideMon” or “Something went wrong”.',
        paragraphs: [
          'Nothing was minted or lost. Check your connection and try again in a minute.',
          'If it keeps happening, it’s probably on our side. Write to us, and say what you were doing.',
        ],
        links: [helpLinks.contact],
      },
    ],
  },
  {
    heading: 'The app',
    answers: [
      {
        id: 'app-no-pass',
        question: 'The app says “Mint a Founding Pass to get in early”.',
        paragraphs: [
          'Right now, only founders can play. The app looks for a pass in the wallet you signed in with.',
          'Minted already? Check that the address the app shows is the wallet you minted with. If not, tap Sign out and sign in with that one.',
          'Just minted? Tap I’ve minted my pass. A new pass can take a few seconds to show.',
          'Played before early access? The game started over for the Founding Pass, so Sneakers and STRIDE from the test period don’t carry over.',
          'No pass yet? Tap See the Founding Passes. The app opens to everyone when all 1,000 are minted, or on the last date in the schedule.',
        ],
        links: [helpLinks.gallery, helpLinks.signInApp],
      },
      {
        id: 'app-cant-connect',
        question: 'The app can’t connect my wallet.',
        paragraphs: [
          'Most often, Monad Testnet isn’t turned on in MetaMask, so MetaMask shares no account.',
        ],
        steps: [
          'In MetaMask, add and turn on Monad Testnet.',
          'Clear the app’s data: Android Settings → Apps → StrideMon → Storage → Clear data.',
          'Open StrideMon and connect again.',
        ],
        links: [helpLinks.addNetwork],
      },
      {
        id: 'app-wallet-stopped-answering',
        question: 'Every wallet request fails in the app.',
        paragraphs: [
          'This happens when the app was closed while MetaMask was asking you something. Nothing reached Monad.',
          'Go to Profile, tap Sign out, then sign in again.',
        ],
      },
      {
        id: 'app-sign-in-expired',
        question: '“Your sign-in has expired.”',
        paragraphs: ['Go to Profile, tap Sign out, then sign in again with the same wallet.'],
      },
      {
        id: 'sneaker-not-arriving',
        question: 'My Founder Sneaker, or my free Sneaker, isn’t arriving.',
        paragraphs: [
          'It usually takes a few seconds. If the app says it couldn’t request or mint it, tap Try again or Check again: nothing was charged.',
          'If the app stays on that screen for more than a few minutes, write to us with your wallet address.',
        ],
        links: [helpLinks.contact],
      },
      {
        id: 'app-cant-read-monad',
        question: '“Couldn’t read … from Monad.”',
        paragraphs: [
          'The app reads your pass and Sneaker straight from Monad Testnet, which is sometimes slow. Check your connection and tap Try again.',
        ],
      },
      {
        id: 'founder-sneaker-cant-send',
        question: 'I can’t send my Founder Sneaker.',
        paragraphs: [
          'Founder Sneakers stay with their founder: they can’t be sent or sold, like the pass. Normal Sneakers can be sent.',
        ],
        links: [{ label: 'What “can’t be sent or sold” means', href: '#cant-be-sent-or-sold' }],
      },
      {
        id: 'game-paused',
        question: '“StrideMon is paused for maintenance.”',
        paragraphs: [
          'Starting a run, repairs and upgrades are off for a short while. Everything you own is safe, and anything waiting goes through by itself when the game is back.',
        ],
      },
    ],
  },
]

export const helpLostWalletContent = {
  paragraphs: [
    'If you lose the wallet that holds your pass (a lost phone and no Secret Recovery Phrase, say), support can move your pass and your Founder Sneaker to a new wallet. We do it by hand, and it’s the one way a pass ever moves.',
    'They keep everything: the design, the founder number, the frame, laced or not, and the Sneaker’s level and stats.',
  ],
  steps: [
    'Make a new wallet. It can’t already hold a Founding Pass.',
    `Write to ${supportEmail} from the email you minted with. Send your pass number (like #0137) and the new wallet’s address.`,
    'We reply with a 6-digit code to that email. Send it back, so we know the email is yours.',
    'We move your pass and Founder Sneaker, usually within two days, and tell you when it’s done. Then sign in to the app with the new wallet.',
  ],
  note: 'Never send your Secret Recovery Phrase or password. We’ll never ask for them.',
} as const

export const helpContactContent = {
  intro: 'Write to us. A real person reads every email.',
  supportEmail,
  includeHeading: 'Help us help you: include',
  includeItems: [
    'what you were doing',
    'the words on the screen, or a screenshot',
    'your wallet address (it starts with 0x and is safe to share)',
    'your pass number, if you have one',
    'your phone or browser',
  ],
  note: 'Never send your Secret Recovery Phrase or password. We’ll never ask for them.',
  xPrompt: 'Or ask on X:',
  xAccountHandle,
  xAccountUrl,
} as const

/** Every id on the page, in order. The page refuses to build if two match. */
export function listHelpTopicIds(): HelpTopicId[] {
  return [
    ...helpSections.map((section) => section.id),
    ...helpGuides.map((guide) => guide.id),
    ...helpPlainAnswers.map((answer) => answer.id),
    ...helpTroubleshootingGroups.flatMap((group) => group.answers.map((answer) => answer.id)),
  ]
}

/**
 * The title of a guide, answer or section, for the chatbot's links (D-048). `null` for an id the
 * page doesn't have, which the chatbot then doesn't link.
 */
export function findHelpTopicTitle(helpTopicId: string): string | null {
  const topics: readonly { id: HelpTopicId; title: string }[] = [
    ...helpSections,
    ...helpGuides,
    ...helpPlainAnswers.map((answer) => ({ id: answer.id, title: answer.question })),
    ...helpTroubleshootingGroups.flatMap((group) =>
      group.answers.map((answer) => ({ id: answer.id, title: answer.question })),
    ),
  ]
  return topics.find((topic) => topic.id === helpTopicId)?.title ?? null
}
