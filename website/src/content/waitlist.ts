import type { HelpTopicId } from '@/content/help'
import { earlyHourRules } from './founding-pass'
import { siteUrl, waitlistPagePath, xAccountHandle } from './site'

// The waitlist (D-037) and its invite loop (D-056), simplified in D-059: one job per screen. Email
// only, never a wallet. Its promise (D-056): a code only when you ask for one, and one email when
// the waitlist window opens. Words (social/voice.md): invite, confirmed friends, the early hour.
// Never whitelist, WL, allowlist, points, rank, unlock, or anything about value.

export const waitlistContent = {
  metaLabels: ['Waitlist', 'Founding Pass'],
  heading: 'Join the waitlist to mint 48 hours before everyone else.',
  /** What and when. The early hour waits until after joining (D-059). */
  intro:
    '1,000 free Founding Passes, each a different Sneaker design. The waitlist mints first, from 28 November.',
  googleInAppBrowserNote:
    'Google sign-in doesn’t work inside this app. Use your email, or open this page in Chrome or Safari.',
  orLabel: 'or',
  emailLabel: 'Email',
  emailPlaceholder: 'you@example.com',
  submitLabel: 'Join the waitlist',
  submittingLabel: 'Joining',
  googleJoiningLabel: 'Joining with Google',
  /** While a sign-up saved in this browser loads its invites (D-059). */
  restoringLabel: 'Loading your invites',
  promise:
    'We email you a code only when you ask for one, and once when the waitlist window opens. Nothing else, and nothing is for sale.',
  privacyLabel: 'Privacy',
  /** From 1,000 sign-ups only (D-056): the waitlist is then bigger than the collection. */
  buildCountLine: (signupCount: number) =>
    `${signupCount.toLocaleString('en-US')} people on the waitlist for 1,000 passes`,
  countShownFrom: 1000,
  /** After the window opens, joining no longer gets anyone into it (D-043). */
  closedHeading: 'The waitlist window has opened.',
  closedTextPrefix:
    'Joining now doesn’t get you into it. Anyone can mint what’s left in the open mint, from',
  closedOpenMintText: 'The open mint is on: anyone can mint a pass nobody has taken.',
  closedOpenToAllHeading: 'Minting has closed.',
  closedOpenToAllText: 'StrideMon is open to everyone now, with a free Sneaker.',
  closedGalleryLabel: 'See the passes',
} as const

/** The ticket that replaces the form after joining, and when coming back (D-055, D-059). */
export const waitlistJoinedContent = {
  ticketLabel: 'Waitlist',
  ticketStatus: 'Joined',
  heading: 'You’re on the list.',
  windowLabel: 'Window opens',
  changeEmailLabel: 'Change',
  changeEmailAccessibleLabel: 'Change your email',
} as const

