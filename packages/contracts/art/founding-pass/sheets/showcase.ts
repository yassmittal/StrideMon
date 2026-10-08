import { readColorFamily } from '../art-system/color-families'
import { readColorway } from '../art-system/colorways'
import type { ColorFamilyKey, DesignLayers, SneakerTemplate } from '../art-system/types'
import type {
  CardRequest,
  RenderedArt,
  SneakerPictureRequest,
  SneakerRequest,
} from './rendered-art'

/**
 * One file in previews/: what it asks the Solidity renderer to draw, and how it lays that out
 * once drawn.
 */
export type PreviewPlan = {
  fileName: string
  pngWidthPixels: number
  cardRequests: readonly CardRequest[]
  sneakerRequests: readonly SneakerRequest[]
  /** Only the Founder Sneaker files draw whole Sneaker pictures. */
  sneakerPictureRequests?: readonly SneakerPictureRequest[]
  composeSvg: (renderedArt: RenderedArt) => string
}

/** The family and colourway the template and option sheets use, so only the shapes change. */
const SHOWCASE_FAMILY_KEY: ColorFamilyKey = 'ember'
export const SHOWCASE_COLORWAY_KEY = 'day'

const DESIGN_NUMBER_DIGITS = 4

/** A Sneaker in the showcase family and colourway, with each slot's first value and cream laces. */
export function buildShowcaseLayers({
  template,
  colorFamilyKey = SHOWCASE_FAMILY_KEY,
  colorwayKey = SHOWCASE_COLORWAY_KEY,
  optionValueKeys = readFirstValueKeys(template),
}: {
  template: SneakerTemplate
  colorFamilyKey?: ColorFamilyKey
  colorwayKey?: string
  optionValueKeys?: Readonly<Record<string, string>>
}): DesignLayers {
  return {
    templateKey: template.key,
    colorFamilyKey,
    colorwayKey,
    optionValueKeys,
    laceColorKey: 'cream',
  }
}

export function readFirstValueKeys(template: SneakerTemplate): Record<string, string> {
  return Object.fromEntries(
    template.optionSlots.map((optionSlot) => {
      const [firstValue] = optionSlot.values
      if (firstValue === undefined) throw new Error(`${template.key}.${optionSlot.key} is empty`)
      return [optionSlot.key, firstValue.key]
    }),
  )
}

export function formatDesignNumber(designNumber: number): string {
  return String(designNumber).padStart(DESIGN_NUMBER_DIGITS, '0')
}

/** "EMBER DAY": the showcase family and colourway, as sheet titles show them. */
export function formatShowcaseLook(): string {
  const colorFamily = readColorFamily(SHOWCASE_FAMILY_KEY)
  const colorway = readColorway(SHOWCASE_COLORWAY_KEY)
  return `${colorFamily.label} ${colorway.label}`.toUpperCase()
}
