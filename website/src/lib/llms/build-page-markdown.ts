import {
  buildExplorerAddressUrl,
  explorerName,
  listedContracts,
  onChainContent,
} from '@/content/contracts'
import { fairPlayColumns, fairPlayContent } from '@/content/fair-play'
import { faqContent, frequentlyAskedQuestions } from '@/content/faq'
import {
  foundingPassSectionContent,
  passAppAccessContent,
  passHowItWorksContent,
  passIndexContent,
  passPageContent,
  passPromiseLine,
  passQuestions,
  passQuestionsContent,
  passScheduleContent,
  plannedEarlyHourStartsAt,
  plannedPassScheduleTimes,
} from '@/content/founding-pass'
import { passDesignTables } from '@/content/founding-pass-designs'
import { gameRules, rulesContent, starterSneakerStats } from '@/content/game-rules'
import {
  type HelpAnswer,
  type HelpGuide,
  type HelpLink,
  helpBeforeYouStart,
  helpContactContent,
  helpGuides,
  helpHowItWorks,
  helpLostWalletContent,
  helpNetworkSetupContent,
  helpPageContent,
  helpPlainAnswers,
  helpSections,
  helpTroubleshootingGroups,
} from '@/content/help'
import { heroContent } from '@/content/hero'
import { howItWorksContent, howItWorksSteps } from '@/content/how-it-works'
import { llmsTextContent } from '@/content/llms'
import {
  appInstallPageUrl,
  contentUpdatedOn,
  footerContent,
  helpPath,
  passGalleryPath,
  passIndexPath,
  siteDescription,
  siteTitle,
  waitlistPagePath,
} from '@/content/site'
import { inviteContent, waitlistContent } from '@/content/waitlist'
import { whyMonadContent, whyMonadPoints } from '@/content/why-monad'
import {
  buildPassPagePath,
  formatPassNumber,
  PASS_RARITIES,
  passDesigns,
  passRarityLabels,
} from '@/lib/founding-pass/pass-design'
import {
  buildAbsoluteUrl,
  formatScheduleTime,
  joinMarkdownBlocks,
  renderBulletList,
  renderMarkdownLink,
  renderNumberedList,
  renderTable,
} from './markdown'

// The Markdown copies of the pages that answer questions (D-061), from the same content the pages
// render. They keep the pages' order and headings; screenshots and buttons are left out.

/** The line under every page's summary: the two facts that must travel with any quote. */
function renderStatusLine(): string {
  return `${footerContent.builtOnLine} ${footerContent.noValueLine} ${llmsTextContent.updatedPrefix} ${contentUpdatedOn}.`
}

function renderWebPageLine(pagePath: string): string {
  return `${llmsTextContent.webPagePrefix} ${buildAbsoluteUrl(pagePath)}`
}

function renderQuestions(questions: readonly { question: string; answer: string }[]): string {
  return questions.map((item) => `### ${item.question}\n\n${item.answer}`).join('\n\n')
}

