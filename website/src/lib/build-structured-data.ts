import { demoVideo } from '@/content/demo-video'
import { frequentlyAskedQuestions } from '@/content/faq'
import { passPageContent, passQuestions } from '@/content/founding-pass'
import { type HelpAnswer, helpPlainAnswers, helpTroubleshootingGroups } from '@/content/help'
import {
  appInstallPageUrl,
  contentUpdatedOn,
  creator,
  githubRepositoryUrl,
  passGalleryPath,
  siteDescription,
  siteName,
  siteUrl,
  supportEmail,
  xAccountUrl,
  youtubeChannelUrl,
} from '@/content/site'

type StructuredDataOptions = {
  hasDemoVideo: boolean
}

type QuestionAndAnswer = {
  question: string
  answer: string
}

type BreadcrumbItem = {
  name: string
  path: string
}

// One `@id` per entity (D-061), so the home page's pieces read as one graph: the site, published
// by StrideMon, which its founder builds, and the game it makes.
const structuredDataIds = {
  website: `${siteUrl}/#website`,
  organization: `${siteUrl}/#organization`,
  founder: `${siteUrl}/#founder`,
  videoGame: `${siteUrl}/#game`,
} as const

// ISO 8601, as schema.org's `duration` wants it: 78 seconds is `PT1M18S`.
export function formatIsoDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `PT${minutes}M${seconds}S`
}

function buildDemoVideoObject() {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: demoVideo.structuredDataName,
    description: demoVideo.description,
    thumbnailUrl: `${siteUrl}${demoVideo.posterPath}`,
    contentUrl: `${siteUrl}${demoVideo.filePath}`,
    uploadDate: demoVideo.uploadDate,
    duration: formatIsoDuration(demoVideo.durationSeconds),
  }
}

/** A `FAQPage` from questions the page itself shows. */
function buildFaqPage(questions: readonly QuestionAndAnswer[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
}

/** The trail from the home page to this one. Each item's `path` starts at `/`. */
export function buildBreadcrumbList(items: readonly BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, itemIndex) => ({
      '@type': 'ListItem',
      position: itemIndex + 1,
      name: item.name,
      item: item.path === '/' ? `${siteUrl}/` : `${siteUrl}${item.path}`,
    })),
  }
}

/** Home › Founding Pass, the start of every pass page's trail. */
export const passBreadcrumbItems: readonly BreadcrumbItem[] = [
  { name: siteName, path: '/' },
  { name: passPageContent.headlineWords.join(' '), path: passGalleryPath },
]

// JSON-LD for the home page: the site's name (Google shows it above the result instead of the
// domain), StrideMon as an organization with its logo and founder, the game itself, the FAQ built
// from the same data as the section, and the demo video when it's on the page.
export function buildStructuredData({ hasDemoVideo }: StructuredDataOptions) {
  const profileUrls = [xAccountUrl, youtubeChannelUrl, githubRepositoryUrl]
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': structuredDataIds.website,
      name: siteName,
      url: `${siteUrl}/`,
      inLanguage: 'en',
      publisher: { '@id': structuredDataIds.organization },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': structuredDataIds.organization,
      name: siteName,
      url: `${siteUrl}/`,
      logo: `${siteUrl}/apple-icon`,
      description: siteDescription,
      email: supportEmail,
      founder: {
        '@type': 'Person',
        '@id': structuredDataIds.founder,
        name: creator.name,
        url: creator.xUrl,
        sameAs: [creator.xUrl, creator.githubUrl],
      },
      sameAs: profileUrls,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'VideoGame',
      '@id': structuredDataIds.videoGame,
      name: siteName,
      description: siteDescription,
      url: `${siteUrl}/`,
      image: `${siteUrl}/opengraph-image`,
      gamePlatform: 'Android',
      applicationCategory: 'GameApplication',
      operatingSystem: 'Android',
      genre: 'Move to earn',
      installUrl: appInstallPageUrl,
      isAccessibleForFree: true,
      dateModified: contentUpdatedOn,
      author: { '@id': structuredDataIds.organization },
      publisher: { '@id': structuredDataIds.organization },
      offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
      sameAs: profileUrls,
    },
    buildFaqPage(frequentlyAskedQuestions),
    ...(hasDemoVideo ? [buildDemoVideoObject()] : []),
  ]
}

/** `/pass`: its Questions section, and its place under the home page. */
export function buildPassGalleryStructuredData() {
  return [buildFaqPage(passQuestions), buildBreadcrumbList(passBreadcrumbItems)]
}

function renderHelpAnswerText(answer: HelpAnswer): string {
  const stepTexts = (answer.steps ?? []).map((step, stepIndex) => `${stepIndex + 1}. ${step}`)
  return [...answer.paragraphs, ...stepTexts].join(' ')
}

/** `/help`: every plain answer and every "something went wrong" answer, as the page shows them. */
export function buildHelpStructuredData(helpPageTitle: string, helpPagePath: string) {
  const answers = [
    ...helpPlainAnswers,
    ...helpTroubleshootingGroups.flatMap((group) => group.answers),
  ]
  return [
    buildFaqPage(
      answers.map((answer) => ({
        question: answer.question,
        answer: renderHelpAnswerText(answer),
      })),
    ),
    buildBreadcrumbList([
      { name: siteName, path: '/' },
      { name: helpPageTitle, path: helpPagePath },
    ]),
  ]
}

// `<` is escaped so the JSON can never close the <script> tag it sits in.
export function serializeStructuredData(structuredData: unknown): string {
  return JSON.stringify(structuredData).replace(/</g, '\\u003c')
}
