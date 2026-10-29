type SectionHeadingProps = {
  id: string
  heading: string
  /** `h1` when the section leads its page, as the waitlist does on `/waitlist`. */
  headingLevel?: 'h1' | 'h2'
}

export function SectionHeading({
  id,
  heading,
  headingLevel: HeadingTag = 'h2',
}: SectionHeadingProps) {
  return (
    <HeadingTag data-reveal id={id} className="-ml-[0.04em] text-heading text-balance">
      {heading}
    </HeadingTag>
  )
}
