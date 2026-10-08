/** A design's rarity label: cosmetic, never "worth more" (brief §9). */
export type FoundingPassRarity = 'common' | 'uncommon' | 'rare' | 'legendary'

/** One of the 1,000 frozen Founding Pass designs, as the art generator wrote it (D-041). */
export type FoundingPassDesign = {
  /** 1 to 1,000: the pass's token id. */
  designNumber: number
  /** "Ember Runner Dusk", or a Legendary's hand-picked name. */
  name: string
  rarity: FoundingPassRarity
  templateKey: string
  colorFamilyKey: string
  colorwayKey: string
  /** The template's option slots, slot key → value key (for example `{ shaft: 'plain' }`). */
  optionValueKeys: Readonly<Record<string, string>>
  laceColorKey: string
}
