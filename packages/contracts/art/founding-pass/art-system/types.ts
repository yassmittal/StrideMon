/**
 * A point in Sneaker space: 1000 × 600 units, toe to the right, the ground at y = 520.
 * Every coordinate is a whole number, so the Solidity port can store them as they are.
 */
export type Point = readonly [x: number, y: number]

/** A closed polygon. */
export type Shape = readonly Point[]

/** Panel roles that take a family shade through the colourway. */
export type ShadedRole =
  | 'upper'
  | 'toe'
  | 'overlay'
  | 'heel'
  | 'eyestay'
  | 'collar'
  | 'tongue'
  | 'trim'
  | 'soleAccent'
  | 'outsole'

/** `midsole` is the frame's cream and `ink` the outline colour, in every family. */
export type PanelRole = ShadedRole | 'midsole' | 'ink'

/** One or more polygons drawn in one colour, as one `<path>`. */
export type Panel = { role: PanelRole; shapes: readonly Shape[] }

export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary'

/**
 * Where an option's panels go in the drawing order: `quarter` between the base upper and the
 * framing panels (eyestay, collar, heel), `top` over the whole upper, `sole` over the sole.
 */
export type OptionLayer = 'quarter' | 'top' | 'sole'

export type OptionValue = {
  key: string
  /** Shown in the gallery's filters and the pass's attributes. */
  label: string
  rarity: Rarity
  layer: OptionLayer
  panels: readonly Panel[]
}

type OptionSlot = {
  key: string
  label: string
  values: readonly OptionValue[]
}

/** The straight runs the laces follow, from the collar end to the toe end. */
export type LaceLine = {
  points: readonly Point[]
  eyeletCount: number
}

/** The constant lime heel tab, placed where the collar meets the heel. */
export type HeelTabPlacement = {
  /** Where the tab's base centre sits, on the silhouette. */
  anchor: Point
  /** Clockwise from straight up, in degrees. */
  tiltDegrees: number
}

export type TemplateKey =
  | 'runner'
  | 'racer'
  | 'trail'
  | 'court'
  | 'hoop'
  | 'chunky'
  | 'sock'
  | 'skate'
  | 'spike'
  | 'hiker'

export type SneakerTemplate = {
  key: TemplateKey
  /** The word in a design's name: "Ember Runner Dusk". */
  label: string
  /** One line on what the shoe is, for the README and the gallery. */
  description: string
  silhouette: Shape
  /**
   * Back to front, clipped to the silhouette, so a panel only needs its inner edges right and
   * can overshoot the outline. Upper panels can also run under the sole.
   */
  upperPanels: readonly Panel[]
  /** Eyestay, collar, heel counter: drawn over the `quarter` options. */
  framingPanels: readonly Panel[]
  solePanels: readonly Panel[]
  /** Small light shards that only the metallic families draw, for a flat sheen. */
  sheenShapes: readonly Shape[]
  laceLine: LaceLine
  heelTab: HeelTabPlacement
  optionSlots: readonly OptionSlot[]
}

export type ShadeIndex = 0 | 1 | 2 | 3 | 4

/** Five shades from light to dark. */
type ShadeRamp = readonly [string, string, string, string, string]

export type ColorFamilyKey =
  | 'ember'
  | 'cherry'
  | 'rose'
  | 'plum'
  | 'cobalt'
  | 'ocean'
  | 'lagoon'
  | 'jade'
  | 'moss'
  | 'lime'
  | 'clay'
  | 'gold'
  | 'chrome'
  | 'prism'

export type ColorFamily = {
  key: ColorFamilyKey
  label: string
  rarity: Rarity
  shades: ShadeRamp
  /** Gold and Chrome only: the colour of the flat sheen shards on the toe and heel. */
  sheenColor: string | null
}

export type Colorway = {
  key: string
  /** The last word of a design's name: "Ember Runner Dusk". */
  label: string
  shadeByRole: Readonly<Record<ShadedRole, ShadeIndex>>
}

export type LaceColorKey = 'cream' | 'ink' | 'tonal' | 'lime'

export type LaceColor = {
  key: LaceColorKey
  label: string
  rarity: Rarity
}

/** One of the 1,000 designs: a template, a colour family, a colourway and one value per slot. */
export type DesignLayers = {
  templateKey: TemplateKey
  colorFamilyKey: ColorFamilyKey
  colorwayKey: string
  /** Option slot key → value key, one entry per slot of the template. */
  optionValueKeys: Readonly<Record<string, string>>
  laceColorKey: LaceColorKey
}

export type LacingStage = 'unlaced' | 'laced'

/** One row of the collection: what the frozen design table will hold for each number. */
export type Design = {
  /** 1 to 1,000. The token id is the design number. */
  designNumber: number
  layers: DesignLayers
  /** "Ember Runner Dusk": family, template, colourway. Unique across the collection. */
  name: string
  rarity: Rarity
}
