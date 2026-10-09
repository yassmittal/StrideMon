import type { HelpTopicId } from './help'
import { appDownloadUrl, xAccountHandle } from './site'

// The mint on /pass (Part 5, D-045): "Get ready", the steps, the mint, the reveal, and every
// problem with a plain next step (docs/founding-pass/README.md → Nobody gets stuck). Words:
// Founding Pass, founder, waitlist, waitlist window, open mint, one of one, "all minted".

export const mintHelpLabel = 'Get help'

export const getReadyContent = {
  sectionId: 'get-ready',
  metaLabels: ['Get ready', 'Two steps'],
  heading: 'Get ready, then mint in one tap.',
  intro:
    'Check your email and sign in with your wallet now. Then one tap on any pass mints it, which helps when someone else wants the same one.',
  previewNote:
    'You can sign in with your wallet now. An email check lasts 6 hours, so do that part on the day.',
  readyHeading: 'You’re ready.',
  readyText: 'Tap Mint on any pass you love. It’s free, and there’s no gas to pay.',
  readyPreviewText: 'When minting opens, tap Mint on any pass you love.',
  browseLabel: 'Find a pass',
} as const

export const emailStepContent = {
  stepLabel: 'Step 1',
  title: 'Check your email',
  description: 'We send a 6-digit code to check it’s yours. It’s one pass per email.',
  emailLabel: 'Email',
  emailPlaceholder: 'you@example.com',
  sendCodeLabel: 'Send code',
  sendingLabel: 'Sending',
  codeLabel: '6-digit code',
  codeSentPrefix: 'We sent a code to',
  codeSentSuffix: 'It works for 10 minutes.',
  checkCodeLabel: 'Check code',
  checkingLabel: 'Checking',
  noCodePrompt: 'No email? Check spam, or',
  resendLabel: 'send a new code',
  resendWaitPrefix: 'You can ask for a new code in',
  changeEmailLabel: 'Use another email',
  checkedPrefix: 'Checked:',
  checkedUntilPrefix: 'Good until',
  checkedRunsOutBeforeMinting:
    'This runs out before minting opens. Check again on the day: it takes a minute.',
} as const

export const walletStepContent = {
  stepLabel: 'Step 2',
  title: 'Sign in with your wallet',
  description:
    'A free signature proves the wallet is yours. It sends nothing and costs nothing. Use the wallet you’ll use in the app.',
  connectLabel: 'Connect wallet',
  loadingLabel: 'Opening wallets',
  signInLabel: 'Sign in',
  signingLabel: 'Check your wallet',
  signingText: 'Approve the sign-in message in your wallet. It’s free.',
  signedInPrefix: 'Signed in:',
  changeWalletLabel: 'Use another wallet',
  networkHeading: 'Switch to Monad Testnet',
  networkText:
    'Your wallet is on another network. StrideMon runs on Monad Testnet, and the app needs it too.',
  switchLabel: 'Switch to Monad Testnet',
  switchingLabel: 'Check your wallet',
  signInAnywayLabel: 'Sign in anyway',
  networkDetailsHeading: 'Add it by hand',
  networkDetails: [
    { label: 'Network name', value: 'Monad Testnet' },
    { label: 'RPC URL', value: 'https://testnet-rpc.monad.xyz' },
    { label: 'Chain ID', value: '10143' },
    { label: 'Currency', value: 'MON' },
    { label: 'Explorer', value: 'https://testnet.monadvision.com' },
  ],
} as const

export const mintStepContent = {
  title: 'Mint',
  mintLabelPrefix: 'Mint',
  notReadyText: 'Do the two steps above first. Both stay done on this browser.',
  checkingRobotText: 'Checking you’re not a robot…',
  requestingText: 'Sending your mint…',
  freeLine: 'Free, with no gas to pay. One pass per person.',
  closeLabel: 'Close',
} as const

export const mintPendingContent = {
  metaLabel: 'Minting',
  heading: 'Minting on Monad',
  text: 'This takes a few seconds. Keep this open to see your founder number.',
  slowText:
    'Taking longer than usual: mints go one after another. Your pass is held for you in the queue, so you can leave this open or come back later.',
  lostContactText:
    'We lost touch with StrideMon for a moment. Your mint is still in the queue. Trying again…',
  transactionLabel: 'Follow it on MonadVision',
} as const

export const revealContent = {
  founderLabel: 'Founder',
  ofLabel: 'of 1,000',
  oneOfOne: 'One of one',
  goldFrameLine: 'It rolled a gold frame. About 1 in 10 passes do. It’s only for looks.',
  imageUnavailableLine:
    'We couldn’t load the minted card from Monad just now, so this is the gallery card. Your pass is minted all the same.',
  goldFrameInWords: 'Your pass has a gold frame.',
  transactionLabel: 'See the mint on MonadVision',
  postOnXLabel: 'Post on X',
  getAppLabel: 'Get the app',
  getAppUrl: appDownloadUrl,
  sameWalletPrefix: 'Sign in to the app with this same wallet:',
  nextStepText:
    'Next: install StrideMon on Android and sign in with this wallet. The app gives you a Founder Sneaker in this design, and your first walk laces both.',
  doneLabel: 'Done',
} as const

