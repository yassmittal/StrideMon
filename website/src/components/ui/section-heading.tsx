import { MetaLabel } from './meta-label'

type SectionHeadingProps = {
  id: string
  metaLabels: readonly string[]
  heading: string
  tone?: 'light' | 'dark'
  /** `h1` when the section leads its page, as the waitlist does on `/waitlist`. */
  headingLevel?: 'h1' | 'h2'
}

export function SectionHeading({
  id,
  metaLabels,
  heading,
  tone = 'light',
  headingLevel: HeadingTag = 'h2',
}: SectionHeadingProps) {
  return (
    <div data-reveal className="flex flex-col gap-5">
      <MetaLabel items={metaLabels} tone={tone} />
      <HeadingTag id={id} className="-ml-[0.04em] text-heading text-balance">
        {heading}
      </HeadingTag>
    </div>
  )
}
