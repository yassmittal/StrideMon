// Site-wide facts. `siteUrl` is the one place the domain lives (D-035, D-040). Vercel's domain
// redirects send `www.stridemon.xyz` and the old `stridemon.yashmittal.xyz` here.
export const siteUrl = 'https://stridemon.xyz'

/**
 * The hosted StrideMon API, which allows this site's origin on its browser routes (D-037, D-043).
 * `NEXT_PUBLIC_API_BASE_URL` overrides it for a local run (website/README.md → Waitlist).
 */
export const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.stridemon.xyz'

/**
 * Where the waitlist form posts (D-037). It moves with `NEXT_PUBLIC_API_BASE_URL` only: the
 * invites routes live beside it (D-056), so the old `NEXT_PUBLIC_WAITLIST_API_URL` is ignored.
 */
export const waitlistApiUrl = `${apiBaseUrl}/v1/waitlist`

/** The gallery's live state: minted designs, recent mints, the schedule (D-043, D-044). */
export const passCollectionApiUrl = `${apiBaseUrl}/v1/pass/collection`

/** The waitlist's invites and its public count (D-056). */
export const waitlistApiUrls = {
  invitesSession: `${apiBaseUrl}/v1/waitlist/invites-session`,
  invites: `${apiBaseUrl}/v1/waitlist/invites`,
  count: `${apiBaseUrl}/v1/waitlist/count`,
} as const

/** The help chatbot on /pass and /help (D-048). */
export const helpChatApiUrl = `${apiBaseUrl}/v1/help/chat`

/** The mint's routes (D-043, D-045): the app's own sign-in, the email check and the mint. */
export const passApiUrls = {
  authNonce: `${apiBaseUrl}/v1/auth/nonce`,
  authVerify: `${apiBaseUrl}/v1/auth/verify`,
  authRefresh: `${apiBaseUrl}/v1/auth/refresh`,
  emailCode: `${apiBaseUrl}/v1/pass/email-code`,
  emailVerify: `${apiBaseUrl}/v1/pass/email-verify`,
  emailGoogle: `${apiBaseUrl}/v1/pass/email-google`,
  mints: `${apiBaseUrl}/v1/pass/mints`,
} as const

/**
 * The app's Reown project (D-041, D-045). Public: it ships in the APK too. Reown's dashboard must
 * allow this site's domain.
 */
export const reownProjectId =
  process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ?? 'ea460b58f93f44c50993ce1f67e6cee8'

/**
 * Where the site reads the pass's on-chain picture and a wallet's pass (D-045). A local run points
 * it at its own Anvil (`NEXT_PUBLIC_MONAD_RPC_URL`); wallets are always given the public one.
 */
export const monadPublicRpcUrl = 'https://testnet-rpc.monad.xyz'
export const monadRpcUrl = process.env.NEXT_PUBLIC_MONAD_RPC_URL ?? monadPublicRpcUrl

/**
 * Cloudflare Turnstile's site key for the `stridemon.xyz` widget (D-041, D-045). Public by design.
 * A local run uses Cloudflare's always-pass test key (`1x00000000000000000000AA`): this one only
 * works on the widget's own hostnames.
 */
export const turnstileSiteKey =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '0x4AAAAAAFRleBaVJ9eZuqBJ'

/**
 * The Sign in with Google client (D-057), the same one the API checks tokens against. Public, not a
 * secret. An empty `NEXT_PUBLIC_GOOGLE_CLIENT_ID` hides Continue with Google (say, for a local run
 * reached through a tunnel, whose hostname can't be a Google origin).
 */
export const googleClientId =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ??
  '678017486118-vpp6dtbgdmf6s3p26l5c6h2abaome7jk.apps.googleusercontent.com'

/** The Founding Pass gallery (D-041), and the help page every error links to (D-047). */
export const passGalleryPath = '/pass'
/** Every pass by number, so each pass page has a link search engines can follow (D-051). */
export const passIndexPath = '/pass/all'
export const helpPath = '/help'
/** The waitlist on a page of its own, the link a joined visitor posts on X (D-055). */
export const waitlistPagePath = '/waitlist'
/** A waitlist sign-up's invites: their link, their confirmed friends, the early hour (D-056). */
export const waitlistInvitesPath = '/waitlist/invites'

/**
 * The Markdown copies of the pages that answer questions, for answer engines and agents (D-061).
 * Each page links its own with `rel="alternate"`, and `/llms.txt` lists them.
 */
