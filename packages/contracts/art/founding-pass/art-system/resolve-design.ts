import type { SneakerArtwork } from '../render-sneaker'
import { readColorFamily } from './color-families'
import { readColorway } from './colorways'
import { readLaceColor } from './lace-colors'
import { readSneakerTemplate } from './templates'
import type { DesignLayers, LacingStage, OptionValue, Rarity, SneakerTemplate } from './types'

const RARITY_ORDER: readonly Rarity[] = ['common', 'uncommon', 'rare', 'legendary']

/** Turns a design's layer keys into everything the renderer draws. */
export function resolveSneakerArtwork(
  layers: DesignLayers,
  lacingStage: LacingStage,
): SneakerArtwork {
  const template = readSneakerTemplate(layers.templateKey)
  return {
    template,
    colorFamily: readColorFamily(layers.colorFamilyKey),
    colorway: readColorway(layers.colorwayKey),
    optionValues: readOptionValues(template, layers.optionValueKeys),
    laceColor: readLaceColor(layers.laceColorKey),
    lacingStage,
  }
}

/** "Ember Runner Dusk". Unique because no two designs share a template, family and colourway. */
export function buildDesignName(layers: DesignLayers): string {
  const template = readSneakerTemplate(layers.templateKey)
  const colorFamily = readColorFamily(layers.colorFamilyKey)
  const colorway = readColorway(layers.colorwayKey)
  return `${colorFamily.label} ${template.label} ${colorway.label}`
}

/** A pass is as rare as its rarest layer. */
export function calculateDesignRarity(layers: DesignLayers): Rarity {
  const template = readSneakerTemplate(layers.templateKey)
  const layerRarities = [
    readColorFamily(layers.colorFamilyKey).rarity,
    readLaceColor(layers.laceColorKey).rarity,
    ...readOptionValues(template, layers.optionValueKeys).map((optionValue) => optionValue.rarity),
  ]
  return layerRarities.reduce((rarest, rarity) =>
    RARITY_ORDER.indexOf(rarity) > RARITY_ORDER.indexOf(rarest) ? rarity : rarest,
  )
}

export function compareRarity(first: Rarity, second: Rarity): number {
  return RARITY_ORDER.indexOf(first) - RARITY_ORDER.indexOf(second)
}

function readOptionValues(
  template: SneakerTemplate,
  optionValueKeys: Readonly<Record<string, string>>,
): OptionValue[] {
  return template.optionSlots.map((optionSlot) => {
    const optionValue = optionSlot.values.find(
      (candidate) => candidate.key === optionValueKeys[optionSlot.key],
    )
    if (optionValue === undefined) {
      throw new Error(
        `${template.key} has no value "${optionValueKeys[optionSlot.key]}" for ${optionSlot.key}`,
      )
    }
    return optionValue
  })
}
