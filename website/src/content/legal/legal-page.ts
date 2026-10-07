/** A privacy or account page (D-039): plain sections of paragraphs and lists. */
export type LegalBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; items: readonly string[] }

export type LegalSection = {
  heading: string
  blocks: readonly LegalBlock[]
}

export type LegalPageContent = {
  metaLabels: readonly string[]
  title: string
  description: string
  /** ISO date, shown as "Last updated". */
  lastUpdated: string
  intro: string
  sections: readonly LegalSection[]
}
