import { MetaLabel } from './meta-label'

type SectionHeadingProps = {
  id: string
  metaLabels: readonly string[]
  heading: string
  tone?: 'light' | 'dark'
}

export function SectionHeading({ id, metaLabels, heading, tone = 'light' }: SectionHeadingProps) {
  return (
    <div data-reveal className="flex flex-col gap-5">
      <MetaLabel items={metaLabels} tone={tone} />
      <h2 id={id} className="-ml-[0.04em] text-heading text-balance">
        {heading}
      </h2>
    </div>
  )
}
