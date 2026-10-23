import { plannedPassScheduleTimes } from '@/content/founding-pass'
import { llmsTextContent } from '@/content/llms'
import {
  contentUpdatedOn,
  creator,
  githubRepositoryUrl,
  legalPagePaths,
  llmsFullTextPath,
  markdownPagePaths,
  showroomUrl,
  siteName,
  waitlistPagePath,
  xAccountUrl,
  youtubeChannelUrl,
} from '@/content/site'
import { buildHelpMarkdown, buildHomeMarkdown, buildPassMarkdown } from './build-page-markdown'
import {
  formatScheduleTime,
  joinMarkdownBlocks,
  renderBulletList,
  renderMarkdownLink,
} from './markdown'

// `/llms.txt` in the llmstxt.org shape (D-061): an H1, a one-line summary, the key facts as a
// list (no headings), then link lists, with what an agent can skip under "Optional".

const { linkLabels, pageNotes } = llmsTextContent

function renderLinkLine(label: string, href: string, note: string): string {
  return `${renderMarkdownLink(label, href)}: ${note}`
}

function renderScheduleFact(): string {
  const { waitlistWindowStartsAt, openMintStartsAt, backupOpeningAt } = plannedPassScheduleTimes
  return `${llmsTextContent.scheduleFactPrefix} the waitlist window opens ${formatScheduleTime(waitlistWindowStartsAt)}; the open mint starts ${formatScheduleTime(openMintStartsAt)}; StrideMon opens to everyone when all 1,000 are minted, or on ${formatScheduleTime(backupOpeningAt)} at the latest.`
}

export function buildLlmsText(): string {
  return joinMarkdownBlocks([
    `# ${siteName}`,
    `> ${llmsTextContent.summary}`,
    renderBulletList([...llmsTextContent.keyFacts, renderScheduleFact()]),
    `${llmsTextContent.builtByPrefix} ${renderMarkdownLink(creator.name, creator.xUrl)}. ${llmsTextContent.updatedPrefix} ${contentUpdatedOn}.`,
    `## ${llmsTextContent.pagesHeading}`,
    renderBulletList([
      renderLinkLine(linkLabels.home, markdownPagePaths.home, pageNotes.home),
      renderLinkLine(linkLabels.pass, markdownPagePaths.pass, pageNotes.pass),
      renderLinkLine(linkLabels.help, markdownPagePaths.help, pageNotes.help),
      renderLinkLine(linkLabels.waitlist, waitlistPagePath, pageNotes.waitlist),
    ]),
    `## ${llmsTextContent.optionalHeading}`,
    renderBulletList([
      renderLinkLine(linkLabels.passIndex, markdownPagePaths.passIndex, pageNotes.passIndex),
      renderLinkLine(linkLabels.fullText, llmsFullTextPath, pageNotes.fullText),
      renderLinkLine(
        linkLabels.privacyPolicy,
        legalPagePaths.privacyPolicy,
        pageNotes.privacyPolicy,
      ),
      renderLinkLine(
        linkLabels.deleteAccount,
        legalPagePaths.deleteAccount,
        pageNotes.deleteAccount,
      ),
      renderLinkLine(linkLabels.showroom, showroomUrl, pageNotes.showroom),
      renderLinkLine(linkLabels.github, githubRepositoryUrl, pageNotes.github),
      renderLinkLine(linkLabels.x, xAccountUrl, pageNotes.x),
      renderLinkLine(linkLabels.youtube, youtubeChannelUrl, pageNotes.youtube),
    ]),
  ])
}

/** `/llms-full.txt`: the three answer pages in one file, each starting at its own H1. */
export function buildLlmsFullText(): string {
  return joinMarkdownBlocks(
    [buildHomeMarkdown(), buildPassMarkdown(), buildHelpMarkdown()].map((page) => page.trimEnd()),
  )
}
