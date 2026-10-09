// Site-wide facts. `siteUrl` is the one place the domain lives (D-035, D-040). Vercel's domain
// redirects send `www.stridemon.xyz` and the old `stridemon.yashmittal.xyz` here.
export const siteUrl = 'https://stridemon.xyz'

/**
 * The hosted StrideMon API, which allows this site's origin on its browser routes (D-037, D-043).
 * `NEXT_PUBLIC_API_BASE_URL` overrides it for a local run (website/README.md → Waitlist).
 */
export const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.stridemon.xyz'

/**
 * Where the waitlist form posts (D-037). `NEXT_PUBLIC_WAITLIST_API_URL` still overrides it alone,
 * as it did before the Founding Pass.
 */
export const waitlistApiUrl =
  process.env.NEXT_PUBLIC_WAITLIST_API_URL ?? `${apiBaseUrl}/v1/waitlist`

/** The gallery's live state: minted designs, recent mints, the schedule (D-043, D-044). */
export const passCollectionApiUrl = `${apiBaseUrl}/v1/pass/collection`

/** The help chatbot on /pass and /help (D-048). */
export const helpChatApiUrl = `${apiBaseUrl}/v1/help/chat`

/** The mint's routes (D-043, D-045): the app's own sign-in, the email check and the mint. */
export const passApiUrls = {
  authNonce: `${apiBaseUrl}/v1/auth/nonce`,
  authVerify: `${apiBaseUrl}/v1/auth/verify`,
  authRefresh: `${apiBaseUrl}/v1/auth/refresh`,
  emailCode: `${apiBaseUrl}/v1/pass/email-code`,
  emailVerify: `${apiBaseUrl}/v1/pass/email-verify`,
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

/** The Founding Pass gallery (D-041), and the help page every error links to (D-047). */
export const passGalleryPath = '/pass'
export const helpPath = '/help'

export const siteName = 'StrideMon'

/** The public contact for privacy and account deletion (D-039), also on the Play listing. */
export const supportEmail = 'yashmittalmm@gmail.com'

/** Google Play asks for both pages (D-039). The app links to the privacy policy. */
export const legalPagePaths = {
  privacyPolicy: '/privacy',
  deleteAccount: '/delete-account',
} as const

export const githubRepositoryUrl = 'https://github.com/yassmittal/StrideMon'

/**
 * "Get the app" after a mint (D-045): the Android demo build, as in the README's "Try it". Part 6's
 * founder build replaces it.
 */
export const appDownloadUrl =
  'https://expo.dev/artifacts/eas/Aa0J7FXKPHyaKSGL-74nW66qSugLVcvhOMLyRrGL2iY.apk'

// The product's X account and the builder's (D-036). Handles keep their `@`.
export const xAccountHandle = '@stridemon'
export const xAccountUrl = 'https://x.com/stridemon'
export const xCreatorHandle = '@yash_mittal_dev'

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
  waitlist: 'waitlist',
  faq: 'faq',
} as const

export const navigationLinks: readonly NavigationLink[] = [
  { label: 'Founding Pass', href: passGalleryPath },
  { label: 'How it works', href: `/#${sectionIds.howItWorks}` },
  { label: 'Rules', href: `/#${sectionIds.rules}` },
  { label: 'Fair play', href: `/#${sectionIds.fairPlay}` },
  { label: 'On-chain', href: `/#${sectionIds.onChain}` },
  { label: 'Waitlist', href: `/#${sectionIds.waitlist}` },
  { label: 'FAQ', href: `/#${sectionIds.faq}` },
]

export const headerContent = {
  followLabel: 'Follow',
  followAccessibleLabel: `Follow StrideMon on X (${xAccountHandle})`,
  waitlistLabel: 'Join waitlist',
} as const

export const footerContent = {
  builtOnLine: 'Built on Monad testnet for a hackathon.',
  noValueLine: 'STRIDE has no monetary value.',
  githubLabel: 'GitHub',
  helpLabel: 'Help',
  privacyPolicyLabel: 'Privacy',
  deleteAccountLabel: 'Delete account',
} as const
