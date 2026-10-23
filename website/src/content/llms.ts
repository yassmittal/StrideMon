import { earlyHourRules } from './founding-pass'

// The words of `/llms.txt` that exist nowhere else on the site (D-061). Everything else in it, and
// all of the Markdown pages, comes from the content the pages themselves render.

export const llmsTextContent = {
  /** The llmstxt.org blockquote: what StrideMon is, in one line. */
  summary:
    'StrideMon is a move-to-earn game on Monad testnet: own a Sneaker NFT, walk or run with the Android app to earn STRIDE, and spend STRIDE to repair and level up the Sneaker.',
  keyFacts: [
    'It runs on Monad testnet (chain 10143). STRIDE is a testnet token with no monetary value, and nothing on StrideMon is for sale.',
    'The app is Android only for now. iOS comes later. Google Play review is in progress; until then the Android test build installs from Expo.',
    'The rules (energy, rewards, repair, upgrade) are enforced by verified contracts on Monad. A minute only counts at 1–20 km/h on average, so driving earns nothing.',
    'The Founding Pass: 1,000 one-of-one Sneaker designs, free to mint with no gas, which can’t be sent or sold and aren’t a token. Each pass is early access, and the app gives its holder a Founder Sneaker in the same design.',
    `People on the waitlist mint first, for 48 hours. When ${earlyHourRules.requiredFriendCount} friends join with someone’s invite link, that person’s window opens an hour early, for at most ${earlyHourRules.mintLimit} passes in that hour.`,
    'Built for a hackathon and open source under the MIT license.',
  ],
  pagesHeading: 'Pages',
  optionalHeading: 'Optional',
  pageNotes: {
    home: 'What StrideMon is, how a run works, the on-chain rules, fair play and privacy, the contracts, and the FAQ',
    pass: 'The Founding Pass: the schedule, how minting works, the 1,000 designs and their rarity, and its questions',
    help: 'Step-by-step guides (MetaMask, Monad Testnet, minting, the app) and an answer for every error message',
    waitlist: 'Join the waitlist with Google or an email code',
    passIndex: 'All 1,000 Founding Passes by number, with each one’s name, rarity and layers',
    fullText: 'The home page, the Founding Pass page and the whole help in one file',
    privacyPolicy: 'What the app and site collect, and for how long',
    deleteAccount: 'How to delete a StrideMon account',
    showroom:
      'The StrideMon store in 3D in the browser: walk it and see any of the 1,000 designs up close (it can’t mint)',
    github: 'The source code: the app, the API and the contracts',
    x: 'News and updates',
    youtube: 'Demo videos',
  },
  linkLabels: {
    home: 'Home',
    pass: 'Founding Pass',
    help: 'Help',
    waitlist: 'Join the waitlist',
    passIndex: 'All 1,000 Founding Passes',
    fullText: 'Everything in one file',
    privacyPolicy: 'Privacy policy',
    deleteAccount: 'Delete your account',
    showroom: 'The 3D showroom',
    github: 'GitHub',
    x: 'StrideMon on X',
    youtube: 'StrideMon on YouTube',
  },
  /** One line per schedule date, in the key facts. */
  scheduleFactPrefix: 'Founding Pass dates:',
  builtByPrefix: 'Built by',
  updatedPrefix: 'Last updated:',
  /** Under each Markdown page: the page it copies. */
  webPagePrefix: 'Web page:',
  /** The Founding Pass page's design summary, which the gallery shows only as filters. */
  passDesignsHeading: 'The 1,000 designs',
  buildPassDesignsLine: (templateCount: number, colorFamilyCount: number, colorwayCount: number) =>
    `Every design is one of ${templateCount} shoe shapes, in one of ${colorFamilyCount} colour families and ${colorwayCount} colourways, with three details of its shape (like the side, heel or sole) and a lace colour. No two are the same.`,
  rarityCountsLabel: 'By rarity:',
  templatesLabel: 'The shoe shapes:',
  legendaryNamePrefix: 'Its Legendary is',
} as const