/** The invite link, the share links and the early hour, on the card and on /waitlist/invites. */
export const inviteContent = {
  earlyHourHeading: 'Open your window an hour early',
  /** D-056 point 9: the rule, the cap and that the waitlist promises no pass, in one paragraph. */
  earlyHourRulePrefix: `Bring ${earlyHourRules.requiredFriendCount} friends who join with your link and confirm their email. Your window then opens`,
  earlyHourRuleSuffix: `, while the ${earlyHourRules.mintLimit} early passes last. The waitlist doesn’t promise a pass.`,
  linkLabel: 'Your invite link',
  copyLabel: 'Copy',
  copiedLabel: 'Copied',
  whatsAppLabel: 'WhatsApp',
  telegramLabel: 'Telegram',
  xLabel: 'X',
  shareSheetLabel: 'More',
  shareOnPrefix: 'Share on',
  postOnXLabel: 'Post on X',
  shareSheetAccessibleLabel: 'Share with another app',
  opensInNewTab: '(opens in a new tab)',
  buildProgressLine: (confirmedFriendCount: number, requiredFriendCount: number) =>
    confirmedFriendCount > requiredFriendCount
      ? `${confirmedFriendCount} friends confirmed`
      : `${confirmedFriendCount} of ${requiredFriendCount} friends confirmed`,
  hasEarlyHourHeading: 'You have the early hour.',
  hasEarlyHourPrefix: 'Your window opens',
  hasEarlyHourSuffix: `, an hour before the rest of the waitlist, while the ${earlyHourRules.mintLimit} early passes last. It doesn’t promise a pass.`,
  reminderLabel: 'Add a reminder',
  googleCalendarLabel: 'Google Calendar',
  icsLabel: 'Apple or Outlook',
  icsFileName: 'stridemon-early-hour.ics',
  reminderTitle: 'StrideMon: your Founding Pass early hour',
  reminderDetails:
    'Your early hour: mint a free Founding Pass before the rest of the waitlist, while the 250 early passes last. Check the email you joined with at https://stridemon.xyz/pass',
  nightHeading: 'On the night',
  nightFavouritesLinkLabel: 'Heart the passes you like',
  nightFavouritesSuffix: ' now, so they’re easy to find.',
  nightSteps: [
    'A little before your window, open stridemon.xyz/pass and check this same email (Google is one tap).',
    'Pick a pass and mint. It’s free, with no gas to pay. If you miss the hour, your 48-hour waitlist window still opens an hour later.',
  ],
  keepSharingText:
    'Keep sharing if you like: friends who join through your link get the 48 hours too.',
  howInvitesCountLabel: 'How invites count',
  invitesPageLabel: 'Your invites page',
} as const

/** "Confirm your email" on the card after an email join, and the check on /waitlist/invites. */
export const waitlistEmailCheckContent = {
  /** Only after joining through a friend's link: the code makes them count (D-059). */
  confirmForFriendHeading: 'Confirm your email to count for your friend',
  confirmForFriendText:
    'You joined through a friend’s link. We send a 6-digit code, and it takes a minute.',
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
  confirmedLine: 'Email confirmed.',
} as const

/** `/waitlist/invites` (D-056): static, not indexed. Every state has a next step. */
export const waitlistInvitesPageContent = {
  title: 'Your invites',
  description:
    'Your StrideMon waitlist invite link, how many friends have confirmed, and whether you have the early hour.',
  metaLabels: ['Waitlist', 'Invites'],
  heading: 'Your invites',
  checkIntro: 'Check the email you joined with to see your link and your friends.',
  checkingLabel: 'Loading your invites',
  useAnotherEmailLabel: 'Use a different email',
  notOnListHeading: 'This email isn’t on the waitlist yet.',
  notOnListText: 'Join with it now: your invite link is ready the moment you do.',
  joinWithEmailLabel: 'Join with this email',
  joiningLabel: 'Joining',
  joinTheWaitlistLabel: 'Go to the waitlist',
  tryAgainLabel: 'Try again',
} as const

export type WaitlistProblemKey =
  | 'emailInvalid'
  | 'emailDisposable'
  | 'turnstileFailed'
  | 'turnstileUnavailable'
  | 'codeFormat'
  | 'codeRecentlySent'
  | 'emailSendFailed'
  | 'codeIncorrect'
  | 'codeExpired'
  | 'codeTooManyAttempts'
  | 'emailDailyLimitReached'
  | 'googleUnavailable'
  | 'googleFailed'
  | 'emailCheckEnded'
  | 'rateLimited'
  | 'unreachable'
  | 'unexpected'

