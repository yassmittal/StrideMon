import type { DesignLayers } from '../art-system/types'

/**
 * The layers a visitor sees on an unlaced pass in the gallery: template, family, colourway and
 * the three option slots. Lace colour only shows once a pass is laced, so it doesn't count.
 */
export const VISIBLE_LAYER_COUNT = 6
/** Any two designs differ in at least two of the layers you can see. */
export const MAX_SHARED_VISIBLE_LAYERS = 4

export function countSharedVisibleLayers(first: DesignLayers, second: DesignLayers): number {
  let sharedLayerCount = 0
  if (first.colorFamilyKey === second.colorFamilyKey) sharedLayerCount++
  if (first.colorwayKey === second.colorwayKey) sharedLayerCount++
  // Option slots belong to their template, so they only match within one template.
  if (first.templateKey !== second.templateKey) return sharedLayerCount
  sharedLayerCount++
  for (const [slotKey, valueKey] of Object.entries(first.optionValueKeys)) {
    if (second.optionValueKeys[slotKey] === valueKey) sharedLayerCount++
  }
  return sharedLayerCount
}