export function buildHomeMarkdown(): string {
  return joinMarkdownBlocks([
    `# ${siteTitle}`,
    `> ${siteDescription}`,
    renderStatusLine(),
    heroContent.intro,
    renderBulletList([
      renderMarkdownLink(heroContent.getPassLabel, passGalleryPath),
      `${renderMarkdownLink(heroContent.getAppLabel, appInstallPageUrl)}. ${heroContent.appReviewNote}`,
    ]),
    `## ${foundingPassSectionContent.heading}`,
    foundingPassSectionContent.intro,
    passPromiseLine,
    renderMarkdownLink(foundingPassSectionContent.galleryLabel, passGalleryPath),
    `## ${howItWorksContent.heading}`,
    renderNumberedList(howItWorksSteps.map((step) => `**${step.title}.** ${step.description}`)),
    `## ${rulesContent.heading}`,
    renderTable(
      ['Rule', 'Value', 'What it means'],
      gameRules.map((rule) => [
        rule.label,
        `${rule.value.toFixed(rule.fractionDigits)} ${rule.unit}`,
        rule.explanation,
      ]),
    ),
    `${rulesContent.starterSneakerLabel}: ${starterSneakerStats.map((stat) => `${stat.label.toLowerCase()} ${stat.value}`).join(', ')}.`,
    rulesContent.footnote,
    `## ${fairPlayContent.heading}`,
    ...fairPlayColumns.flatMap((column) => [
      `### ${column.label}: ${column.heading}`,
      renderBulletList(column.points),
    ]),
    `## ${onChainContent.heading}`,
    onChainContent.intro,
    renderTable(
      ['Contract', 'Standard', 'What it is', `Address (${explorerName})`],
      listedContracts.map((contract) => [
        contract.name,
        contract.standard,
        contract.role,
        renderMarkdownLink(contract.address, buildExplorerAddressUrl(contract.address)),
      ]),
    ),
    `### ${onChainContent.artHeading}`,
    onChainContent.artText,
    `## ${whyMonadContent.heading}`,
    renderBulletList(whyMonadPoints.map((point) => `**${point.title}.** ${point.description}`)),
    `## ${waitlistContent.heading}`,
    waitlistContent.intro,
    waitlistContent.promise,
    renderMarkdownLink(waitlistContent.submitLabel, waitlistPagePath),
    `## ${faqContent.heading}`,
    renderQuestions(frequentlyAskedQuestions),
    renderMarkdownLink(faqContent.helpLabel, helpPath),
    renderWebPageLine('/'),
  ])
}

// The schedule panel's dates, with the early hour (D-058) in its place, just before the window.
function renderPassSchedule(): string {
  const earlyHourLine = `**Early hour**: ${formatScheduleTime(plannedEarlyHourStartsAt)}. ${inviteContent.inviteRulePrefix.replace(/:$/, '.')}${inviteContent.inviteRuleSuffix.replace(/^\./, '')}`
  return renderBulletList(
    passScheduleContent.steps.flatMap((step) => {
      if (step.timeKey === null) return [`**${step.title}.** ${step.description}`]
      const stepLine = `**${step.title}**: ${formatScheduleTime(plannedPassScheduleTimes[step.timeKey])}. ${step.description}`
      return step.phase === 'waitlistWindow' ? [earlyHourLine, stepLine] : [stepLine]
    }),
  )
}

function renderPassDesignSummary(): string {
  const rarityCounts = PASS_RARITIES.map((rarity) => {
    const designCount = passDesigns.filter((design) => design.rarity === rarity).length
    return `${passRarityLabels[rarity]} ${designCount}`
  })
  return joinMarkdownBlocks([
    `## ${llmsTextContent.passDesignsHeading}`,
    llmsTextContent.buildPassDesignsLine(
      passDesignTables.templates.length,
      passDesignTables.colorFamilies.length,
      passDesignTables.colorways.length,
    ),
    `${llmsTextContent.rarityCountsLabel} ${rarityCounts.join(', ')}.`,
    llmsTextContent.templatesLabel,
    renderBulletList(
      passDesignTables.templates.map(
        (template) =>
          `**${template.label}.** ${template.description} ${llmsTextContent.legendaryNamePrefix} ${template.legendaryName}.`,
      ),
    ),
    renderMarkdownLink(passIndexContent.title, passIndexPath),
  ]).trimEnd()
}

export function buildPassMarkdown(): string {
  return joinMarkdownBlocks([
    `# ${passPageContent.title}`,
    `> ${passPageContent.description}`,
    renderStatusLine(),
    passPageContent.intro,
    passPromiseLine,
    `## ${passScheduleContent.datesHeading}`,
    renderPassSchedule(),
    `**${passAppAccessContent.label}.** ${passAppAccessContent.testPeriodText}`,
    `## ${passHowItWorksContent.heading}`,
    renderNumberedList(
      passHowItWorksContent.steps.map((step) => `**${step.title}.** ${step.description}`),
    ),
    renderPassDesignSummary(),
    `## ${passQuestionsContent.heading}`,
    renderQuestions(passQuestions),
    `${passQuestionsContent.helpPrompt} ${passQuestionsContent.supportEmail} ${passQuestionsContent.helpOr} ${passQuestionsContent.xAccountHandle} (${passQuestionsContent.xAccountUrl}).`,
    renderMarkdownLink(passQuestionsContent.helpLabel, helpPath),
    renderWebPageLine(passGalleryPath),
  ])
}