/** One plain message per problem, with what to do next. Each links its own help answer. */
export const waitlistProblemContent: Record<WaitlistProblemKey, { title: string; text: string }> = {
  emailInvalid: {
    title: 'That email doesn’t look right.',
    text: 'Check it for a typo, then try again.',
  },
  emailDisposable: {
    title: 'That looks like a temporary inbox.',
    text: 'Use an email you’ll still have on 28 November: the window’s one email goes there.',
  },
  turnstileFailed: {
    title: 'The robot check didn’t pass.',
    text: 'Wait a moment for it to reload, then try again. If the page has been open a long time, reload it.',
  },
  turnstileUnavailable: {
    title: 'The robot check couldn’t load.',
    text: 'Turn off content blockers for this site or try another browser, then reload the page.',
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
    text: 'Something went wrong on our side. Try again in a minute, or continue with Google.',
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
  emailDailyLimitReached: {
    title: 'We’ve sent all the codes we can for today.',
    text: 'Continue with Google instead, or come back tomorrow. You’re still on the waitlist either way.',
  },
  googleUnavailable: {
    title: 'Google sign-in isn’t working right now.',
    text: 'Use your email instead, or try again in a minute.',
  },
  googleFailed: {
    title: 'Google didn’t confirm your email.',
    text: 'Try again, or use your email instead.',
  },
  emailCheckEnded: {
    title: 'Your email check ran out.',
    text: 'Check your email again: it takes a minute, or one tap with Google.',
  },
  rateLimited: {
    title: 'Too many tries from this connection.',
    text: 'Wait a little, then try again.',
  },
  unreachable: {
    title: 'We can’t reach StrideMon right now.',
    text: 'Check your connection and try again in a minute.',
  },
  unexpected: {
    title: 'Something went wrong on our side.',
    text: 'Try again in a minute. If it keeps happening, write to us.',
  },
}

export const waitlistProblemHelpTopicIds: Record<WaitlistProblemKey, HelpTopicId> = {
  emailInvalid: 'code-not-arriving',
  emailDisposable: 'temporary-inbox',
  turnstileFailed: 'robot-check',
  turnstileUnavailable: 'robot-check',
  codeFormat: 'wrong-code',
  codeRecentlySent: 'code-not-arriving',
  emailSendFailed: 'code-not-arriving',
  codeIncorrect: 'wrong-code',
  codeExpired: 'wrong-code',
  codeTooManyAttempts: 'wrong-code',
  emailDailyLimitReached: 'codes-stopped-today',
  googleUnavailable: 'google-in-app-browser',
  googleFailed: 'google-in-app-browser',
  emailCheckEnded: 'lost-invite-link',
  rateLimited: 'too-many-tries',
  unreachable: 'cant-reach-stridemon',
  unexpected: 'cant-reach-stridemon',
}

/** Where a shared X post sends people: the waitlist page, with a source the form stores (D-037). */
export const waitlistShareUrl = `${siteUrl}${waitlistPagePath}?source=x-waitlist`

/**
 * The post X opens with (D-055, `social/voice.md`): what StrideMon is, why join, one tag. With
 * the link (23 characters on X) it stays under 280.
 */
export const waitlistShareText = [
  `I joined the ${xAccountHandle} waitlist.`,
  'StrideMon: walk with a Sneaker NFT on Monad testnet, earn STRIDE, and spend it to level the Sneaker up.',
  'People on the waitlist mint a free Founding Pass 48 hours before everyone else.',
].join('\n\n')

/**
 * WhatsApp, Telegram and the phone's share sheet (D-056, `social/voice.md`): a message from a
 * friend, not an ad. No hashtags, no emoji, nothing about value. The link follows it.
 */
export const inviteShareText =
  'I’m on the StrideMon waitlist. On 28 November, 1,000 free Founding Passes open, each a different Sneaker design, and the waitlist picks first. It only takes an email:'

/** `/waitlist`, the page a shared post links to, and its share image (D-055). */
export const waitlistPageContent = {
  title: 'Join the waitlist',
  description:
    'Leave your email to mint a free StrideMon Founding Pass 48 hours before everyone else. We email you a code only when you ask for one, and once when the waitlist window opens.',
  shareImageAlt:
    'Join the StrideMon waitlist: mint a free Founding Pass 48 hours before everyone else.',
  shareImageMetaLabels: ['StrideMon', 'Waitlist', 'Founding Pass'],
  shareImageHeadlineWords: ['Join the', 'waitlist'],
  shareImageSubline: 'Mint a free Founding Pass 48 hours before everyone else.',
  shareImageFacts: [
    { label: 'Head start', value: '48 hours' },
    { label: 'Founding Pass', value: 'Free' },
  ],
  /** The share image's shoes: four of the six on the landing page. */
  showcaseDesignNumbers: [155, 185, 137, 200],
} as const
