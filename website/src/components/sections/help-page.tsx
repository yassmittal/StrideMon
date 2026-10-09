import type { ReactNode } from 'react'
import {
  type HelpAnswer,
  type HelpGuide,
  type HelpLink,
  type HelpScreenshot,
  type HelpTopicId,
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
  listHelpTopicIds,
} from '@/content/help'
import { screenshots } from '@/content/screenshots'
import { AddMonadTestnetButton } from '../help/add-monad-testnet-button'
import { ArrowIcon } from '../ui/arrow-icon'
import { MetaLabel } from '../ui/meta-label'
import { PhoneFrame } from '../ui/phone-frame'
import { XLogoIcon } from '../ui/x-logo-icon'
import { SiteFooter } from './site-footer'
import { SiteHeader } from './site-header'

const paragraphClass = 'text-lg leading-[1.45] text-ink-secondary-small'
const linkClass =
  'group inline-flex min-h-11 items-center gap-2 text-label font-medium tracking-[0.08em] uppercase'

assertUniqueHelpTopicIds()

/**
 * The help page (Part 7, D-047): one readable page, every answer open, so a link from an error
 * (`/help#wrong-code`) always lands on its text. No motion.
 */
export function HelpPage() {
  return (
    <>
      <SiteHeader />
      <main className="page-gutter page-container pt-10 pb-16 md:pt-16 md:pb-24">
        <header className="flex max-w-[44rem] flex-col gap-5">
          <MetaLabel items={helpPageContent.metaLabels} />
          <h1 className="-ml-[0.04em] text-heading text-balance">{helpPageContent.title}</h1>
          <p className="text-intro">{helpPageContent.intro}</p>
          <nav aria-label={helpPageContent.contentsLabel} className="pt-2">
            <p className="text-label font-medium tracking-[0.08em] text-ink-secondary-small uppercase">
              {helpPageContent.contentsLabel}
            </p>
            <ul className="flex flex-wrap gap-x-5">
              {helpSections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="inline-flex min-h-11 items-center underline decoration-hairline underline-offset-4"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <HelpSection id="how-it-works">
          <ol className="flex flex-col gap-5">
            {helpHowItWorks.map((step, stepIndex) => (
              <li key={step.title} className="grid grid-cols-[2.5rem_1fr] gap-x-2">
                <span className="font-mono text-sm leading-[1.9] text-ink-secondary-small">
                  {String(stepIndex + 1).padStart(2, '0')}
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="text-xl leading-[1.25]">{step.title}</h3>
                  <p className={paragraphClass}>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </HelpSection>

        <HelpSection id="before-you-start">
          <ul className="flex list-disc flex-col gap-2 pl-5 text-lg leading-[1.45] text-ink-secondary-small marker:text-ink-secondary">
            {helpBeforeYouStart.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="text-lg leading-[1.45]">{helpBeforeYouStart.noMoneyLine}</p>
          <HelpLinks
            links={[
              { label: 'Install MetaMask', href: '#install-metamask' },
              { label: 'Add Monad Testnet', href: '#add-monad-testnet' },
            ]}
          />
        </HelpSection>

        <HelpSection id="guides" contentGapClass="gap-14">
          {helpGuides.map((guide) => (
            <HelpGuideView key={guide.id} guide={guide} />
          ))}
        </HelpSection>

        <HelpSection id="answers" contentGapClass="gap-8">
          {helpPlainAnswers.map((answer) => (
            <HelpAnswerView key={answer.id} answer={answer} />
          ))}
        </HelpSection>

        <HelpSection id="something-went-wrong">
          {helpTroubleshootingGroups.map((group) => (
            <div key={group.heading} className="flex flex-col gap-4 pb-4">
              <p className="text-label font-medium tracking-[0.08em] text-ink-secondary-small uppercase">
                {group.heading}
              </p>
              <div className="flex flex-col gap-8">
                {group.answers.map((answer) => (
                  <HelpAnswerView key={answer.id} answer={answer} />
                ))}
              </div>
            </div>
          ))}
        </HelpSection>

        <HelpSection id="lost-wallet">
          {helpLostWalletContent.paragraphs.map((paragraph) => (
            <p key={paragraph} className={paragraphClass}>
              {paragraph}
            </p>
          ))}
          <HelpSteps steps={helpLostWalletContent.steps} />
          <p className="text-lg leading-[1.45]">{helpLostWalletContent.note}</p>
          <HelpLinks links={[{ label: 'Install MetaMask', href: '#install-metamask' }]} />
        </HelpSection>

        <HelpSection id="contact">
          <p className={paragraphClass}>{helpContactContent.intro}</p>
          <a
            href={`mailto:${helpContactContent.supportEmail}`}
            className="inline-flex min-h-11 items-center self-start font-mono text-base break-all underline decoration-hairline underline-offset-4"
          >
            {helpContactContent.supportEmail}
          </a>
          <div className="flex flex-col gap-2">
            <p className="text-lg leading-[1.45]">{helpContactContent.includeHeading}</p>
            <ul className="flex list-disc flex-col gap-1 pl-5 text-lg leading-[1.45] text-ink-secondary-small marker:text-ink-secondary">
              {helpContactContent.includeItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <p className="text-lg leading-[1.45]">{helpContactContent.note}</p>
          <div className="flex flex-col gap-1">
            <p className="text-ink-secondary-small">{helpContactContent.xPrompt}</p>
            <a
              href={helpContactContent.xAccountUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex min-h-11 items-center gap-2 self-start font-mono text-sm"
            >
              <XLogoIcon />
              {helpContactContent.xAccountHandle}
              <ArrowIcon className="transition-transform duration-300 ease-standard group-hover:translate-x-[3px]" />
            </a>
          </div>
        </HelpSection>
      </main>
      <SiteFooter />
    </>
  )
}

/** A section: its title on the left on a laptop, above on a phone. */
function HelpSection({
  id,
  contentGapClass = 'gap-6',
  children,
}: {
  id: HelpTopicId
  contentGapClass?: string
  children: ReactNode
}) {
  const title = helpSections.find((section) => section.id === id)?.title ?? id
  const headingId = `${id}-heading`
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="mt-14 grid gap-6 border-t border-hairline pt-6 md:mt-20 md:grid-cols-12 md:gap-6"
    >
      <h2 id={headingId} className="text-3xl leading-[1.1] tracking-[-0.01em] md:col-span-4">
        {title}
      </h2>
      <div className={`flex min-w-0 flex-col ${contentGapClass} md:col-span-7 md:col-start-6`}>
        {children}
      </div>
    </section>
  )
}

function HelpGuideView({ guide }: { guide: HelpGuide }) {
  return (
    <article id={guide.id} className="help-topic flex flex-col gap-4">
      <h3 className="text-2xl leading-[1.2] tracking-[-0.01em]">{guide.title}</h3>
      {guide.intro !== undefined && <p className={paragraphClass}>{guide.intro}</p>}
      <HelpSteps steps={guide.steps} />
      {guide.hasNetworkSetup === true && <NetworkSetup />}
      {guide.note !== undefined && <p className="text-lg leading-[1.45]">{guide.note}</p>}
      {guide.screenshots !== undefined && <HelpScreenshots items={guide.screenshots} />}
      {guide.links !== undefined && <HelpLinks links={guide.links} />}
    </article>
  )
}

function HelpAnswerView({ answer }: { answer: HelpAnswer }) {
  return (
    <article id={answer.id} className="help-topic flex flex-col gap-3">
      <h3 className="text-xl leading-[1.25]">{answer.question}</h3>
      {answer.paragraphs.map((paragraph) => (
        <p key={paragraph} className={paragraphClass}>
          {paragraph}
        </p>
      ))}
      {answer.steps !== undefined && <HelpSteps steps={answer.steps} />}
      {answer.links !== undefined && <HelpLinks links={answer.links} />}
    </article>
  )
}

function HelpSteps({ steps }: { steps: readonly string[] }) {
  return (
    <ol className="flex flex-col gap-3">
      {steps.map((step, stepIndex) => (
        <li key={step} className="grid grid-cols-[2rem_1fr] gap-x-2 text-lg leading-[1.45]">
          <span className="font-mono text-sm leading-[1.9] text-ink-secondary-small">
            {stepIndex + 1}.
          </span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  )
}

function NetworkSetup() {
  return (
    <div className="flex flex-col gap-5 rounded-panel bg-surface p-4 md:p-5">
      <AddMonadTestnetButton />
      <div className="flex flex-col gap-2">
        <p className="text-label font-medium tracking-[0.08em] text-ink-secondary-small uppercase">
          {helpNetworkSetupContent.detailsHeading}
        </p>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-base">
          {helpNetworkSetupContent.details.map((detail) => (
            <div key={detail.label} className="contents">
              <dt className="text-ink-secondary-small">{detail.label}</dt>
              <dd className="font-mono text-sm leading-[1.6] break-all select-all">
                {detail.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}

function HelpScreenshots({ items }: { items: readonly HelpScreenshot[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <li key={item.kind === 'website' ? item.path : item.screenshotKey}>
          {item.kind === 'website' ? (
            <div className="overflow-hidden rounded-media border border-hairline bg-surface">
              {/* biome-ignore lint/performance/noImgElement: a static export; the WebP is already sized. */}
              <img
                src={item.path}
                alt={item.alt}
                width={378}
                height={770}
                loading="lazy"
                decoding="async"
                className="block h-auto w-full"
              />
            </div>
          ) : (
            <PhoneFrame
              screenshot={screenshots[item.screenshotKey]}
              sizes="(min-width: 768px) 200px, 45vw"
            />
          )}
        </li>
      ))}
    </ul>
  )
}

function HelpLinks({ links }: { links: readonly HelpLink[] }) {
  return (
    <ul className="flex flex-wrap gap-x-6">
      {links.map((link) => {
        const isExternal = link.href.startsWith('http')
        return (
          <li key={link.href}>
            <a
              href={link.href}
              {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className={linkClass}
            >
              {link.label}
              <ArrowIcon className="transition-transform duration-300 ease-standard group-hover:translate-x-[3px]" />
            </a>
          </li>
        )
      })}
    </ul>
  )
}

/** Two answers with one id would break every link to them: refuse to build. */
function assertUniqueHelpTopicIds() {
  const seenIds = new Set<string>()
  for (const helpTopicId of listHelpTopicIds()) {
    if (seenIds.has(helpTopicId)) {
      throw new Error(`Two help topics share the id "${helpTopicId}" (src/content/help.ts)`)
    }
    seenIds.add(helpTopicId)
  }
}