/** The X post after a mint (brief §8). The link carries `?source=x-share`. */
export function buildMintedShareText(
  passNumberText: string,
  passName: string,
  founderNumber: number,
): string {
  return `I minted ${passNumberText} ${passName}, a one-of-one Founding Pass for ${xAccountHandle}. Founder ${founderNumber} of 1,000.`
}

export const founderContent = {
  metaLabels: ['Founder', 'Founding Pass'],
  heading: 'You’re a founder.',
  walletText: 'This wallet holds',
  emailText: 'This email already has a Founding Pass:',
  onePerPerson: 'It’s one pass per person and per wallet, so this is yours.',
  seePassLabel: 'Open its page',
  seeRevealLabel: 'See your pass',
  laced: 'Laced',
  unlaced: 'Not laced yet: your first walk in the app laces it.',
  emailWalletText:
    'Sign in to the app with the wallet that holds it. If you’ve lost that wallet, write to us from this email.',
} as const

export const calendarReminderContent = {
  title: 'StrideMon: the Founding Pass open mint starts',
  details:
    'Anyone can mint a free Founding Pass from now until all 1,000 are minted. Pick yours at https://stridemon.xyz/pass',
  googleLabel: 'Google Calendar',
  icsLabel: 'Apple or Outlook (.ics)',
  icsFileName: 'stridemon-open-mint.ics',
  addPrompt: 'Add a reminder:',
} as const

export type MintProblemKey =
  | 'emailInvalid'
  | 'codeFormat'
  | 'codeRecentlySent'
  | 'emailSendFailed'
  | 'codeIncorrect'
  | 'codeExpired'
  | 'codeTooManyAttempts'
  | 'walletLoadFailed'
  | 'walletNotConnected'
  | 'walletNotAnswering'
  | 'signatureRefused'
  | 'signInRequestExpired'
  | 'signatureInvalid'
  | 'networkSwitchFailed'
  | 'turnstileFailed'
  | 'turnstileUnavailable'
  | 'emailProofInvalid'
  | 'signInEnded'
  | 'notOpen'
  | 'waitlistOnly'
  | 'allMinted'
  | 'mintClosed'
  | 'alreadyMinted'
  | 'mintFailed'
  | 'mintStillQueued'
  | 'mintLostContact'
  | 'rateLimited'
  | 'unreachable'
  | 'unexpected'

export type MintProblemContent = {
  title: string
  text: string
}

