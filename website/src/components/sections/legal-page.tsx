import type { LegalBlock, LegalPageContent } from '@/content/legal/legal-page'
import { MetaLabel } from '../ui/meta-label'
import { SiteFooter } from './site-footer'
import { SiteHeader } from './site-header'

type LegalPageProps = {
  content: LegalPageContent
}

const lastUpdatedFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

/** The privacy policy and delete-account pages (D-039): one readable column, no motion. */
export function LegalPage({ content }: LegalPageProps) {
  return (
    <>
      <SiteHeader />
      <main className="page-gutter page-container pt-10 pb-16 md:pt-16 md:pb-24">
        <article className="flex max-w-[44rem] flex-col gap-10">
          <header className="flex flex-col gap-5">
            <MetaLabel items={content.metaLabels} />
            <h1 className="-ml-[0.04em] text-heading text-balance">{content.title}</h1>
            <p className="text-label font-medium tracking-[0.08em] text-ink-secondary-small uppercase">
              Last updated{' '}
              <time dateTime={content.lastUpdated}>
                {lastUpdatedFormat.format(new Date(content.lastUpdated))}
              </time>
            </p>
            <p className="text-intro">{content.intro}</p>
          </header>
          {content.sections.map((section) => (
            <section
              key={section.heading}
              className="flex flex-col gap-4 border-t border-hairline pt-6"
            >
              <h2 className="text-2xl tracking-[-0.01em]">{section.heading}</h2>
              {section.blocks.map((block) => (
                <LegalBlockView key={readBlockKey(block)} block={block} />
              ))}
            </section>
          ))}
        </article>
      </main>
      <SiteFooter />
    </>
  )
}

function LegalBlockView({ block }: { block: LegalBlock }) {
  if (block.kind === 'paragraph') {
    return <p className="text-lg leading-[1.5] text-ink-secondary-small">{block.text}</p>
  }
  return (
    <ul className="flex list-disc flex-col gap-2 pl-5 text-lg leading-[1.5] text-ink-secondary-small marker:text-ink-secondary">
      {block.items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

function readBlockKey(block: LegalBlock): string {
  return block.kind === 'paragraph' ? block.text : block.items.join('|')
}