export const markdownPagePaths = {
  home: '/index.md',
  pass: '/pass.md',
  passIndex: '/pass/all.md',
  help: '/help.md',
} as const

/** The llmstxt.org index of the site, and everything in one file (D-061). */
export const llmsTextPath = '/llms.txt'
export const llmsFullTextPath = '/llms-full.txt'

/**
 * The day the main pages last changed in substance (D-061): the sitemap's `lastmod`, the
 * structured data's `dateModified` and `/llms.txt`. Change it with real copy changes, not on every
 * deploy.
 */
export const contentUpdatedOn = '2026-10-19'

/**
 * IndexNow's key (D-061). Public by design: `public/<key>.txt` must hold exactly this, so the
 * search engines know the submission is ours. `bun run indexnow` sends the sitemap with it.
 */
export const indexNowKey = 'a2f1f0e28378b2ab2ebd7f7b291742e2'

export const siteName = 'StrideMon'

/** Who builds StrideMon, for the structured data and `/llms.txt` (D-061). */
export const creator = {
  name: 'Yash Mittal',
  xUrl: 'https://x.com/yash_mittal_dev',
  githubUrl: 'https://github.com/yassmittal',
} as const

/** The public contact for privacy and account deletion (D-039), also on the Play listing. */
export const supportEmail = 'yashmittalmm@gmail.com'

/** Google Play asks for both pages (D-039). The app links to the privacy policy. */
export const legalPagePaths = {
  privacyPolicy: '/privacy',
  deleteAccount: '/delete-account',
} as const

export const githubRepositoryUrl = 'https://github.com/yassmittal/StrideMon'

/**
 * Every "Get the app" button (D-045, D-052): the Android `demo` build's page on expo.dev, as in the
 * README's "Try it". A page, not the bare APK, so nobody gets a file they didn't ask for: it shows
 * an Install button on a phone and a QR code on a laptop. A new `demo` build means a new link here.
 * The Google Play listing replaces it once its review passes.
 */
export const appInstallPageUrl =
  'https://expo.dev/accounts/yashmittal/projects/stridemon/builds/f62511df-a727-40ca-aff1-d2aaa1096265'

// The product's X account and the builder's (D-036). Handles keep their `@`.
export const xAccountHandle = '@stridemon'
export const xAccountUrl = 'https://x.com/stridemon'
export const xCreatorHandle = '@yash_mittal_dev'

/** The product's YouTube channel (D-059). */
export const youtubeChannelUrl = 'https://www.youtube.com/@stridemon'

/** X's card fields. A page that sets its own `twitter` metadata spreads these in, or loses them. */
export const xCardMetadata = {
  card: 'summary_large_image',
  site: xAccountHandle,
  creator: xCreatorHandle,
} as const

export const siteTitle = 'StrideMon: walk, earn and upgrade a Sneaker NFT on Monad'

export const siteDescription =
  'A move-to-earn game on Monad. Own a Sneaker NFT, walk or run to earn STRIDE, and spend it to repair and level up your Sneaker.'

export const siteMetaLabels = ['StrideMon', 'Move to earn', 'Monad'] as const

// Links start at `/` so they also work from the other pages.
export type NavigationLink = {
  label: string
  href: `/${string}`
}

export const sectionIds = {
  foundingPass: 'founding-pass',
  howItWorks: 'how-it-works',
  rules: 'rules',
  fairPlay: 'fair-play',
  onChain: 'on-chain',
  whyMonad: 'why-monad',
  underTheHood: 'under-the-hood',
  waitlist: 'waitlist',
  faq: 'faq',
} as const

/** Three links, the same on every page (D-050). The pills carry the waitlist and X. */
export const navigationLinks: readonly NavigationLink[] = [
  { label: 'Founding Pass', href: passGalleryPath },
  { label: 'The game', href: `/#${sectionIds.howItWorks}` },
  { label: 'Help', href: helpPath },
]

export const headerContent = {
  followLabel: 'Follow',
  followAccessibleLabel: `Follow StrideMon on X (${xAccountHandle})`,
  youtubeAccessibleLabel: 'StrideMon on YouTube',
  waitlistLabel: 'Join waitlist',
} as const

export const footerContent = {
  builtOnLine: 'Built on Monad testnet for a hackathon.',
  noValueLine: 'STRIDE has no monetary value.',
  githubLabel: 'GitHub',
  youtubeLabel: 'YouTube',
  foundingPassLabel: 'Founding Pass',
  helpLabel: 'Help',
  privacyPolicyLabel: 'Privacy',
  deleteAccountLabel: 'Delete account',
} as const