/** One plain message per problem: what went wrong and what to do about it. */
export const mintProblemContent: Record<MintProblemKey, MintProblemContent> = {
  emailInvalid: {
    title: 'That email doesn’t look right.',
    text: 'Check it for a typo, then send the code again.',
  },
  codeFormat: {
    title: 'The code is 6 digits.',
    text: 'Type the 6 digits from the newest email from StrideMon.',
  },
  codeRecentlySent: {
    title: 'We sent you a code a moment ago.',
    text: 'Look for it in your inbox and spam. You can ask for a new one after a minute.',
  },
  emailSendFailed: {
    title: 'We couldn’t send the email.',
    text: 'Something went wrong on our side. Try again in a minute.',
  },
  codeIncorrect: {
    title: 'That code isn’t right.',
    text: 'Check the newest email from StrideMon: an older code stops working when a new one is sent.',
  },
  codeExpired: {
    title: 'This code has run out.',
    text: 'Codes work for 10 minutes, once. Ask for a new one.',
  },
  codeTooManyAttempts: {
    title: 'Too many wrong tries for this code.',
    text: 'Ask for a new code and type it carefully.',
  },
  walletLoadFailed: {
    title: 'The wallet part of this page didn’t load.',
    text: 'Check your connection, then reload the page. Your favourites and email check stay.',
  },
  walletNotConnected: {
    title: 'No wallet connected yet.',
    text: 'Tap Connect wallet and pick yours. Your wallet asks to add or switch to Monad Testnet: say yes, it’s free. No wallet yet? Install MetaMask, then come back.',
  },
  walletNotAnswering: {
    title: 'Your wallet didn’t answer.',
    text: 'Open your wallet, make sure it’s unlocked, then try again. If it keeps happening, try connecting again.',
  },
  signatureRefused: {
    title: 'You said no in your wallet.',
    text: 'You’re not signed in yet. Signing is free and sends nothing. Tap Sign in to try again.',
  },
  signInRequestExpired: {
    title: 'The sign-in request ran out.',
    text: 'It lasts 5 minutes. Tap Sign in for a new one.',
  },
  signatureInvalid: {
    title: 'Your wallet’s signature didn’t check out.',
    text: 'Tap Sign in to try again. If it keeps happening, try another wallet such as MetaMask.',
  },
  networkSwitchFailed: {
    title: 'Your wallet didn’t switch to Monad Testnet.',
    text: 'Add Monad Testnet in your wallet by hand with the details below, then switch to it. Or sign in anyway: minting works on any network, but the app needs Monad Testnet.',
  },
  turnstileFailed: {
    title: 'The robot check didn’t pass.',
    text: 'Wait a moment for it to reload, then try again.',
  },
  turnstileUnavailable: {
    title: 'The robot check couldn’t load.',
    text: 'Turn off content blockers for this site or try another browser, then reload the page.',
  },
  emailProofInvalid: {
    title: 'Your email check ran out.',
    text: 'It lasts 6 hours. Check your email again above: it takes a minute.',
  },
  signInEnded: {
    title: 'Your sign-in ended.',
    text: 'Sign in with your wallet again above. It’s free.',
  },
  notOpen: {
    title: 'Minting hasn’t opened yet.',
    text: 'Heart the passes you like, and join the waitlist to mint 48 hours before everyone else.',
  },
  waitlistOnly: {
    title: 'Right now, only the waitlist can mint.',
    text: 'This email wasn’t on the waitlist before the window opened. Anyone can mint when the open mint starts. Heart this pass so it’s easy to find.',
  },
  allMinted: {
    title: 'All 1,000 Founding Passes are minted.',
    text: 'No new passes, ever. StrideMon is open to everyone now, with a free Sneaker.',
  },
  mintClosed: {
    title: 'Minting has closed.',
    text: 'StrideMon is open to everyone now, with a free Sneaker. No new passes, ever.',
  },
  alreadyMinted: {
    title: 'Someone minted this one a moment before you.',
    text: 'Nothing was minted for you. These look like it, and nobody has them yet: one tap mints one.',
  },
  mintFailed: {
    title: 'The mint didn’t go through.',
    text: 'Nothing was minted, so you can try again.',
  },
  mintStillQueued: {
    title: 'Your mint is still in the queue.',
    text: 'Mints go one after another, and yours is held for you. Check again in a minute, or come back later: this page picks it up again.',
  },
  mintLostContact: {
    title: 'We lost touch with StrideMon.',
    text: 'Your mint is still in the queue, and nothing is lost. Check your connection, then check again.',
  },
  rateLimited: {
    title: 'Too many tries from this connection.',
    text: 'Wait a little, then try again.',
  },
  unreachable: {
    title: 'We can’t reach StrideMon right now.',
    text: 'Nothing was minted. Check your connection and try again in a minute.',
  },
  unexpected: {
    title: 'Something went wrong on our side.',
    text: 'Nothing was minted. Try again in a minute. If it keeps happening, write to us.',
  },
}

/** Each problem's own answer on /help (D-047). */
export const mintProblemHelpTopicIds: Record<MintProblemKey, HelpTopicId> = {
  emailInvalid: 'code-not-arriving',
  codeFormat: 'wrong-code',
  codeRecentlySent: 'code-not-arriving',
  emailSendFailed: 'code-not-arriving',
  codeIncorrect: 'wrong-code',
  codeExpired: 'wrong-code',
  codeTooManyAttempts: 'wrong-code',
  walletLoadFailed: 'wallet-wont-load',
  walletNotConnected: 'no-wallet',
  walletNotAnswering: 'wallet-not-answering',
  signatureRefused: 'sign-in-failed',
  signInRequestExpired: 'sign-in-failed',
  signatureInvalid: 'sign-in-failed',
  networkSwitchFailed: 'wrong-network',
  turnstileFailed: 'robot-check',
  turnstileUnavailable: 'robot-check',
  emailProofInvalid: 'check-ran-out',
  signInEnded: 'check-ran-out',
  notOpen: 'minting-not-open',
  waitlistOnly: 'waitlist-only',
  allMinted: 'all-minted',
  mintClosed: 'all-minted',
  alreadyMinted: 'pass-taken',
  mintFailed: 'mint-failed',
  mintStillQueued: 'mint-slow',
  mintLostContact: 'mint-slow',
  rateLimited: 'too-many-tries',
  unreachable: 'cant-reach-stridemon',
  unexpected: 'cant-reach-stridemon',
}

export const mintProblemActionLabels = {
  tryAgain: 'Try again',
  checkAgain: 'Check again',
  reload: 'Reload the page',
  mintSimilarPrefix: 'Mint',
  waitPrefix: 'Try again in',
  attemptsLeftSuffix: 'tries left.',
  attemptLeftSuffix: 'try left.',
  opensAtPrefix: 'It opens',
  openMintStartsPrefix: 'The open mint starts',
  getApp: 'Get the app',
} as const