export function buildPassIndexMarkdown(): string {
  return joinMarkdownBlocks([
    `# ${passIndexContent.metaTitle}`,
    `> ${passIndexContent.description}`,
    renderStatusLine(),
    renderTable(
      ['Pass', 'Name', 'Rarity', 'Shape', 'Colour family', 'Colourway', 'Details', 'Laces'],
      passDesigns.map((design) => [
        renderMarkdownLink(
          formatPassNumber(design.designNumber),
          buildPassPagePath(design.designNumber),
        ),
        design.name,
        passRarityLabels[design.rarity],
        design.template.label,
        design.colorFamily.label,
        design.colorway.label,
        design.options
          .map((option) => `${option.value.label} ${option.slot.label.toLowerCase()}`)
          .join(', '),
        design.laceColor.label,
      ]),
    ),
    renderWebPageLine(passIndexPath),
  ])
}

function renderHelpLinks(links: readonly HelpLink[] | undefined): string | null {
  if (links === undefined || links.length === 0) return null
  return renderBulletList(links.map((link) => renderMarkdownLink(link.label, link.href, helpPath)))
}

function renderHelpGuide(guide: HelpGuide): string {
  return joinMarkdownBlocks([
    `### ${guide.title}`,
    guide.intro,
    renderNumberedList(guide.steps),
    guide.hasNetworkSetup === true
      ? `${helpNetworkSetupContent.detailsHeading}:\n\n${renderTable(
          ['Field', 'Value'],
          helpNetworkSetupContent.details.map((detail) => [detail.label, detail.value]),
        )}`
      : null,
    guide.note,
    renderHelpLinks(guide.links),
  ]).trimEnd()
}

function renderHelpAnswer(answer: HelpAnswer, headingLevel: '###' | '####'): string {
  return joinMarkdownBlocks([
    `${headingLevel} ${answer.question}`,
    ...answer.paragraphs,
    answer.steps === undefined ? null : renderNumberedList(answer.steps),
    renderHelpLinks(answer.links),
  ]).trimEnd()
}

function readHelpSectionTitle(sectionId: (typeof helpSections)[number]['id']): string {
  return helpSections.find((section) => section.id === sectionId)?.title ?? sectionId
}

export function buildHelpMarkdown(): string {
  return joinMarkdownBlocks([
    `# ${helpPageContent.metaTitle}`,
    `> ${helpPageContent.description}`,
    renderStatusLine(),
    helpPageContent.intro,
    `## ${readHelpSectionTitle('how-it-works')}`,
    renderNumberedList(helpHowItWorks.map((step) => `**${step.title}.** ${step.text}`)),
    `## ${readHelpSectionTitle('before-you-start')}`,
    renderBulletList(helpBeforeYouStart.items),
    helpBeforeYouStart.noMoneyLine,
    `## ${readHelpSectionTitle('guides')}`,
    ...helpGuides.map(renderHelpGuide),
    `## ${readHelpSectionTitle('answers')}`,
    ...helpPlainAnswers.map((answer) => renderHelpAnswer(answer, '###')),
    `## ${readHelpSectionTitle('something-went-wrong')}`,
    ...helpTroubleshootingGroups.flatMap((group) => [
      `### ${group.heading}`,
      ...group.answers.map((answer) => renderHelpAnswer(answer, '####')),
    ]),
    `## ${readHelpSectionTitle('lost-wallet')}`,
    ...helpLostWalletContent.paragraphs,
    renderNumberedList(helpLostWalletContent.steps),
    helpLostWalletContent.note,
    `## ${readHelpSectionTitle('contact')}`,
    `${helpContactContent.intro} ${helpContactContent.supportEmail}`,
    `${helpContactContent.includeHeading}:`,
    renderBulletList(helpContactContent.includeItems),
    helpContactContent.note,
    `${helpContactContent.xPrompt} ${renderMarkdownLink(helpContactContent.xAccountHandle, helpContactContent.xAccountUrl)}`,
    renderWebPageLine(helpPath),
  ])
}
